"use client";

import { usePreview } from "../../../lib/sanity.preview";
import BlogList from "../blog/BlogList";

type props = {
    query: string;
};

export default function PreviewBlogListe({ query }: props) {
    const posts = usePreview(null, query);

    return <BlogList posts={posts} />;
}
