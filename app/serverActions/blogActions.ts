"use server";
import { BLOGCATEGORIES } from "../lib/constantes";
import { SanityServerClient as client } from "../lib/sanity.clientServerDev";
import { groq } from "next-sanity";

const query = groq`
    *[_type=='post' 
    && dateTime(publishedAt) < dateTime(now()) 
    && isReady == true
    && count(categories[@ in $categories]) > 0
    ] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        slug,
        title,
        title_en,
        description,
        description_en,
        metaDescription,
        metaDescription_en,
        body,
        body_en,
        categories,
        mainImage,
        mainVideo,
        level,
        publishedAt,
        isPreview,
        durationSec,
        isReady
    } | order(publishedAt desc)
    [$offset...$limit]
`;

export const getPostsSlice = async (offset: number, limit: number) => {
    return await client.fetch(query, { offset, limit, categories: BLOGCATEGORIES });
};

const queryOnlyCategory = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true && $category in categories] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        slug,
        title,
        title_en,
        description,
        description_en,
        metaDescription,
        metaDescription_en,
        body,
        body_en,
        categories,
        mainImage,
        mainVideo,
        level,
        publishedAt,
        isPreview,
        durationSec,
        isReady
    } | order(publishedAt desc)
    [$offset...$limit]
`;

export const getCategoryPostsSlice = async (category: string, offset: number, limit: number) => {
    return await client.fetch(queryOnlyCategory, { category, offset, limit });
};

const queryOnlyVideos = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true && defined(mainVideo.url) && mainVideo.url != '' && count(categories[@ in $categories]) > 0] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        slug,
        title,
        title_en,
        description,
        description_en,
        metaDescription,
        metaDescription_en,
        body,
        body_en,
        categories,
        mainImage,
        mainVideo,
        level,
        publishedAt,
        isPreview,
        durationSec,
        isReady
    } | order(publishedAt desc)
    [$offset...$limit]
`;

export const getVideosPostsSlice = async (offset: number, limit: number) => {
    return await client.fetch(queryOnlyVideos, { offset, limit, categories: BLOGCATEGORIES });
};
