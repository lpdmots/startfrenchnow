import { groq } from "next-sanity";
import { client } from "../../../../../../lib/sanity.client";
import { Category, Post } from "../../../../../types/sfn/blog";
import { previewData } from "next/headers";
import PreviewSuspense from "../../../../../components/sanity/PreviewSuspense";
import Categories from "@/app/components/sfn/category/Categories";
import PreviewCategories from "@/app/components/sanity/PreviewCategories";

type Props = {
    params: {
        slug: string;
    };
};

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

async function page({ params: { slug } }: Props) {
    const allPosts: Post[] = await client.fetch(query);
    const categories: Category[] = await client.fetch(queryCategories);

    return previewData() ? (
        <PreviewSuspense
            fallback={
                <div role="status">
                    <p className="animate-pulse text-primary">Chargement de l'apperçu</p>
                </div>
            }
        >
            <PreviewCategories categories={categories} slug={slug} />
        </PreviewSuspense>
    ) : (
        <Categories allPosts={allPosts} slug={slug} categories={categories} />
    );
}

export default page;
