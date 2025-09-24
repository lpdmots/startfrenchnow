import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Post } from "@/app/types/sfn/blog";
import PrimaryPost from "@/app/components/sfn/blog/PrimaryPost";
import { AiOutlineArrowRight } from "react-icons/ai";
import PostContent from "@/app/components/sfn/post/PostContent";
import { ParentToChildrens } from "@/app/components/animations/ParentToChildrens";
import { useLocale, useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { Locale } from "@/i18n";
import BlogLangFixedButton from "@/app/components/sfn/blog/BlogLangFixedButton";
import { localizePosts } from "@/app/lib/utils";
import Link from "next-intl/link";

const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
        }
    `;
const queryLatest = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true] 
    {
        ...,
    } | order(publishedAt desc) [0...3]
`;

async function Post({ params }: { params: { locale: Locale; slug: string } }) {
    const { locale, slug } = params;
    const postData: Promise<Post> = client.fetch(query, { slug });
    const rowLatestPostsData: Promise<Post[]> = client.fetch(queryLatest);
    const [post, rowLatestPosts] = await Promise.all([postData, rowLatestPostsData]);

    const latestPostsRaw = rowLatestPosts.filter((post) => post.slug.current !== slug) as Post[];

    if (!post) return <p className="h-64 flex justify-center items-center">Sorry this post has been deleted...</p>;

    const localizedPost = localizePosts([post], locale)[0];
    const latestPosts = localizePosts(
        latestPostsRaw.filter((p) => p.slug.current !== slug),
        locale
    );

    return <PostNoAsync post={localizedPost} latestPosts={latestPosts} />;
}

export default Post;

interface PropsNoAsync {
    post: Post;
    latestPosts: Post[];
}

const PostNoAsync = ({ post, latestPosts }: PropsNoAsync) => {
    const locale = useLocale();
    const t = useTranslations(`Blog.Post`);

    return (
        <>
            <PostContent post={post} />
            <div className="page-wrapper">
                <div className="section pd-top-0 wf-section">
                    <div className="container-default w-container">
                        <div className="inner-container _500px---mbl center">
                            <div className="mg-bottom-40px">
                                <div className="text-center---mbl">
                                    <div className="w-layout-grid grid-2-columns title-and-buttons">
                                        <h2 className="display-2 mg-bottom-0">{t.rich("latestPosts", intelRich())}</h2>
                                        <Link href="/blog" className="btn-secondary w-button">
                                            <span className="flex items-center">
                                                {t("browseAllPosts")}
                                                <AiOutlineArrowRight className="ml-2" />
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="w-dyn-list">
                                <div role="list" className="grid-2-columns blog-post-section---grid w-dyn-items">
                                    {latestPosts.slice(0, 2).map((post) => (
                                        <ParentToChildrens key={post.title}>
                                            <PrimaryPost post={post} locale={locale} />
                                        </ParentToChildrens>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BlogLangFixedButton />
        </>
    );
};
