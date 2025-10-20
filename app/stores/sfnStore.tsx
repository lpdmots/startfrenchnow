import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { PrivateLesson } from "../types/sfn/lessons";
import { LevelParam, TypeParam } from "../[locale]/(sfn)/fide/exams/page";

type VideoProgressEntry = {
    timestamp: number; // secondes
    updatedAt: string; // ISO
    duration?: number; // optionnel

    bucketSize?: number; // secondes (ex. 5)
    buckets?: string; // chaîne "011001..." (1 = bucket vu)
    uniqueCount?: number; // nb de buckets à 1
};

interface DefaultProps {
    privateLessons: PrivateLesson[];
    videoProgress: Record<string, VideoProgressEntry>;
    watchedVideos: string[];
    fideVideosSelectedPackage?: string;
    fideExamsSelectedLevel?: LevelParam;
    fideExamsSelectedType?: TypeParam | "all";
}

interface SfnStore extends DefaultProps {
    setPrivateLesson: (newPrivateLessons: PrivateLesson) => void;
    setVideoTimestamp: (videoId: string, timestamp: number, duration?: number) => void;
    clearVideoTimestamp: (videoId: string) => void;
    getVideoTimestamp: (videoId: string) => number;

    setVideoDuration: (videoId: string, duration: number) => void;
    markBucketSeen: (videoId: string, bucketIndex: number, opts?: { bucketSize?: number; duration?: number }) => boolean; // true si on a coché un nouveau bucket
    resetVideoBuckets: (videoId: string) => void;
    getUniqueWatchedSeconds: (videoId: string) => number;
    getWatchedPercent: (videoId: string) => number; // 0..1

    setWatchedVideos: (ids: string[]) => void;
    addWatchedVideo: (id: string) => void;
    removeWatchedVideo: (id: string) => void;

    getFideVideosSelectedPackage: () => string | undefined;
    setFideVideosSelectedPackage: (packageName: string) => void;

    setFideExamsSelectedLevel: (v: LevelParam) => void;
    setFideExamsSelectedType: (v: TypeParam | "all") => void;
}

const DEFAULT_PROPS: DefaultProps = {
    privateLessons: [],
    videoProgress: {},
    watchedVideos: [],
    fideVideosSelectedPackage: undefined,
    fideExamsSelectedLevel: "all",
    fideExamsSelectedType: "all",
};

/** ===== Utils internes ===== */
const nowISO = () => new Date().toISOString();
const DEFAULT_BUCKET_SIZE = 5; // secondes

function ensureEntry(state: SfnStore, videoId: string): VideoProgressEntry {
    return (
        state.videoProgress[videoId] ?? {
            timestamp: 0,
            updatedAt: nowISO(),
            duration: undefined,
            bucketSize: DEFAULT_BUCKET_SIZE,
            buckets: "",
            uniqueCount: 0,
        }
    );
}

function padBuckets(buckets: string, neededLength: number) {
    if (buckets.length >= neededLength) return buckets;
    return buckets + "0".repeat(neededLength - buckets.length);
}

