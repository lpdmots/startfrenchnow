"use client";

import { Category } from "@/app/types/sfn/blog";
import { groq } from "next-sanity";
import { usePreview } from "@/app/lib/sanity.preview";
import BlogList from "../sfn/blog/BlogList";
import NewsletterBand from "../common/NewsletterBand";
import PostsList from "../sfn/post/PostList";

export default function PreviewBlogListe({ categories }: { categories: Category[] }) {
    const query = groq`
    *[_type=='post'] {
        ...,
        categories[]->
    } | order(publishedAt desc)
`;
    const posts = usePreview(null, query);

    return (
        <div className="page-wrapper">
            <BlogList posts={posts} />
            <NewsletterBand />
            <PostsList posts={posts} categories={categories} />
        </div>
    );
}
