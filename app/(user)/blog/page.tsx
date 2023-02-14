import { previewData } from "next/headers";
import { groq } from "next-sanity";
import { client } from "../../../lib/sanity.client";
import PreviewSuspense from "../../components/sanity/PreviewSuspense";
import PreviewBlogListe from "../../components/sanity/PreviewBlogList";
import BlogList from "../../components/blog/BlogList";
import { Category, Post } from "../../types/blog";
import PostsList from "@/app/components/post/PostList";
import CategoriesBand from "@/app/components/blog/CategoriesBand";
import Marquee from "@/app/components/animations/Marquee";

const query = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now())] {
        ...,
        categories[]->
    } | order(publishedAt desc)
`;

const queryCategories = groq`
    *[_type=='category'] {title, slug, description} | order(title asc)
`;

export const revalidate = 60;

export async function generateStaticParams() {
    const query = groq`*[_type=='post' && dateTime(publishedAt) < dateTime(now())]
    {
        slug
    }`;

    const slugs: Post[] = await client.fetch(query);
    const slugRoutes = slugs.map((slug) => slug.slug.current);

    return slugRoutes.map((slug) => ({ slug }));
}

export default async function Blog() {
    const postsData: Promise<Post[]> = client.fetch(query);
    const categoriesData: Promise<Category[]> = client.fetch(queryCategories);

    const [posts, categories] = await Promise.all([postsData, categoriesData]);

    return previewData() ? (
        <PreviewSuspense
            fallback={
                <div role="status">
                    <p className="animate-pulse text-primary">Chargement de l'apperçu</p>
                </div>
            }
        >
            <PreviewBlogListe categories={categories} />
        </PreviewSuspense>
    ) : (
        <div className="page-wrapper">
            <BlogList posts={posts} />
            <Marquee content={<CategoriesBand />} />
            <PostsList posts={posts} categories={categories} />
        </div>
    );
}
