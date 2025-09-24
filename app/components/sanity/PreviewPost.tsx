"use client";

import { usePreview } from "@/app/lib/sanity.preview";

type props = {
    query: string;
    slug: string;
};

export default function PreviewBlogListe({ query, slug }: props) {
    const post = usePreview(null, query, { slug });

    return null;
}

/* <PostContent post={post} /> */
