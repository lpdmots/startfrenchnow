"use client";
import { getCategoryPostsSlice, getPostsSlice, getVideosPostsSlice } from "@/app/serverActions/blogActions";
import { Post } from "@/app/types/sfn/blog";
import React, { useEffect, useRef, useState } from "react";
import SecondaryPost from "../blog/SecondaryPost";
import { NUMBER_OF_POSTS_TO_FETCH } from "@/app/lib/constantes";
import { FaSpinner } from "react-icons/fa";
import VideoList from "../videos/VideoList";

export const PostsListInfiniteScroll = ({ initialPosts, postLang, locale, category }: { initialPosts: Post[]; postLang: string; locale: string; category?: string }) => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [offset, setOffset] = useState(NUMBER_OF_POSTS_TO_FETCH);
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostRef = useRef<HTMLDivElement | null>(null);

    const [hasMorePosts, setHasMorePosts] = useState(true); // Gérer la fin des posts

    // Fonction pour charger les nouveaux posts
    const loadMorePosts = async () => {
        if (initialPosts.length < NUMBER_OF_POSTS_TO_FETCH) {
            setHasMorePosts(false);
            return;
        }
        setLoading(true);
        const newPosts = !category
            ? await getPostsSlice(offset, offset + NUMBER_OF_POSTS_TO_FETCH)
            : category === "video"
            ? await getVideosPostsSlice(offset, offset + NUMBER_OF_POSTS_TO_FETCH)
            : await getCategoryPostsSlice(category, offset, offset + NUMBER_OF_POSTS_TO_FETCH);

        // Si le nombre de posts est inférieur à NUMBER_OF_POSTS_TO_FETCH, c'est qu'il n'y en a plus
        if (newPosts.length < NUMBER_OF_POSTS_TO_FETCH) {
            setHasMorePosts(false); // Désactiver les chargements futurs
        }

        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setOffset((prevOffset) => prevOffset + NUMBER_OF_POSTS_TO_FETCH);
        setLoading(false);
    };

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMorePosts) {
                // Ne charger que s'il y a encore des posts
                loadMorePosts();
            }
        });

        if (lastPostRef.current) {
            observer.current.observe(lastPostRef.current);
        }

        return () => observer.current?.disconnect();
    }, [posts, hasMorePosts]);

    return (
        <>
            {category === "video" ? (
                <VideoList posts={posts} postLang={postLang as "fr" | "en"} locale={locale} />
            ) : (
                posts.map((post) => <SecondaryPost key={post._id} post={post} postLang={postLang as "fr" | "en"} locale={locale} />)
            )}
            <div ref={lastPostRef} style={{ height: "1px" }} />
            {loading && (
                <div className="w-full flex flex-col justify-center items-center">
                    <FaSpinner className="animate-spin text-blue-500 h-8 w-8 mb-4" style={{ animationDuration: "2s" }} />
                    Chargement...
                </div>
            )}
        </>
    );
};
