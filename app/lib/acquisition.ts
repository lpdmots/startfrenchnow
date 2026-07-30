export const ACQUISITION_SOURCES = [
    "youtube",
    "tiktok",
    "instagram",
    "udemy",
    "italki",
    "google_ads",
    "google_organic",
    "direct",
    "unknown",
    "other",
] as const;

export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

export const ACQUISITION_SOURCE_LABELS: Record<AcquisitionSource, string> = {
    youtube: "YouTube",
    tiktok: "TikTok",
    instagram: "Instagram",
    udemy: "Udemy",
    italki: "italki",
    google_ads: "Google Ads",
    google_organic: "Google (recherche)",
    direct: "Direct",
    unknown: "Inconnue",
    other: "Autre",
};

const SOURCE_ALIASES: Record<string, AcquisitionSource> = {
    youtube: "youtube",
    yt: "youtube",
    tiktok: "tiktok",
    tik_tok: "tiktok",
    tt: "tiktok",
    instagram: "instagram",
    insta: "instagram",
    ig: "instagram",
    udemy: "udemy",
    italki: "italki",
    italky: "italki",
    i_talki: "italki",
    google_ads: "google_ads",
    googleads: "google_ads",
    adwords: "google_ads",
    google_cpc: "google_ads",
    google_organic: "google_organic",
    google: "google_organic",
    organic_google: "google_organic",
    direct: "direct",
    unknown: "unknown",
    other: "other",
};

export function normalizeAcquisitionSource(value?: string | null): AcquisitionSource | null {
    const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

    return SOURCE_ALIASES[normalized] || null;
}

export function isReplaceableAcquisitionSource(source: AcquisitionSource): boolean {
    return source === "direct" || source === "unknown" || source === "other";
}

export function acquisitionSourceFromCoupon(couponCode?: string | null): AcquisitionSource | null {
    const normalized = String(couponCode || "")
        .trim()
        .toUpperCase();

    if (normalized === "PACKFIDE10") return "youtube";
    if (normalized === "TIKTOK10") return "tiktok";
    if (normalized === "INSTAGRAM10") return "instagram";
    return null;
}

export function acquisitionSourceFromReferrer(referrer?: string | null): AcquisitionSource | null {
    const raw = String(referrer || "").trim();
    if (!raw) return null;

    try {
        const hostname = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
        if (hostname === "youtu.be" || hostname.endsWith(".youtube.com") || hostname === "youtube.com") return "youtube";
        if (hostname.endsWith(".tiktok.com") || hostname === "tiktok.com") return "tiktok";
        if (hostname.endsWith(".instagram.com") || hostname === "instagram.com") return "instagram";
        if (hostname.endsWith(".udemy.com") || hostname === "udemy.com") return "udemy";
        if (hostname.endsWith(".italki.com") || hostname === "italki.com") return "italki";
        if (/^(google\.[a-z.]+)$/.test(hostname) || hostname.endsWith(".google.com")) return "google_organic";
    } catch {
        return null;
    }

    return null;
}
