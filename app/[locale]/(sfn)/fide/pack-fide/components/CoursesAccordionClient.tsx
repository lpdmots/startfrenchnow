"use client";

import { LuLock, LuFileText, LuClock } from "react-icons/lu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import clsx from "clsx";
import Link from "next-intl/link";
import { FidePackSommaire } from "@/app/serverActions/productActions";
import { Level, Post } from "@/app/types/sfn/blog";
import { LEVELDATA } from "@/app/lib/constantes";
import { removeDuplicates, secondsToMinutes } from "@/app/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdOndemandVideo } from "react-icons/md";
import { FaRegArrowAltCircleRight, FaRegCheckCircle } from "react-icons/fa";
import { useInitializePackFideWatched } from "@/app/hooks/lessons/useInitializePackFideWatched";
import { useSfnStore } from "@/app/stores/sfnStore";

export function CoursesAccordionClient({ hasPack = false, fidePackSommaire, expandAll }: { hasPack?: boolean; fidePackSommaire: FidePackSommaire; expandAll?: boolean }) {
    const params = useParams();
    const activeSlug = (params?.slug ?? null) as string | null;
    console.log("activeSlug", activeSlug);
    useInitializePackFideWatched();
    const { watchedVideos } = useSfnStore((s) => ({
        watchedVideos: s.watchedVideos,
    }));

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const safeWatched = mounted ? watchedVideos : [];

    // 0) Clé du premier module (fallback si pas de slug)
    const firstModuleKey = useMemo(() => {
        const firstPkg = fidePackSommaire.packages?.[0];
        const firstMod = firstPkg?.modules?.[0];
        return firstMod?._key as string | undefined;
    }, [fidePackSommaire]);

    // 1) Mémo: fonction pour trouver la clé du module à ouvrir depuis un slug
    const computeOpenModuleKey = useMemo<(slug: string | null | undefined) => string | undefined>(() => {
        return (slug) => {
            if (!slug) return undefined; // on laisse undefined ici, on appliquera le fallback ailleurs
            return fidePackSommaire.packages.flatMap((p) => p.modules).find((m) => m.posts?.some((p: any) => p.slug.current === slug))?._key as string | undefined;
        };
    }, [fidePackSommaire]);

    // 2) Etat contrôlé de l’accordéon (SSR -> vide ; client -> on ouvre)
    const [openModuleKeys, setOpenModuleKeys] = useState<string[]>([]);

    // 3) Ouvrir après mount (et lors des changements pertinents)
    useEffect(() => {
        if (!mounted) return;

        if (expandAll) {
            setOpenModuleKeys(fidePackSommaire.packages.flatMap((p) => p.modules.map((m) => m._key as string)));
            return;
        }

        const fromSlug = computeOpenModuleKey(activeSlug);
        const nextKey = fromSlug ?? firstModuleKey;

        if (!nextKey) return;
        setOpenModuleKeys((prev) => removeDuplicates([...prev, nextKey]));
    }, [mounted, expandAll, activeSlug, computeOpenModuleKey, firstModuleKey, fidePackSommaire]);

    return (
        <>
            {fidePackSommaire.packages.map((block) => (
                <div key={block.referenceKey} className="p-0 pb-2 sm:p-4" style={{ borderBottom: "2px solid var(--neutral-300)" }}>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="m-0 text-lg font-semibold text-neutral-900">{block.title}</h3>
                        <div className="text-sm text-neutral-600">
                            {block.modules.length} modules • {block.modules.reduce((a, m) => a + m.posts.length, 0)} leçons
                        </div>
                    </div>

                    {/* 4) Accordéon contrôlé */}
                    <Accordion type="multiple" value={openModuleKeys} onValueChange={setOpenModuleKeys} className="w-full text-neutral-800">
                        {block.modules.map((mod) => {
                            const numberOfWatchedLessons = mod.posts.map((post) => post._id).filter((id) => safeWatched.includes(id)).length;
                            return (
                                <AccordionItem key={mod._key} value={mod._key}>
                                    <AccordionTrigger className="hover:no-underline rounded-lg text-neutral-800 border-2 border-solid border-neutral-800 bg-neutral-100">
                                        <div className="flex flex-col sm:flex-row w-full sm:items-center justify-between pr-4 sm:flex-wrap">
                                            <div className="flex gap-2 mr-2">
                                                <div className="font-medium text-neutral-800 text-base">
                                                    {mod.title} {!!mod?.level && `(${LEVELDATA[mod.level[0]]?.label})`}
                                                </div>
                                            </div>
                                            <div className="text-xs text-neutral-600 flex" suppressHydrationWarning>
                                                {numberOfWatchedLessons}/{mod.posts.length} leçons • {secondsToMinutes(mod.posts.reduce((a, l) => a + (l.durationSec ?? 0), 0))}
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent>
                                        <div className="divide-y divide-neutral-100 bg-neutral-100 p-2 rounded-lg border border-solid border-neutral-800">
                                            {mod.posts.map((post) => (
                                                <LessonRow
                                                    key={post.slug.current}
                                                    lesson={post as unknown as Post}
                                                    hasPack={hasPack}
                                                    moduleLevel={mod.level?.[0]}
                                                    activeSlug={activeSlug}
                                                    watchedVideos={safeWatched}
                                                />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            ))}
        </>
    );
}

function LessonRow({ lesson, hasPack, moduleLevel, activeSlug, watchedVideos }: { lesson: Post; hasPack: boolean; moduleLevel?: Level; activeSlug: string | null; watchedVideos: string[] }) {
    const isActive = lesson.slug.current === activeSlug;
    const locked = !lesson.isPreview && !hasPack;
    const level = lesson.level?.[0] || moduleLevel || undefined;
    const isWatched = watchedVideos.includes(lesson._id);

    return (
        <Link
            href={locked ? "/fide/pack-fide#plans" : `/fide/videos/${lesson.slug.current}`}
            prefetch
            className={clsx("!text-neutral-800 !no-underline", isActive && "pointer-events-none cursor-default")}
        >
            <div className={clsx("flex items-center gap-4 py-3 hover:bg-neutral-200 rounded-lg px-2", isActive && "bg-neutral-300", locked && "opacity-60")}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 border border-solid border-neutral-700">
                    {isWatched ? <FaRegCheckCircle className="text-xl" /> : isActive ? <FaRegArrowAltCircleRight className="text-xl" /> : <MdOndemandVideo className="text-xl" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-neutral-900 shrink">{lesson.title}</span>
                        {!!level && <span className={clsx("text-sm")}>({LEVELDATA[level]?.label})</span>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                        <span className="inline-flex items-center gap-1">
                            <LuClock /> {secondsToMinutes(lesson.durationSec ?? 0)}
                        </span>
                        {lesson.resources && lesson.resources.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                                <LuFileText /> {lesson.resources.length} PDF
                            </span>
                        )}
                    </div>
                </div>
                <div>
                    {lesson.isPreview && !hasPack && <span className="rounded bg-secondary-2 px-2 py-0.5 text-xs text-neutral-100">Offert</span>}
                    {locked && (
                        <span className="inline-flex items-center gap-1 rounded bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                            <LuLock className="text-[20px]" />
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

/* --------------------- Helpers & Demo Data --------------------- */

export function levelBadgeColor(level?: Level | undefined) {
    switch (level) {
        case "a1":
            return "text-secondary-5";
        case "a2":
            return "text-secondary-1";
        case "b1":
            return "text-secondary-4";
        default:
            return "text-neutral-700";
    }
}
