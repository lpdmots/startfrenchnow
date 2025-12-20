"use client";

import * as React from "react";
import clsx from "clsx";
import { useSfnStore } from "@/app/stores/sfnStore";

// ⬇️ Ajuste ce chemin si besoin
import { syncVideoMilestone, markVideoCompleted } from "@/app/serverActions/fideExamActions";
import { useEffect } from "react";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

type Props = {
    /** Identifiant du post/vidéo (sera utilisé côté Sanity) */
    postId: string;

    /** "type" de learningProgress côté Sanity (par défaut pour le Pack FIDE) */
    progressType?: string;

    src: string;
    poster?: string;
    className?: string;
    autoPlay?: boolean;
    controls?: boolean;
    subtitleFRUrl?: string;
    subtitleENUrl?: string;

    /** Config buckets/dwell */
    bucketSizeSec?: number; // défaut 5s
    dwellMinSec?: number; // défaut 2s

    /** Callbacks optionnels */
    onProgress?: (percent: number) => void; // 0..1
    milestones?: number[]; // ex: [0.2,0.4,0.6,0.8,1]
    onMilestone?: (milestone: number) => void;

    /** Appelé à la fin de la vidéo */
    onCompleted?: () => void;
};

export default function VideoProgressPlayer({
    postId,
    progressType = "pack_fide",
    src,
    poster,
    className,
    autoPlay,
    controls = true,
    subtitleFRUrl,
    subtitleENUrl,
    bucketSizeSec = 5,
    dwellMinSec = 2,
    onProgress,
    milestones = [0.2, 0.4, 0.6, 0.8, 0.9, 1],
    onMilestone,
    onCompleted,
}: Props) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);

    // Store actions/selectors
    const setVideoTimestamp = useSfnStore((s) => s.setVideoTimestamp);
    const clearVideoTimestamp = useSfnStore((s) => s.clearVideoTimestamp);
    const setVideoDuration = useSfnStore((s) => s.setVideoDuration);
    const markBucketSeen = useSfnStore((s) => s.markBucketSeen);
    const getWatchedPercent = useSfnStore((s) => s.getWatchedPercent);
    const getVideoTimestamp = useSfnStore((s) => s.getVideoTimestamp);
    const addWatchedVideo = useSfnStore((s) => s.addWatchedVideo);
    const subtitlePreference = useSfnStore((s) => s.subtitlePreference);
    const setSubtitlePreference = useSfnStore((s) => s.setSubtitlePreference);

    // ===== Reprise au chargement =====
    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;

        const onLoaded = () => {
            const duration = el.duration || 0;
            if (duration > 0) setVideoDuration(postId, duration);

            const savedTs = getVideoTimestamp(postId) ?? 0;
            const MIN_START = 5;
            const END_GUARD = 10;

            if (duration > 0 && savedTs > MIN_START && savedTs < Math.max(0, duration - END_GUARD)) {
                try {
                    el.currentTime = savedTs;
                } catch {
                    /* no-op */
                }
            }
        };

        el.addEventListener("loadedmetadata", onLoaded);
        return () => el.removeEventListener("loadedmetadata", onLoaded);
    }, [postId, getVideoTimestamp, setVideoDuration]);

    // ===== Gestion dwell/buckets + timestamp (throttle) + synchro serveur =====
    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;

        /** Timestamp */
        let lastSavedAt = 0;
        const THROTTLE_MS = 5000;
        const saveTimestamp = () => {
            const t = el.currentTime || 0;
            const d = el.duration || undefined;
            if (t < 2) return;
            setVideoTimestamp(postId, t, d);
            lastSavedAt = Date.now();
        };

        /** Buckets */
        let lastCT = 0; // dernier currentTime vu
        let lastBucket = -1; // bucket courant
        let dwellInBucket = 0; // temps cumulé passé dans le bucket courant (sec)
        const seenMilestones = new Set<number>();

        const sendMilestone = (m: number, p: number) => {
            // App local (callback) puis synchro serveur
            onMilestone?.(m);
            // Pas d'await pour ne pas bloquer l'UI
            syncVideoMilestone({
                kind: "milestone",
                progressType,
                postId: postId,
                milestone: m as 0.2 | 0.4 | 0.6 | 0.8 | 1,
                progress: p,
            }).catch(() => {});
            if (m === 1 || p >= 0.9) addWatchedVideo(postId);
        };

        const recomputeProgress = () => {
            const p = getWatchedPercent(postId);
            onProgress?.(p);
            for (const m of milestones) {
                if (p >= m && !seenMilestones.has(m)) {
                    seenMilestones.add(m);
                    sendMilestone(m, p);
                }
            }
        };

        const markCurrentBucketIfDwell = () => {
            const duration = el.duration || 0;
            if (lastBucket < 0) return;
            if (dwellInBucket >= dwellMinSec) {
                const newly = markBucketSeen(postId, lastBucket, {
                    bucketSize: bucketSizeSec,
                    duration,
                });
                if (newly) {
                    recomputeProgress();
                }
                // Reset pour éviter de spammer
                dwellInBucket = 0;
            }
        };

        const onTimeUpdate = () => {
            const ct = el.currentTime || 0;
            const dt = Math.max(0, ct - lastCT);

            const bucket = Math.floor(ct / bucketSizeSec);
            if (bucket !== lastBucket) {
                // On change de case → tenter de valider l’ancienne si dwell suffisant
                markCurrentBucketIfDwell();
                lastBucket = bucket;
                dwellInBucket = 0;
            } else {
                dwellInBucket += dt;
            }

            lastCT = ct;

            // Throttle timestamp
            if (Date.now() - lastSavedAt >= THROTTLE_MS) saveTimestamp();
        };

        const onPause = () => {
            // Valider potentiellement le bucket courant
            markCurrentBucketIfDwell();
            // Sauvegarder le timestamp
            saveTimestamp();
        };

        const onSeeking = () => {
            // Reset dwell pour éviter de “peindre” la barre pendant un seek
            dwellInBucket = 0;
            lastCT = el.currentTime || 0;
            lastBucket = Math.floor(lastCT / bucketSizeSec);
        };

        const onSeeked = () => {
            dwellInBucket = 0;
            lastCT = el.currentTime || 0;
            lastBucket = Math.floor(lastCT / bucketSizeSec);
        };

        const onEnded = () => {
            // Marquer le dernier bucket (fin de vidéo)
            const duration = el.duration || 0;
            if (duration > 0) {
                const lastIndex = Math.floor((duration - 0.001) / bucketSizeSec);
                markBucketSeen(postId, lastIndex, { bucketSize: bucketSizeSec, duration });
                recomputeProgress();
            }
            // Timestamp: repartir à 0
            clearVideoTimestamp(postId);

            // Callback local + synchro "completed"
            onMilestone?.(1);
            onCompleted?.();
            markVideoCompleted({
                kind: "completed",
                progressType,
                postId: postId,
            }).catch(() => {});
            addWatchedVideo(postId);
        };

        const onVisibilityOrPageHide = () => {
            markCurrentBucketIfDwell();
            saveTimestamp();
        };

        el.addEventListener("timeupdate", onTimeUpdate);
        el.addEventListener("pause", onPause);
        el.addEventListener("seeking", onSeeking);
        el.addEventListener("seeked", onSeeked);
        el.addEventListener("ended", onEnded);

        if (typeof document !== "undefined") {
            document.addEventListener("visibilitychange", onVisibilityOrPageHide);
        }
        if (typeof window !== "undefined") {
            window.addEventListener("pagehide", onVisibilityOrPageHide);
            window.addEventListener("beforeunload", onVisibilityOrPageHide);
        }

        return () => {
            el.removeEventListener("timeupdate", onTimeUpdate);
            el.removeEventListener("pause", onPause);
            el.removeEventListener("seeking", onSeeking);
            el.removeEventListener("seeked", onSeeked);
            el.removeEventListener("ended", onEnded);

            if (typeof document !== "undefined") {
                document.removeEventListener("visibilitychange", onVisibilityOrPageHide);
            }
            if (typeof window !== "undefined") {
                window.removeEventListener("pagehide", onVisibilityOrPageHide);
                window.removeEventListener("beforeunload", onVisibilityOrPageHide);
            }
        };
    }, [
        postId,
        progressType,
        bucketSizeSec,
        dwellMinSec,
        milestones,
        onProgress,
        onMilestone,
        onCompleted,
        setVideoTimestamp,
        clearVideoTimestamp,
        setVideoDuration,
        markBucketSeen,
        getWatchedPercent,
    ]);

    // 1) Appliquer la préférence enregistrée quand la vidéo est prête
    useEffect(() => {
        if (typeof window === "undefined") return;
        const video = videoRef.current;
        if (!video) return;

        const applyPreference = () => {
            if (!subtitlePreference) return; // laisse le comportement natif si aucune préférence

            const tracks = video.textTracks;
            if (!tracks || tracks.length === 0) return;

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                const lang = (track.language || "").toLowerCase();

                if (subtitlePreference === "off") {
                    track.mode = "disabled";
                } else if (lang.startsWith(subtitlePreference)) {
                    track.mode = "showing";
                } else {
                    track.mode = "disabled";
                }
            }
        };

        // ✅ Si les metadata sont déjà prêtes, on applique tout de suite
        if (video.readyState >= 1) {
            applyPreference();
            return;
        }

        // Sinon, on attend l'événement loadedmetadata
        const handler = () => {
            applyPreference();
        };

        video.addEventListener("loadedmetadata", handler);

        return () => {
            video.removeEventListener("loadedmetadata", handler);
        };
    }, [src, subtitlePreference]);

    // 2) Sauvegarder chaque changement de sous-titres vers le store
    useEffect(() => {
        if (typeof window === "undefined") return;
        const video = videoRef.current;
        if (!video) return;

        const tracks = video.textTracks;
        if (!tracks) return;

        const handleChange = () => {
            let value: "fr" | "en" | "off" = "off";

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                if (track.mode === "showing") {
                    const lang = track.language.toLowerCase();
                    if (lang.startsWith("fr")) value = "fr";
                    else if (lang.startsWith("en")) value = "en";
                    else value = "off";
                    break;
                }
            }

            setSubtitlePreference(value);
        };

        // TextTrackList est un EventTarget, mais TS ne le sait pas toujours
        tracks.addEventListener("change", handleChange);

        return () => {
            tracks.removeEventListener("change", handleChange);
        };
    }, [src, setSubtitlePreference]);

    return (
        <video
            ref={videoRef}
            className={clsx("image-wrapper border-radius-30px", className)}
            src={src}
            poster={poster}
            controls={controls}
            autoPlay={autoPlay}
            playsInline
            preload="metadata"
            onEnded={(e) => {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                }
                const v = e.currentTarget;
                // Recharge la première frame = réaffiche le poster
                v.load();
            }}
            crossOrigin="anonymous"
        >
            {subtitleFRUrl && <track kind="subtitles" src={subtitleFRUrl} srcLang="fr" label="Français" />}
            {subtitleENUrl && <track kind="subtitles" src={subtitleENUrl} srcLang="en" label="English" />}
        </video>
    );
}
