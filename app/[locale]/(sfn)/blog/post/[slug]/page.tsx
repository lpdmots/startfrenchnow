import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Post } from "@/app/types/sfn/blog";
import PrimaryPost from "@/app/components/sfn/blog/PrimaryPost";
import { AiOutlineArrowRight } from "react-icons/ai";
import PostContent from "@/app/components/sfn/post/PostContent";
import { ParentToChildrens } from "@/app/components/animations/ParentToChildrens";
import { useLocale, useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { LinkBlog } from "@/app/components/sfn/blog/LinkBlog";
import { Locale } from "@/i18n";
import BlogLangFixedButton from "@/app/components/sfn/blog/BlogLangFixedButton";

type Props = {
    params: {
        slug: string;
    };
    searchParams: { postLang: "en" | "fr" };
};

export const revalidate = 60;

/* export async function generateStaticParams() {
    const query = groq`*[_type=='post']
    {
        slug
    }`;

    const slugs: Post[] = await client.fetch(query);
    const slugRoutes = slugs.map((slug) => slug.slug.current);

    return slugRoutes.map((slug) => ({ slug }));
} */

const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
            author->,
        }
    `;
const queryLatest = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && langage == 'both' && isReady == true] 
    {
        ...,
    } | order(publishedAt desc) [0...3]
`;

// Vérifier si la langue correspond au post
// Récupérer les derniers posts correspondant à la langue.

async function Post({ params: { slug }, searchParams }: Props) {
    const postData: Promise<Post> = client.fetch(query, { slug });
    const rowLatestPostsData: Promise<Post[]> = client.fetch(queryLatest);
    const [post, rowLatestPosts] = await Promise.all([postData, rowLatestPostsData]);

    const latestPosts = rowLatestPosts.filter((post) => post.slug.current !== slug);

    if (!post) return <p className="h-64 flex justify-center items-center">Sorry this post has been deleted...</p>;

    return <PostNoAsync post={post} latestPosts={latestPosts} searchParams={searchParams} />;
}

export default Post;

interface PropsNoAsync {
    searchParams: { postLang: "en" | "fr" };
    post: Post;
    latestPosts: Post[];
}

const PostNoAsync = ({ post, latestPosts, searchParams }: PropsNoAsync) => {
    const locale = useLocale();
    const postLang = searchParams.postLang ? searchParams.postLang : ["fr", "en"].includes(locale) ? (locale as "fr" | "en") : "en";
    const isForcedLang = locale !== postLang;
    const t = useTranslations(`Blog.Post`);

    return (
        <>
            <PostContent post={post} postLang={postLang} isForcedLang={isForcedLang} />
            <div className="page-wrapper">
                <div className="section pd-top-0 wf-section">
                    <div className="container-default w-container">
                        <div className="inner-container _500px---mbl center">
                            <div className="mg-bottom-40px">
                                <div className="text-center---mbl">
                                    <div className="w-layout-grid grid-2-columns title-and-buttons">
                                        <h2 className="display-2 mg-bottom-0">{t.rich("latestPosts", intelRich())}</h2>
                                        <LinkBlog href="/blog" className="btn-secondary w-button" locale={locale as Locale}>
                                            <span className="flex items-center">
                                                {t("browseAllPosts")}
                                                <AiOutlineArrowRight className="ml-2" />
                                            </span>
                                        </LinkBlog>
                                    </div>
                                </div>
                            </div>
                            <div className="w-dyn-list">
                                <div role="list" className="grid-2-columns blog-post-section---grid w-dyn-items">
                                    {latestPosts.slice(0, 2).map((post) => (
                                        <ParentToChildrens key={post.title}>
                                            <PrimaryPost post={post} postLang={postLang} locale={locale} />
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
