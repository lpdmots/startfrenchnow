"use client";
import MotionSwitch from "@/app/components/common/MotionSwitch/MotionSwitch";
import { useSfnStore } from "@/app/stores/sfnStore";
import { useEffect, useState, useTransition } from "react";
import { markVideoSeenManually, resetVideoProgress } from "@/app/serverActions/fideExamActions";

export const ManualWatched = ({ postId, progressType = "pack_fide" }: { postId: string; progressType?: string }) => {
    // source de vérité locale (persistée par zustand)
    const watchedFromStore = useSfnStore((s) => s.watchedVideos.includes(postId));
    const addWatchedVideo = useSfnStore((s) => s.addWatchedVideo);
    const removeWatchedVideo = useSfnStore((s) => s.removeWatchedVideo);
    const resetVideoBuckets = useSfnStore((s) => s.resetVideoBuckets);

    // état du switch (synchro avec le store)
    const [watched, setWatched] = useState<boolean>(watchedFromStore);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setWatched(watchedFromStore);
    }, [watchedFromStore]);

    const handleManualWatched = () => {
        const next = !watched;

        // ✅ Optimistic UI + mise à jour du store/localStorage
        setWatched(next);
        if (next) addWatchedVideo(postId);
        else {
            removeWatchedVideo(postId);
            resetVideoBuckets(postId);
        }

        // ✅ Mise à jour Sanity via server actions existantes
        startTransition(async () => {
            try {
                if (next) {
                    // → Marquer comme vu : status=watched, progress=1, milestone=1, dates maj
                    await markVideoSeenManually({ kind: "manualSeen", progressType, postId });
                } else {
                    // → Repasser en non-vu : reset data (in-progress, 0, 0, dates, current)
                    await resetVideoProgress({ progressType, postId });
                }
            } catch (err) {
                // rollback en cas d’erreur côté serveur
                const prev = !next;
                setWatched(prev);
                if (prev) addWatchedVideo(postId);
                else removeWatchedVideo(postId);
                console.error("ManualWatched toggle failed", err);
            }
        });
    };

    return <MotionSwitch size="md" label="Vu" checked={watched} onCheckedChange={handleManualWatched} disabled={isPending} />;
};
