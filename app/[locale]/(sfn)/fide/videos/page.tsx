import { Locale } from "@/i18n";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { FidePackSommaire, getFidePackSommaire } from "@/app/serverActions/productActions";
import FideVideoList from "./components/FideVideoList";
import { Image, Level, Post, Slug } from "@/app/types/sfn/blog";
import { VideoPackageSelect } from "./components/VideoPackageSelect";
import { getCategoryPostsSlice } from "@/app/serverActions/blogActions";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";

export default async function VideosFidePage({ params: { locale }, searchParams }: { params: { locale: Locale }; searchParams: Record<string, string | string[] | undefined> }) {
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");
    const fidePackSommaire = await getFidePackSommaire(locale);
    const freeFideVideos = await getCategoryPostsSlice("fide", 0, 100);
    const packageParamRaw = searchParams?.package;
    const initialPackageKey = Array.isArray(packageParamRaw) ? packageParamRaw[0] : packageParamRaw;

    return <VideosFidePageNoAsync fidePackSommaire={fidePackSommaire} freeFideVideos={freeFideVideos} locale={locale} hasPack={hasPack} initialPackageKey={initialPackageKey} />;
}

function VideosFidePageNoAsync({
    fidePackSommaire,
    freeFideVideos,
    locale,
    hasPack,
    initialPackageKey,
}: {
    fidePackSommaire: FidePackSommaire;
    freeFideVideos: Post[];
    locale: Locale;
    hasPack: boolean;
    initialPackageKey?: string;
}) {
    const t = useTranslations("Fide.FideVideosPage");

    const { FlatFidePackSommaire, packages } = flattenFidePackSommaire(fidePackSommaire, locale, freeFideVideos);

    // Clés valides = referenceKey des packs Sanity + "free" + "all"
    const validKeys = new Set<string>([...(fidePackSommaire?.packages?.map((p) => p.referenceKey) ?? []), "free", "all"]);

    // Normalisation du choix initial
    const selectedKey = initialPackageKey && validKeys.has(initialPackageKey) ? initialPackageKey : "all";

    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            <div className="section hero v3 wf-section !pt-6">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center mb-8">
                            <div className="inner-container _725px center---full-width-mbl">
                                <div className="text-center mg-bottom-40px">
                                    <h1 className="display-1 mg-bottom-8px mb-8">{t.rich("title", intelRich())}</h1>
                                    <p className="mg-bottom-0">{t.rich("subtitleRich", intelRich())}</p>
                                </div>
                            </div>
                            <VideoPackageSelect flatFidePackSommaire={FlatFidePackSommaire} packages={packages} locale={locale} hasPack={hasPack} initialPackageKey={selectedKey} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type FlatFidePackSommaire = FlatFidePackItem[];

const COLORS = ["var(--secondary-1)", "var(--secondary-2)", "var(--secondary-4)", "var(--secondary-6)", "var(--secondary-5)", "var(--secondary-3)", "var(--secondary-6)"];
export type ColorType = (typeof COLORS)[number];

export interface FlatFidePackItem {
    packageTitle: string;
    packageReferenceKey: string;
    packageColor: ColorType;

    moduleKey: string;
    moduleTitle?: string;
    moduleSubtitle?: string;
    moduleLevel?: Level[]; // niveau(s) au niveau du module

    postId: string;
    postSlug: Slug;
    postMainVideo?: { url: string };
    postMainImage: Image;
    postTitle: string; // déjà localisé
    postDescription: string;
    postLevel?: Level[]; // niveau(s) au niveau du post
    postDurationSec?: number;
    postIsPreview?: boolean; // AJOUTER CATEGORIES
}

/**
 * Aplatis le sommaire en respectant l'ordre Sanity (ordre des listes).
 * - Localise titres/sous-titres selon `locale`, avec fallback de bon sens.
 * - Ne modifie pas l’ordre: packages -> modules -> posts.
 */

const FREE_PACKAGE_COLOR = "var(--neutral-600)" as ColorType;

function flattenFidePackSommaire(
    data: FidePackSommaire,
    locale: Locale = "fr",
    freeFideVideos: Post[]
): { FlatFidePackSommaire: FlatFidePackSommaire; packages: { title: string; packageColor: ColorType; referenceKey: string }[] } {
    const isEn = locale === "en";
    const pick = (fr?: string, en?: string): string => (isEn ? en ?? fr ?? "" : fr ?? en ?? "");

    const packages = [
        ...(data?.packages?.map((pack, packIndex) => ({
            title: pack.title,
            packageColor: COLORS[packIndex % COLORS.length] as ColorType,
            referenceKey: pack.referenceKey,
        })) || []),
        { title: pick("Gratuites", "Free"), packageColor: FREE_PACKAGE_COLOR, referenceKey: "free" },
    ];

    const FlatFidePackSommaire: FlatFidePackSommaire = [];

    for (const [packIndex, pack] of (data?.packages ?? []).entries()) {
        const packageTitle = pack.title;
        const packageColor = COLORS[packIndex % COLORS.length] as ColorType;

        for (const mod of pack?.modules ?? []) {
            const moduleTitle = mod.title || undefined;
            const moduleSubtitle = mod.subtitle || undefined;

            for (const post of mod?.posts ?? []) {
                FlatFidePackSommaire.push({
                    packageTitle,
                    packageReferenceKey: pack.referenceKey,
                    packageColor,

                    moduleKey: mod._key,
                    moduleTitle,
                    moduleSubtitle,
                    moduleLevel: mod.level,

                    postId: post._id,
                    postSlug: post.slug,
                    postMainVideo: post.mainVideo,
                    postMainImage: post.mainImage,
                    postTitle: post.title,
                    postDescription: post.description,
                    postLevel: post.level,
                    postDurationSec: post.durationSec,
                    postIsPreview: post.isPreview,
                });
            }
        }
    }

    const flatFreeFideVideos = freeFideVideos.map((post) => ({
        packageTitle: pick("Gratuites", "Free"),
        packageReferenceKey: "free",
        packageColor: FREE_PACKAGE_COLOR,

        moduleKey: "free",
        moduleTitle: undefined,
        moduleSubtitle: undefined,
        moduleLevel: undefined,

        postId: post._id,
        postSlug: post.slug,
        postMainVideo: post.mainVideo,
        postMainImage: post.mainImage,
        postTitle: pick(post.title, post.title_en),
        postDescription: pick(post.description, post.description_en),
        postLevel: post.level,
        postDurationSec: undefined,
        postIsPreview: true,
    }));

    // Ajouter les vidéos gratuites à la fin
    FlatFidePackSommaire.push(...flatFreeFideVideos);

    return { FlatFidePackSommaire, packages };
}
