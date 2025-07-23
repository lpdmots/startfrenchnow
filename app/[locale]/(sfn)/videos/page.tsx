//import { previewData } from "next/headers";
//import PreviewSuspense from "../../../components/sanity/PreviewSuspense";
//import PreviewBlogListe from "../../../components/sanity/PreviewBlogList";
import { Post } from "@/app/types/sfn/blog";
import { useLocale, useTranslations } from "next-intl";
import { BlogLangButton } from "@/app/components/sfn/blog/BlogLangButton";
import { PostsListInfiniteScroll } from "@/app/components/sfn/post/PostsListInfiniteScroll";
import { getVideosPostsSlice } from "@/app/serverActions/blogActions";
import { NUMBER_OF_POSTS_TO_FETCH } from "@/app/lib/constantes";
import { intelRich } from "@/app/lib/intelRich";

export const revalidate = 60;

/* export async function generateStaticParams() {
    const query = groq`*[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true]
    {
        slug
    }`;

    const slugs: Post[] = await client.fetch(query);
    const slugRoutes = slugs.map((slug) => slug.slug.current);

    return slugRoutes.map((slug) => ({ slug }));
} */

export default async function Videos({ searchParams }: { searchParams: { postLang: "en" | "fr" } }) {
    const postsData: Post[] = await getVideosPostsSlice(0, NUMBER_OF_POSTS_TO_FETCH);
    return <VideosNoAsync postsData={postsData} searchParams={searchParams} />;
}

const VideosNoAsync = ({ postsData, searchParams }: { postsData: Post[]; searchParams: { postLang: "fr" | "en" } }) => {
    const locale = useLocale();
    const postLang = searchParams.postLang ? searchParams.postLang : ["fr", "en"].includes(locale) ? (locale as "fr" | "en") : "en";
    const isForcedLang = locale !== postLang;
    const posts = postsData.filter((post) => postLang === post.langage || post.langage === "both" || post.langage === undefined);

    const tv = useTranslations("Videos.VideoList");
    const t = useTranslations("Blog.BlogLangButton");
    const messages = {
        title: t("title"),
        message: t("message"),
        okString: t("okString"),
    };

    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            {isForcedLang && <BlogLangButton messages={messages} postLang={postLang} />}
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center mb-8">
                            <div className="inner-container _725px center---full-width-mbl">
                                <div className="text-center mg-bottom-40px">
                                    <h1 className="display-1 mg-bottom-8px mb-8">{tv.rich("title", intelRich())}</h1>
                                    <p className="mg-bottom-0">{tv.rich("description", intelRich())}</p>
                                </div>
                            </div>
                            <PostsListInfiniteScroll initialPosts={posts} postLang={postLang} category="video" locale={locale} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
