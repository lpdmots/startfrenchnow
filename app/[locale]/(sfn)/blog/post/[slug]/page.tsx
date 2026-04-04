import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import type { Post as BlogPost } from "@/app/types/sfn/blog";
import PrimaryPost from "@/app/components/sfn/blog/PrimaryPost";
import { AiOutlineArrowRight } from "react-icons/ai";
import PostContent from "@/app/components/sfn/post/PostContent";
import { ParentToChildrens } from "@/app/components/animations/ParentToChildrens";
import { useLocale, useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { Locale } from "@/i18n";
import BlogFideFloatingHelp from "@/app/components/sfn/post/BlogFideFloatingHelp";
import BlogContactFloatingHelp from "@/app/components/sfn/post/BlogContactFloatingHelp";
import BlogLangFixedButton from "@/app/components/sfn/blog/BlogLangFixedButton";
import { localizePosts } from "@/app/lib/utils";
import { Link } from "@/i18n/navigation";
import { BLOGCATEGORIES } from "@/app/lib/constantes";
import CommentList from "@/app/components/comments/CommentList";
import CommentComposer from "@/app/components/comments/CommentComposer";

export const revalidate = 86400;

const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
        }
    `;
const querySlugs = groq`
    *[
      _type == 'post'
      && dateTime(publishedAt) < dateTime(now())
      && isReady == true
      && defined(slug.current)
      && count(categories[@ in $categories]) > 0
    ]{
      "slug": slug.current
    }
`;
const queryLatest = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true && count(categories[@ in $categories]) > 0] 
    {
        ...,
    } | order(publishedAt desc) [0...3]
`;

export async function generateStaticParams() {
    const posts = await client.fetch<{ slug: string }[]>(querySlugs, {
        categories: BLOGCATEGORIES,
    });

    return posts.map((post) => ({ slug: post.slug }));
}

async function Post({ params }: { params: { locale: Locale; slug: string } }) {
    const { locale, slug } = params;
    const postData: Promise<BlogPost> = client.fetch(query, { slug });
    const rowLatestPostsData: Promise<BlogPost[]> = client.fetch(queryLatest, { categories: BLOGCATEGORIES });
    const [post, rowLatestPosts] = await Promise.all([postData, rowLatestPostsData]);

    const latestPostsRaw = rowLatestPosts.filter((post) => post.slug.current !== slug) as BlogPost[];

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
    post: BlogPost;
    latestPosts: BlogPost[];
}

const PostNoAsync = ({ post, latestPosts }: PropsNoAsync) => {
    const locale = useLocale();
    const t = useTranslations(`Blog.Post`);
    const firstCategory = post.categories?.[0] || "tips";
    const isBlogCategory = BLOGCATEGORIES.includes(firstCategory);

    return (
        <>
            <PostContent post={post} />
            <div className="w-full flex items-center flex-col gap-4 m-auto max-w-7xl my-8 pb-12 md:pb-24 ">
                <CommentComposer resourceType="blog" resourceId={post._id} />
                <CommentList resourceType="blog" resourceId={post._id} locale={locale as Locale} />
            </div>
            <div className="page-wrapper">
                <div className="section pd-top-0 wf-section">
                    <div className="container-default w-container">
                        <div className="inner-container _500px---mbl center">
                            <div className="mg-bottom-40px">
                                <div className="max-md:text-center">
                                    <div className="w-layout-grid grid-2-columns gap-x-[40px] gap-y-[30px] [grid-template-columns:1fr_auto] max-[991px]:[grid-template-columns:1fr] max-[767px]:[grid-template-columns:1fr]">
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
                                <div role="list" className="grid-2-columns items-stretch gap-x-[40px] max-[991px]:gap-x-[20px] w-dyn-items">
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
            {firstCategory === "fide" ? (
                <BlogFideFloatingHelp firstCategory={firstCategory} hasMainVideo={!!post.mainVideo} />
            ) : isBlogCategory ? (
                <BlogContactFloatingHelp firstCategory={firstCategory} hasMainVideo={!!post.mainVideo} />
            ) : (
                <BlogLangFixedButton />
            )}
        </>
    );
};
