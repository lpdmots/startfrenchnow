import { AcquisitionSource, acquisitionSourceFromReferrer, normalizeAcquisitionSource } from "./acquisition";

const STORAGE_KEY = "sfn_acquisition_source";
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

type StoredAcquisition = {
    source: AcquisitionSource;
    capturedAt: number;
    expiresAt: number;
};

function readStoredAcquisition(): StoredAcquisition | null {
    if (typeof window === "undefined") return null;

    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") as StoredAcquisition | null;
        const source = normalizeAcquisitionSource(parsed?.source);
        const expiresAt = Number(parsed?.expiresAt || 0);
        const capturedAt = Number(parsed?.capturedAt || 0);

        if (!source || !expiresAt || expiresAt <= Date.now()) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return { source, capturedAt, expiresAt };
    } catch {
        return null;
    }
}

function sourceFromCurrentPage(): AcquisitionSource | null {
    if (typeof window === "undefined") return null;

    const params = new URLSearchParams(window.location.search);
    if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) {
        return "google_ads";
    }

    const explicitSource = normalizeAcquisitionSource(params.get("src"));
    if (explicitSource && explicitSource !== "unknown") {
        return explicitSource;
    }
    if (params.has("src")) return "other";

    const utmSource = normalizeAcquisitionSource(params.get("utm_source"));
    const utmMedium = String(params.get("utm_medium") || "").toLowerCase();
    if (utmSource === "google_organic" && /(cpc|ppc|paid|ads?)/.test(utmMedium)) {
        return "google_ads";
    }
    if (utmSource && utmSource !== "unknown") {
        return utmSource;
    }
    if (params.has("utm_source")) return "other";

    const referrer = String(document.referrer || "").trim();
    const referrerSource = acquisitionSourceFromReferrer(referrer);
    if (referrerSource) return referrerSource;
    if (!referrer) return "direct";

    try {
        return new URL(referrer).origin === window.location.origin ? "direct" : "other";
    } catch {
        return "other";
    }
}

export function captureAcquisitionSource(): AcquisitionSource | null {
    if (typeof window === "undefined") return null;

    const existing = readStoredAcquisition();
    if (existing) return existing.source;

    const detected = sourceFromCurrentPage();
    if (!detected) return null;

    try {
        const capturedAt = Date.now();
        const value: StoredAcquisition = {
            source: detected,
            capturedAt,
            expiresAt: capturedAt + RETENTION_MS,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // Le tracking ne doit jamais gêner la navigation ou un paiement.
    }

    return detected;
}

export function getAcquisitionSource(): AcquisitionSource {
    return captureAcquisitionSource() || readStoredAcquisition()?.source || "unknown";
}

export function withCalendlyAttribution(url: string, placement: string): string {
    if (typeof window === "undefined") return url;

    try {
        const parsed = new URL(url);
        if (!parsed.hostname.endsWith("calendly.com")) return url;

        parsed.searchParams.set("utm_source", getAcquisitionSource());
        parsed.searchParams.set("utm_medium", "website");
        parsed.searchParams.set("utm_campaign", "startfrenchnow");
        parsed.searchParams.set("utm_content", String(placement || "website").slice(0, 200));
        return parsed.toString();
    } catch {
        return url;
    }
}
