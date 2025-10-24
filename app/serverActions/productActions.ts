"use server";
import { groq } from "next-sanity";
import { SanityServerClient as client } from "../lib/sanity.clientServerDev";
import { EVENT_TYPES } from "../lib/constantes";
import { Lesson } from "../types/sfn/auth";
import { Image, Level, Slug } from "../types/sfn/blog";
import { Locale } from "@/i18n";

const queryUserLessons = groq`
*[_type == "user" && _id == $userId] {
    lessons,
    email,   
    alias,
}[0]`;

async function fetchCalendlyReservations(emails: string[], eventType: string) {
    const results: any[] = [];

    async function fetchPage(email: string, pageToken = null) {
        const url = new URL("https://api.calendly.com/scheduled_events");
        url.searchParams.append("invitee_email", email);
        url.searchParams.append("organization", process.env.CALENDLY_ORGANIZATION || "");
        url.searchParams.append("count", "100");
        url.searchParams.append("status", "active");
        url.searchParams.append("sort", "start_time:asc");
        if (pageToken) url.searchParams.append("page_token", pageToken);

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
            },
            next: { revalidate: 0 }, // Désactive le cache ISR
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des données Calendly");

        const data = await response.json();
        results.push(...data.collection);

        if (data.pagination.next_page_token) {
            await fetchPage(email, data.pagination.next_page_token);
        }
    }

    for (const email of emails) {
        await fetchPage(email);
    }

    return results.filter((event) => event.event_type === EVENT_TYPES[eventType as keyof typeof EVENT_TYPES].uri);
}

const getDefaultEventLesson = (eventType: keyof typeof EVENT_TYPES) => ({
    _type: "lessonEntry",
    eventType,
    totalPurchasedMinutes: 0,
    email: "",
    calendlyEvents: [],
});

export const getCalendlyData = async (userId: string, eventType: keyof typeof EVENT_TYPES) => {
    const userLessons = await client.fetch(queryUserLessons, { userId });
    const userEventLessons = userLessons?.lessons?.find((lesson: any) => lesson.eventType === eventType) || getDefaultEventLesson(eventType);

    // Récupérer les réservations Calendly pour l'email de l'utilisateur et le type de cours
    const emails = [userLessons.email, ...(userLessons.alias || [])];
    const calendlyEvents = userEventLessons.totalPurchasedMinutes ? await fetchCalendlyReservations(emails, eventType) : [];

    return {
        ...userEventLessons,
        email: userLessons.email,
        calendlyEvents,
    };
};

export async function cancelEventAction(eventId: string, reason: string) {
    try {
        const response = await fetch(`https://api.calendly.com/scheduled_events/${eventId}/cancellation`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: reason ? JSON.stringify({ reason }) : undefined,
        });

        if (!response.ok) {
            console.error("Error cancelling event:", response);
            throw new Error("Erreur lors de l'annulation de l'événement.");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Erreur dans cancelEventAction:", error);
        return { error: "Erreur lors de l'annulation de l'événement." };
    }
}

export const checkIfAlias = async (inviteeUri: string, emails: string[], userId: string) => {
    const event = await fetch(inviteeUri, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
    });
    const eventEmail = (await event.json()).resource.email;
    if (!emails.includes(eventEmail)) {
        await client
            .patch(userId)
            .setIfMissing({ alias: [] }) // Assure que "alias" est un tableau
            .insert("after", "alias[-1]", [eventEmail]) // Ajoute l'email sans écraser les autres
            .commit();
    }
};

export const getUserPurchases = async (userId: string, reference: string): Promise<Lesson | undefined> => {
    const userLessons = await client.fetch(queryUserLessons, { userId });
    return userLessons?.lessons?.find((lesson: any) => lesson.eventType === reference) || getDefaultEventLesson(reference as keyof typeof EVENT_TYPES);
};

export type FidePackSommaire = {
    packages: Array<{
        title: string;
        referenceKey: string;
        modules: Array<{
            _key: string;
            title?: string;
            subtitle?: string;
            level?: Array<Level>;
            posts: Array<{
                _id: string;
                slug: Slug;
                title: string;
                mainVideo?: { url: string };
                mainImage: Image;
                description: string;
                level?: Level[];
                durationSec?: number;
                isPreview?: boolean;
            }>;
        }>;
    }>;
};

