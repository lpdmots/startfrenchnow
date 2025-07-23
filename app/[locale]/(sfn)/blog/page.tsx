import { Post } from "@/app/types/sfn/blog";
import PostsList from "@/app/components/sfn/post/PostList";
import { useLocale, useTranslations } from "next-intl";
import { BlogLangButton } from "@/app/components/sfn/blog/BlogLangButton";
import { getPostsSlice } from "@/app/serverActions/blogActions";
import { ParentToChildrens } from "@/app/components/animations/ParentToChildrens";
import SecondaryPost from "@/app/components/sfn/blog/SecondaryPost";
import { NUMBER_OF_POSTS_TO_FETCH } from "@/app/lib/constantes";

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

export default async function Blog({ searchParams }: { searchParams: { postLang: "en" | "fr" } }) {
    const postsData: Post[] = await getPostsSlice(0, NUMBER_OF_POSTS_TO_FETCH);
    return <BlogNoAsync postsData={postsData} searchParams={searchParams} />;
}

const BlogNoAsync = ({ postsData, searchParams }: { postsData: Post[]; searchParams: { postLang: "fr" | "en" } }) => {
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
            <PostsList postLang={postLang} initialPosts={posts} />
        </div>
    );
};
