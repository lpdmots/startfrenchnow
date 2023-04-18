"use client";

import { usePreview } from "@/app/lib/sanity.preview";
import PostContent from "../sfn/post/PostContent";

type props = {
    query: string;
    slug: string;
};

export default function PreviewBlogListe({ query, slug }: props) {
    const post = usePreview(null, query, { slug });

    return <PostContent post={post} />;
}