export const useSfnStore = create<SfnStore>()(
    devtools(
        persist(
            (set, get) => ({
                ...DEFAULT_PROPS,

                setPrivateLesson: (newPrivateLessons: PrivateLesson) =>
                    set(
                        (state) => ({
                            ...state,
                            privateLessons: [...state.privateLessons.filter((lesson) => lesson.eventType !== newPrivateLessons.eventType), newPrivateLessons],
                        }),
                        false,
                        "setNewPrivateLesson"
                    ),
                setVideoTimestamp: (videoId, timestamp, duration) =>
                    set(
                        (state) => {
                            const entry = ensureEntry(state as SfnStore, videoId);
                            return {
                                videoProgress: {
                                    ...state.videoProgress,
                                    [videoId]: {
                                        ...entry, // <-- conserve buckets, uniqueCount, bucketSize, etc.
                                        timestamp,
                                        duration: duration ?? entry.duration,
                                        updatedAt: nowISO(),
                                    },
                                },
                            };
                        },
                        false,
                        "setVideoTimestamp"
                    ),

                clearVideoTimestamp: (videoId) =>
                    set(
                        (state) => {
                            const { [videoId]: _removed, ...rest } = state.videoProgress;
                            return { videoProgress: rest };
                        },
                        false,
                        "clearVideoTimestamp"
                    ),

                getVideoTimestamp: (videoId) => get().videoProgress[videoId]?.timestamp,
                // ===== Buckets “unique view” =====
                setVideoDuration: (videoId, duration) =>
                    set(
                        (state) => {
                            const entry = ensureEntry(state as SfnStore, videoId);
                            return {
                                videoProgress: {
                                    ...state.videoProgress,
                                    [videoId]: {
                                        ...entry,
                                        duration,
                                        updatedAt: nowISO(),
                                    },
                                },
                            };
                        },
                        false,
                        "setVideoDuration"
                    ),

                markBucketSeen: (videoId, bucketIndex, opts) => {
                    let newlyMarked = false;
                    set(
                        (state) => {
                            const entry = ensureEntry(state as SfnStore, videoId);
                            const bucketSize = opts?.bucketSize ?? entry.bucketSize ?? DEFAULT_BUCKET_SIZE;
                            const duration = opts?.duration ?? entry.duration;

                            // Prépare la chaîne de buckets jusqu’à bucketIndex inclus
                            const neededLen = bucketIndex + 1;
                            let buckets = padBuckets(entry.buckets ?? "", neededLen);
                            let uniqueCount = entry.uniqueCount ?? 0;

                            if (buckets[bucketIndex] === "0") {
                                // Coche ce bucket
                                buckets = buckets.substring(0, bucketIndex) + "1" + buckets.substring(bucketIndex + 1);
                                uniqueCount += 1;
                                newlyMarked = true;
                            }

                            return {
                                videoProgress: {
                                    ...state.videoProgress,
                                    [videoId]: {
                                        ...entry,
                                        bucketSize,
                                        duration: duration ?? entry.duration,
                                        buckets,
                                        uniqueCount,
                                        updatedAt: nowISO(),
                                    },
                                },
                            };
                        },
                        false,
                        "markBucketSeen"
                    );
                    return newlyMarked;
                },

                resetVideoBuckets: (videoId) =>
                    set(
                        (state) => {
                            const entry = ensureEntry(state as SfnStore, videoId);
                            return {
                                videoProgress: {
                                    ...state.videoProgress,
                                    [videoId]: {
                                        ...entry,
                                        buckets: "",
                                        uniqueCount: 0,
                                        updatedAt: nowISO(),
                                    },
                                },
                            };
                        },
                        false,
                        "resetVideoBuckets"
                    ),

                getUniqueWatchedSeconds: (videoId) => {
                    const entry = get().videoProgress[videoId];
                    if (!entry) return 0;
                    const size = entry.bucketSize ?? DEFAULT_BUCKET_SIZE;
                    const uniq = entry.uniqueCount ?? 0;
                    return uniq * size;
                },

                getWatchedPercent: (videoId) => {
                    const entry = get().videoProgress[videoId];
                    if (!entry?.duration || entry.duration <= 0) return 0;
                    const uniqSec = get().getUniqueWatchedSeconds(videoId);
                    return Math.min(1, uniqSec / entry.duration);
                },

                setWatchedVideos: (ids) => {
                    const unique = Array.from(new Set(ids.filter(Boolean)));
                    set({ watchedVideos: unique });
                },

                addWatchedVideo: (id) => {
                    if (!id) return;
                    const curr = get().watchedVideos;
                    if (curr.includes(id)) return;
                    set({ watchedVideos: [...curr, id] });
                },

                removeWatchedVideo: (id) => {
                    if (!id) return;
                    const curr = get().watchedVideos;
                    if (!curr.includes(id)) return;
                    set({ watchedVideos: curr.filter((vid) => vid !== id) });
                },

                getFideVideosSelectedPackage: () => {
                    return get().fideVideosSelectedPackage;
                },

                setFideVideosSelectedPackage: (packageName: string) => {
                    set({ fideVideosSelectedPackage: packageName });
                },
                setFideExamsSelectedLevel: (v) => set({ fideExamsSelectedLevel: v }),
                setFideExamsSelectedType: (v) => set({ fideExamsSelectedType: v }),
            }),
            {
                name: "sfn-storage",
            }
        )
    )
);
