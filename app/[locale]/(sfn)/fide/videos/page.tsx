import { Locale } from "@/i18n";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { FidePackSommaire, getFidePackSommaire } from "@/app/serverActions/productActions";
import FideVideoList from "./components/FideVideoList";
import { Image, Level, Slug } from "@/app/types/sfn/blog";

export default async function VideosFidePage({ params: { locale } }: { params: { locale: Locale } }) {
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");
    const fidePackSommaire = await getFidePackSommaire();
    //const posts = localizePosts(postsData, locale);
    return <VideosFidePageNoAsync fidePackSommaire={fidePackSommaire} locale={locale} hasPack={hasPack} />;
}

function VideosFidePageNoAsync({ fidePackSommaire, locale, hasPack }: { fidePackSommaire: any; locale: Locale; hasPack: boolean }) {
    const FlatFidePackSommaire = flattenFidePackSommaire(fidePackSommaire, locale);
    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center mb-8">
                            <div className="inner-container _725px center---full-width-mbl">
                                <div className="text-center mg-bottom-40px">
                                    <h1 className="display-1 mg-bottom-8px mb-8">
                                        Toutes nos <span className="heading-span-secondary-6">Vidéos FIDE</span>
                                    </h1>
                                    <p className="mg-bottom-0">
                                        Découvrez notre sélection de vidéos FIDE pour obtenir toutes les chances de <span className="heading-span-secondary-6">réussir votre examen</span>.
                                    </p>
                                </div>
                            </div>
                            <FideVideoList FlatFidePackSommaire={FlatFidePackSommaire} locale={locale} hasPack={hasPack} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type FlatFidePackSommaire = FlatFidePackItem[];

const COLORS = ["var(--secondary-1)", "var(--secondary-2)", "var(--secondary-4)", "var(--secondary-6)", "var(--secondary-5)", "var(--secondary-3)", "var(--secondary-6)"];
type ColorType = (typeof COLORS)[number];

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
    postIsPreview?: boolean;
}

/**
 * Aplatis le sommaire en respectant l'ordre Sanity (ordre des listes).
 * - Localise titres/sous-titres selon `locale`, avec fallback de bon sens.
 * - Ne modifie pas l’ordre: packages -> modules -> posts.
 */
function flattenFidePackSommaire(data: FidePackSommaire, locale: Locale = "fr"): FlatFidePackSommaire {
    const isEn = locale === "en";
    const pick = (fr?: string, en?: string): string => (isEn ? en ?? fr ?? "" : fr ?? en ?? "");

    const out: FlatFidePackSommaire = [];

    for (const [packIndex, pack] of (data?.packages ?? []).entries()) {
        const packageTitle = pick(pack.title, pack.title_en);
        const packageColor = COLORS[packIndex % COLORS.length] as ColorType;

        for (const mod of pack?.modules ?? []) {
            const moduleTitle = pick(mod.title, mod.title_en) || undefined;
            const moduleSubtitle = pick(mod.subtitle, mod.subtitle_en) || undefined;

            for (const post of mod?.posts ?? []) {
                out.push({
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
                    postTitle: pick(post.title, post.title_en),
                    postDescription: pick(post.description, post.description_en),
                    postLevel: post.level,
                    postDurationSec: post.durationSec,
                    postIsPreview: post.isPreview,
                });
            }
        }
    }

    return out;
}
