"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        dataLayer?: unknown[];
    }
}

type CalendlySuccessPushProps = {
    eventUri?: string;
    currency?: string;
    value?: number;
};

function normalizeCalendlyEventUri(eventUri?: string): string {
    const raw = String(eventUri || "").trim();
    if (!raw) return "";
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

function extractCalendlyEventId(eventUri?: string): string {
    const normalizedUri = normalizeCalendlyEventUri(eventUri);
    if (!normalizedUri) return "";

    const regexMatch = normalizedUri.match(/scheduled_events\/([^/?#]+)/);
    if (regexMatch?.[1]) return regexMatch[1];

    const parts = normalizedUri.split("/").filter(Boolean);
    return parts.at(-1) || "";
}

export default function CalendlySuccessPush({ eventUri, currency = "CHF", value = 0 }: CalendlySuccessPushProps) {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const normalizedEventUri = normalizeCalendlyEventUri(eventUri);
        const eventId = extractCalendlyEventId(normalizedEventUri);

        if (!eventId) return;

        const dedupeKey = `calendly_success_${eventId}`;
        try {
            if (sessionStorage.getItem(dedupeKey)) return;
            sessionStorage.setItem(dedupeKey, "1");
        } catch {
            // no-op (mode privé / quota / etc.)
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: "rdv_calendly",
            calendly: {
                transaction_id: eventId,
                value,
                currency,
                event_uri: normalizedEventUri,
            },
        });
    }, [currency, eventUri, value]);

    return null;
}
