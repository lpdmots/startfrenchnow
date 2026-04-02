"use client";

import { LuLock, LuFileText, LuClock } from "react-icons/lu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import clsx from "clsx";
import Link from "next-intl/link";
import { FidePackSommaire } from "@/app/serverActions/productActions";
import { Level, Post } from "@/app/types/sfn/blog";
import { LEVELDATA } from "@/app/lib/constantes";
import { removeDuplicates, secondsToMinutes } from "@/app/lib/utils";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdOndemandVideo } from "react-icons/md";
import { FaCaretDown, FaCaretRight, FaRegArrowAltCircleRight, FaRegCheckCircle } from "react-icons/fa";
import { useInitializePackFideWatched } from "@/app/hooks/lessons/useInitializePackFideWatched";
import { useSfnStore } from "@/app/stores/sfnStore";
import { useTranslations } from "next-intl";
import { Locale } from "@/i18n";
import { PdfDropdown } from "./PdfDropdown";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

const LOCKEDTARGET: Record<string, string> = {
    "/courses/beginners/": "/courses/beginners/",
    "/fide/scenarios/": "/fide#plans",
    "/fide/videos/": "/fide#plans",
    "/courses/intermediates/": "/courses/intermediates/",
    "/courses/dialogues/": "/courses/dialogues/",
};

