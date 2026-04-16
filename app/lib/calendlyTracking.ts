export type CalendlyOpenMode = "popup" | "external_link";

declare global {
    interface Window {
        dataLayer?: unknown[];
    }
}

function isCalendlyUrl(url?: string): boolean {
    const raw = String(url || "").trim();
    if (!raw) return false;

    try {
        const parsed = new URL(raw, typeof window !== "undefined" ? window.location.origin : "https://www.startfrenchnow.com");
        return parsed.hostname.endsWith("calendly.com");
    } catch {
        return false;
    }
}

type TrackCalendlyOpenParams = {
    source: string;
    mode?: CalendlyOpenMode;
    url?: string;
};

export function trackCalendlyOpen({ source, mode = "popup", url }: TrackCalendlyOpenParams): void {
    if (typeof window === "undefined") return;

    const normalizedSource = String(source || "").trim();
    if (!normalizedSource) return;

    const normalizedUrl = String(url || "").trim();
    if (normalizedUrl && !isCalendlyUrl(normalizedUrl)) return;

    const calendlyPayload: Record<string, unknown> = {
        source: normalizedSource,
        mode,
        page_path: window.location.pathname,
    };

    if (normalizedUrl) {
        calendlyPayload.url = normalizedUrl;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: "ouvrir_calendly",
        calendly: calendlyPayload,
    });
}

export function isCalendlyLink(url?: string): boolean {
    return isCalendlyUrl(url);
}
