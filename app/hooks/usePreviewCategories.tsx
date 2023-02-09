"use client";
import { usePreview } from "@/lib/sanity.preview";
import { groq } from "next-sanity";

async function usePreviewCategories() {
    const queryPreview = groq`
    *[_type=='post'] {
        ...,
        categories[]->
    } | order(publishedAt desc)`;

    return await usePreview(null, queryPreview);
}

export default usePreviewCategories;
