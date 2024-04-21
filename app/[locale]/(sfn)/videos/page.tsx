//import { previewData } from "next/headers";
import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
//import PreviewSuspense from "../../../components/sanity/PreviewSuspense";
//import PreviewBlogListe from "../../../components/sanity/PreviewBlogList";
import BlogList from "@/app/components/sfn/blog/BlogList";
import { Post } from "@/app/types/sfn/blog";
import { useLocale, useTranslations } from "next-intl";
import { BlogLangButton } from "@/app/components/sfn/blog/BlogLangButton";
import VideoList from "@/app/components/sfn/videos/VideoList";

const query = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true && defined(mainVideo.url) && mainVideo.url != ''] { 
        ...,
    } | order(publishedAt desc)
`;

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
    const postsData: Post[] = await client.fetch(query);
    return <VideosNoAsync postsData={postsData} searchParams={searchParams} />;
}

const VideosNoAsync = ({ postsData, searchParams }: { postsData: Post[]; searchParams: { postLang: "fr" | "en" } }) => {
    const locale = useLocale();
    const postLang = searchParams.postLang ? searchParams.postLang : ["fr", "en"].includes(locale) ? (locale as "fr" | "en") : "en";
    const isForcedLang = locale !== postLang;
    const posts = postsData.filter((post) => postLang === post.langage || post.langage === "both" || post.langage === undefined);

    const t = useTranslations("Blog.BlogLangButton");
    const messages = {
        title: t("title"),
        message: t("message"),
        okString: t("okString"),
    };

    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            {isForcedLang && <BlogLangButton messages={messages} postLang={postLang} />}
            <VideoList posts={posts} postLang={postLang} />
        </div>
    );
};