export type FidePackSommaireNoLocale = {
    packages: Array<{
        title: string;
        title_en: string;
        referenceKey: string;
        modules: Array<{
            _key: string;
            title?: string;
            title_en?: string;
            subtitle?: string;
            subtitle_en?: string;
            level?: Array<Level>;
            posts: Array<{
                _id: string;
                slug: Slug;
                title: string;
                title_en: string;
                mainVideo?: { url: string };
                mainImage: Image;
                description: string;
                description_en: string;
                level?: Level[];
                durationSec?: number;
                isPreview?: boolean;
            }>;
        }>;
    }>;
};

const FIDE_TOC_QUERY = groq`
*[_type == "product" && referenceKey == $referenceKey][0]{
  packages[]->{
    title,
    title_en,
    referenceKey,
    "modules": modules[]{
      _key,
      title,
      title_en,
      subtitle,
      subtitle_en,
      level,
      posts[]->{
        _id,
        slug,
        mainVideo,
        mainImage,
        title,
        title_en,
        level,
        description,
        description_en,
        durationSec,
        isPreview,
        resources[]{
          title,
          "url": url.current
        }
      }
    }
  }
}
`;

export async function getFidePackSommaire(locale: Locale = "fr", referenceKey: string = "pack_fide"): Promise<FidePackSommaire> {
    // Pas de cache pour garantir un sommaire toujours frais en édition
    const data = await client.fetch<FidePackSommaireNoLocale>(FIDE_TOC_QUERY, { referenceKey });

    // Normalisation douce: si le produit est introuvable, renvoyer un shape vide
    return data ? normalizeFidePackSommaire(data, locale) : { packages: [] };
}

const FIDE_PACK_QUERY = groq`
*[_type == "productPackage" && referenceKey == $referenceKey][0]{
    title,
    title_en,
    referenceKey,
    "modules": modules[]{
      _key,
      title,
      title_en,
      subtitle,
      subtitle_en,
      level,
      posts[]->{
        _id,
        slug,
        mainVideo,
        mainImage,
        title,
        title_en,
        level,
        description,
        description_en,
        durationSec,
        isPreview,
        resources[]{
          title,
          "url": url.current
        }
      }
    }
  }
`;

export async function getPackSommaire(locale: Locale = "fr", referenceKey: string = "pack_fide_scenarios"): Promise<FidePackSommaire> {
    // Pas de cache pour garantir un sommaire toujours frais en édition
    const data = await client.fetch<FidePackSommaireNoLocale["packages"][0]>(FIDE_PACK_QUERY, { referenceKey });

    // Normalisation douce: si le produit est introuvable, renvoyer un shape vide
    return data ? normalizeFidePackSommaire({ packages: [data] }, locale) : { packages: [] };
}

function normalizeFidePackSommaire(data: FidePackSommaireNoLocale, locale: Locale): FidePackSommaire {
    // Treat empty strings as missing, then pick the best value per locale with graceful fallback.
    const coalesce = (...vals: Array<string | undefined>): string | undefined => vals.find((v) => typeof v === "string" && v.trim().length > 0);

    const pickOpt = (fr?: string, en?: string): string | undefined => (locale === "en" ? coalesce(en, fr) : coalesce(fr, en));

    const pickReq = (fr?: string, en?: string, fb: string = ""): string => pickOpt(fr, en) ?? fb;

    return {
        packages: (data?.packages ?? []).map((pkg) => ({
            title: pickReq(pkg.title, pkg.title_en, pkg.referenceKey),
            referenceKey: pkg.referenceKey,
            modules: (pkg.modules ?? []).map((mod) => ({
                _key: mod._key,
                title: pickOpt(mod.title, mod.title_en),
                subtitle: pickOpt(mod.subtitle, mod.subtitle_en),
                level: mod.level,
                posts: (mod.posts ?? []).map((post) => ({
                    _id: post._id,
                    slug: post.slug,
                    title: pickReq(post.title, post.title_en, "Untitled"),
                    mainVideo: post.mainVideo,
                    mainImage: post.mainImage,
                    description: pickReq(post.description, post.description_en, ""),
                    level: post.level,
                    durationSec: post.durationSec,
                    isPreview: post.isPreview,
                })),
            })),
        })),
    };
}
