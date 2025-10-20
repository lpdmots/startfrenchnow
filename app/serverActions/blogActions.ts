"use server";
import { SanityServerClient as client } from "../lib/sanity.clientServerDev";
import { groq } from "next-sanity";

const query = groq`
    *[_type=='post' 
    && dateTime(publishedAt) < dateTime(now()) 
    && isReady == true
    ] {
        ...,
    } | order(publishedAt desc)
    [$offset...$limit]
`;

export const getPostsSlice = async (offset: number, limit: number) => {
    return await client.fetch(query, { offset, limit });
};

const queryOnlyCategory = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true && $category in categories] {
        ...,
    } | order(publishedAt desc)
    [$offset...$limit]
`;

export const getCategoryPostsSlice = async (category: string, offset: number, limit: number) => {
    return await client.fetch(queryOnlyCategory, { category, offset, limit });
};

const queryOnlyVideos = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true && defined(mainVideo.url) && mainVideo.url != ''] {
        ...,
    } | order(publishedAt desc)
    [$offset...$limit]
`;

export const getVideosPostsSlice = async (offset: number, limit: number) => {
    return await client.fetch(queryOnlyVideos, { offset, limit });
};
