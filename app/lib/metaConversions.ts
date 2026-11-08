import { createHash } from "crypto";
import type { NextRequest } from "next/server";

// API Conversions Meta : envoie l'achat côté serveur (webhook Stripe), en complément du pixel navigateur.
// Uniquement si le visiteur a accepté le pixel Meta dans le bandeau cookies (tarteaucitron).

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v24.0";
const REQUEST_TIMEOUT_MS = 5000;
const STRIPE_METADATA_MAX_LENGTH = 500;

/** Clés ajoutées aux metadata du PaymentIntent, relues par le webhook. */
export type MetaPaymentMetadata = {
    metaConsent?: "1";
    metaFbp?: string;
    metaFbc?: string;
    metaClientIp?: string;
    metaUserAgent?: string;
    metaEventSourceUrl?: string;
};

function hasMetaPixelConsent(tarteaucitronCookie?: string): boolean {
    let raw = String(tarteaucitronCookie || "");
    try {
        raw = decodeURIComponent(raw);
    } catch {
        // valeur brute
    }
    return /!facebookpixel=true(?:!|$)/.test(raw);
}

function truncate(value: string | null | undefined): string | undefined {
    const trimmed = String(value || "").trim();
    return trimmed ? trimmed.slice(0, STRIPE_METADATA_MAX_LENGTH) : undefined;
}

/** À appeler à la création du PaymentIntent : capture ce dont Meta a besoin pour attribuer l'achat. */
export function collectMetaPaymentMetadata(request: NextRequest): MetaPaymentMetadata {
    if (!process.env.NEXT_PUBLIC_META_PIXEL_ID || !process.env.META_CAPI_ACCESS_TOKEN) return {};
    if (!hasMetaPixelConsent(request.cookies.get("tarteaucitron")?.value)) return {};

    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
    const clientIp = forwardedFor || request.headers.get("x-real-ip");

    const metadata: MetaPaymentMetadata = {
        metaConsent: "1",
        metaFbp: truncate(request.cookies.get("_fbp")?.value),
        metaFbc: truncate(request.cookies.get("_fbc")?.value),
        metaClientIp: truncate(clientIp),
        metaUserAgent: truncate(request.headers.get("user-agent")),
        metaEventSourceUrl: truncate(request.headers.get("referer")),
    };

    return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined)) as MetaPaymentMetadata;
}

function sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
}

type MetaPurchaseEvent = {
    eventId: string;
    eventTime: number;
    email: string;
    value: number;
    currency: string;
    productSlug: string;
    quantity: number;
    metadata: Record<string, string | undefined> | null | undefined;
};

/** Envoie l'événement Purchase. Ne lève jamais d'erreur : un échec ne doit pas bloquer le webhook. */
export async function sendMetaPurchaseEvent({ eventId, eventTime, email, value, currency, productSlug, quantity, metadata }: MetaPurchaseEvent): Promise<void> {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    if (!pixelId || !accessToken) return;
    if (metadata?.metaConsent !== "1") return;

    const normalizedEmail = email.trim().toLowerCase();
    const userData: Record<string, unknown> = {
        ...(normalizedEmail ? { em: [sha256(normalizedEmail)] } : {}),
        ...(metadata.metaFbp ? { fbp: metadata.metaFbp } : {}),
        ...(metadata.metaFbc ? { fbc: metadata.metaFbc } : {}),
        ...(metadata.metaClientIp ? { client_ip_address: metadata.metaClientIp } : {}),
        ...(metadata.metaUserAgent ? { client_user_agent: metadata.metaUserAgent } : {}),
    };

    const body = {
        data: [
            {
                event_name: "Purchase",
                event_time: eventTime,
                event_id: eventId,
                action_source: "website",
                ...(metadata.metaEventSourceUrl ? { event_source_url: metadata.metaEventSourceUrl } : {}),
                user_data: userData,
                custom_data: {
                    value,
                    currency,
                    content_ids: [productSlug],
                    content_type: "product",
                    num_items: quantity,
                },
            },
        ],
        ...(process.env.META_CAPI_TEST_EVENT_CODE ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE } : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        if (!res.ok) {
            const detail = await res.text().catch(() => "");
            console.error("[MetaCAPI] Purchase rejected", { eventId, status: res.status, detail: detail.slice(0, 500) });
        }
    } catch (error) {
        console.error("[MetaCAPI] Purchase failed", { eventId, error: (error as Error).message });
    } finally {
        clearTimeout(timeout);
    }
}