export function CoursesAccordionClient({
    hasPack = false,
    fidePackSommaire,
    expandAll,
    defaultModuleKeyIndex,
    currentPostSlug,
    linkPrefix = "/fide/videos/",
    noPadding = false,
    withPackageName = true,
}: {
    hasPack?: boolean;
    fidePackSommaire: FidePackSommaire;
    expandAll?: boolean;
    defaultModuleKeyIndex?: number;
    currentPostSlug?: string;
    linkPrefix?: string;
    noPadding?: boolean;
    withPackageName?: boolean;
}) {
    const pathname = usePathname();
    const isFideSection = pathname?.includes("/fide") || false;
    const t = useTranslations(isFideSection ? "FidePack.CoursesAccordionClient" : "Fide.FidePack.CoursesAccordionClient");
    const params = useParams();
    console.log({ hasPack, fidePackSommaire, expandAll, defaultModuleKeyIndex, currentPostSlug, linkPrefix, noPadding, withPackageName });
    const activeSlug = useMemo<string | null>(() => {
        // Sur le dashboard : pas de slug de leçon
        if (pathname?.includes("/fide/dashboard")) return null;

        const raw = (params as any)?.slug;
        if (!raw) return null;

        // Next peut donner string[] sur catch-all
        if (Array.isArray(raw)) return raw[0] ?? null; // ou raw.at(-1) selon ton routing
        return raw as string;
    }, [pathname, (params as any)?.slug]);

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
    const defaultModuleKey = useMemo(() => {
        const firstPkg = fidePackSommaire.packages?.[0];
        const firstMod = firstPkg?.modules?.[defaultModuleKeyIndex ?? 0];
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
        const nextKey = fromSlug ?? defaultModuleKey;

        if (!nextKey) return;
        setOpenModuleKeys((prev) => removeDuplicates([...prev, nextKey]));
    }, [mounted, expandAll, computeOpenModuleKey, defaultModuleKey, fidePackSommaire, activeSlug]);

    return (
        <>
            {fidePackSommaire.packages.map((block, idx) => (
                <div
                    key={block.referenceKey}
                    className={clsx("p-0 pb-2 sm:p-4", noPadding && "p-0")}
                    style={{ borderBottom: idx === fidePackSommaire.packages.length - 1 ? undefined : "2px solid var(--neutral-300)" }}
                >
                    <div className="mb-3 flex items-center justify-between">
                        {withPackageName && <h3 className="m-0 text-lg font-semibold text-neutral-800">{block.title}</h3>}
                        <div className="text-sm text-neutral-600">
                            <div className="text-sm text-neutral-600">
                                {t("summary", {
                                    modules: block.modules.length,
                                    lessons: block.modules.reduce((a, m) => a + m.posts.length, 0),
                                })}
                            </div>
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
                                                    {mod.title} {!!mod?.level && mod.level.length > 0 && `(${LEVELDATA[mod.level[0]]?.label})`}
                                                </div>
                                            </div>
                                            <div className="text-xs text-neutral-600 flex" suppressHydrationWarning>
                                                {t("progress", {
                                                    watched: numberOfWatchedLessons,
                                                    total: mod.posts.length,
                                                    duration: secondsToMinutes(mod.posts.reduce((a, l) => a + (l.durationSec ?? 0), 0)),
                                                })}
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
                                                    linkPrefix={linkPrefix}
                                                    currentPostSlug={currentPostSlug}
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

function LessonRow({
    lesson,
    hasPack,
    moduleLevel,
    activeSlug,
    watchedVideos,
    linkPrefix,
    currentPostSlug,
}: {
    lesson: Post;
    hasPack: boolean;
    moduleLevel?: Level;
    activeSlug: string | null;
    watchedVideos: string[];
    linkPrefix: string;
    currentPostSlug?: string;
}) {
    const pathname = usePathname();
    const isFideSection = pathname?.includes("/fide") || false;
    const t = useTranslations(isFideSection ? "FidePack.CoursesAccordionClient" : "Fide.FidePack.CoursesAccordionClient");
    const isActive = lesson.slug.current === activeSlug;
    const locked = !lesson.isPreview && !hasPack;
    const level = lesson.level?.[0] || moduleLevel || undefined;
    const isWatched = watchedVideos.includes(lesson._id);
    const isCurrentPostSlug = currentPostSlug === lesson.slug.current;

    const lockedTarget = LOCKEDTARGET[linkPrefix];

    return (
        <Link href={locked ? lockedTarget : linkPrefix + lesson.slug.current} prefetch className={clsx("!text-neutral-800 !no-underline", isActive && "pointer-events-none cursor-default")}>
            <div className={clsx("flex items-center gap-4 py-3 hover:bg-neutral-200 rounded-lg px-2", (isActive || isCurrentPostSlug) && "bg-neutral-300", locked && "opacity-60")}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 border border-solid border-neutral-700">
                    {isWatched ? <FaRegCheckCircle className="text-xl" /> : isActive || isCurrentPostSlug ? <FaRegArrowAltCircleRight className="text-xl" /> : <MdOndemandVideo className="text-xl" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-neutral-800 shrink">{lesson.title}</span>
                        {!!level && level.length > 0 && <span className={clsx("text-sm")}>({LEVELDATA[level]?.label})</span>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-neutral-600 w-full justify-between relative">
                        <span className="inline-flex items-center gap-1">
                            <LuClock /> {secondsToMinutes(lesson.durationSec ?? 0)}
                        </span>
                        {lesson.resources && lesson.resources.length > 0 && (
                            <span style={{ pointerEvents: isActive ? "auto" : "initial" }}>
                                <PdfButton locale={isFideSection ? "fr" : "en"} resources={lesson.resources} />
                            </span>
                        )}
                    </div>
                </div>
                <div>
                    {lesson.isPreview && !hasPack && <span className="rounded bg-secondary-2 px-2 py-0.5 text-xs text-neutral-100">{t("freePreview")}</span>}
                    {locked && (
                        <span className="inline-flex items-center gap-1 rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-800">
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

const PdfButton = ({ locale, resources }: { locale: Locale; resources: { title_fr: string; title_en: string; key: string }[] }) => {
    const dropdownLearn = {
        content: (
            <div
                className="bg-neutral-100 p-4 rounded-lg border border-solid border-neutral-800"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="flex flex-col gap-2">
                    {resources.map((res) => (
                        <Link
                            key={res.key}
                            href={cloudFrontDomain + res.key}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm no-underline text-neutral-700 flex items-center"
                        >
                            <FaCaretRight />
                            {locale === "fr" ? res.title_fr : res.title_en}
                        </Link>
                    ))}
                </div>
            </div>
        ),
        button: (
            <div className="font-bold flex items-center">
                <LuFileText className="mr-1" /> {resources.length} PDF <FaCaretDown className="ml-1" />
            </div>
        ),
    };

    return <PdfDropdown content={dropdownLearn.content}>{dropdownLearn.button}</PdfDropdown>;
};
