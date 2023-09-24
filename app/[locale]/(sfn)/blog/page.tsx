//import { previewData } from "next/headers";
import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
//import PreviewSuspense from "../../../components/sanity/PreviewSuspense";
//import PreviewBlogListe from "../../../components/sanity/PreviewBlogList";
import BlogList from "@/app/components/sfn/blog/BlogList";
import { Post } from "@/app/types/sfn/blog";
import PostsList from "@/app/components/sfn/post/PostList";
import CategoriesBand from "@/app/components/sfn/blog/CategoriesBand";
import Marquee from "@/app/components/animations/Marquee";
import { useLocale, useTranslations } from "next-intl";
import { BlogLangButton } from "@/app/components/sfn/blog/BlogLangButton";

const query = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now())] {
        ...,
    } | order(publishedAt desc)
`;

export const revalidate = 60;

/* export async function generateStaticParams() {
    const query = groq`*[_type=='post' && dateTime(publishedAt) < dateTime(now())]
    {
        slug
    }`;

    const slugs: Post[] = await client.fetch(query);
    const slugRoutes = slugs.map((slug) => slug.slug.current);

    return slugRoutes.map((slug) => ({ slug }));
} */

export default async function Blog({ searchParams }: { searchParams: { postLang: "en" | "fr" } }) {
    const postsData: Post[] = await client.fetch(query);
    return <BlogNoAsync postsData={postsData} searchParams={searchParams} />;
}

const BlogNoAsync = ({ postsData, searchParams }: { postsData: Post[]; searchParams: { postLang: "fr" | "en" } }) => {
    const locale = useLocale();
    const postLang = searchParams.postLang ? searchParams.postLang : ["fr", "en"].includes(locale) ? (locale as "fr" | "en") : "en";
    const isForcedLang = locale !== postLang;
    const posts = postsData.filter((post) => postLang === post.langage || post.langage === "both");

    const t = useTranslations("Blog.BlogLangButton");
    const messages = {
        title: t("title"),
        message: t("message"),
        okString: t("okString"),
    };

    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            {isForcedLang && <BlogLangButton messages={messages} postLang={postLang} />}
            <BlogList posts={posts} postLang={postLang} />
            <Marquee content={<CategoriesBand />} />
            <PostsList posts={posts} postLang={postLang} />
        </div>
    );
};
