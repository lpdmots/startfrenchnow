"use client";

import { Category } from "@/app/types/sfn/blog";
import { groq } from "next-sanity";
import { usePreview } from "../../../lib/sanity.preview";
import Categories from "../sfn/category/Categories";

export default function PreviewCategories({ categories, slug }: { categories: Category[]; slug: string }) {
    const query = groq`
    *[_type=='post'] {
        ...,
        categories[]->
    } | order(publishedAt desc)
`;
    const allPosts = usePreview(null, query);

    return <Categories allPosts={allPosts} slug={slug} categories={categories} />;
}
