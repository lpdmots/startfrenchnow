"use client";

import { groq } from "next-sanity";
import { usePreview } from "@/app/lib/sanity.preview";
import BlogList from "../sfn/blog/BlogList";
import NewsletterBand from "../common/newsletter/NewsletterBand";
import PostsList from "../sfn/post/PostList";

export default function PreviewBlogListe({ categories }: { categories: any[] }) {
    const query = groq`
    *[_type=='post'] {
        ...,
        categories[]->
    } | order(publishedAt desc)
`;
    const posts = usePreview(null, query);

    return null;
}

/* return (
    <div className="page-wrapper">
        <BlogList posts={posts} />
        <NewsletterBand />
        <PostsList posts={posts} categories={categories} />
    </div>
); */
