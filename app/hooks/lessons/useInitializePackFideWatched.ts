"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Progress, VideoLog } from "@/app/types/sfn/auth";
import { useSfnStore } from "@/app/stores/sfnStore";

// Un seul call : on récupère progress[] -> videoLogs
const VIDEOLOGS_QUERY = groq`
*[_type == "user" && _id == $userId][0]{
  learningProgress[]{
    type,
    videoLogs[]{
      status,
      post
    }
  }
}
`;

export function useInitializePackFideWatched() {
    const { watchedVideos, setWatchedVideos } = useSfnStore((s) => ({
        watchedVideos: s.watchedVideos,
        setWatchedVideos: s.setWatchedVideos,
    }));
    const { data: session } = useSession();
    const userId = session?.user?._id || null;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>(null);

    const fetchLogs = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await client.fetch(VIDEOLOGS_QUERY, { userId });
            const logs: VideoLog[] = data?.learningProgress?.find((p: Progress) => p?.type === "pack_fide")?.videoLogs || [];
            const watchedVideos = logs.filter((v) => v?.status === "watched").map((v) => v.post._ref);

            setWatchedVideos(watchedVideos);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchLogs();
    }, [userId, fetchLogs]);

    return {
        loading,
        error,
        watchedVideos,
    };
}
