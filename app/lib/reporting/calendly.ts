import "server-only";

import { EVENT_TYPES } from "@/app/lib/constantes";
import { normalizeAcquisitionSource, type AcquisitionSource } from "@/app/lib/acquisition";
import type { ReportDateRange } from "./dateRange";

export type CalendlyLead = {
    eventUri: string;
    createdAt: string;
    scheduledAt?: string;
    name: string;
    email: string;
    source: AcquisitionSource;
    placement?: string;
};

export type CalendlyLeadResult =
    | {
          status: "available";
          leads: CalendlyLead[];
      }
    | {
          status: "not_configured" | "unavailable";
          leads: [];
          message: string;
      };

type CalendlyPagination = {
    next_page_token?: string | null;
};

type ScheduledEvent = {
    uri?: string;
    event_type?: string;
    start_time?: string;
};

type Invitee = {
    uri?: string;
    name?: string;
    email?: string;
    created_at?: string;
    tracking?: {
        utm_source?: string | null;
        utm_content?: string | null;
    } | null;
};

async function calendlyGet<T>(url: URL, token: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Calendly API ${response.status}: ${(await response.text()).slice(0, 500)}`);
    }

    return (await response.json()) as T;
}

async function fetchCommercialEvents(token: string, organization: string, range: ReportDateRange): Promise<ScheduledEvent[]> {
    const events: ScheduledEvent[] = [];
    let pageToken = "";

    for (let page = 0; page < 20; page += 1) {
        const url = new URL("https://api.calendly.com/scheduled_events");
        url.searchParams.set("organization", organization);
        url.searchParams.set("status", "active");
        url.searchParams.set("count", "100");
        url.searchParams.set("min_start_time", range.startIso);
        if (pageToken) url.searchParams.set("page_token", pageToken);

        const data = await calendlyGet<{ collection?: ScheduledEvent[]; pagination?: CalendlyPagination }>(url, token);
        for (const event of data.collection || []) {
            if (event.event_type === EVENT_TYPES["Your FIDE Plan"].uri) {
                events.push(event);
            }
        }

        pageToken = String(data.pagination?.next_page_token || "");
        if (!pageToken) break;
    }

    return events;
}

async function fetchEventInvitees(event: ScheduledEvent, token: string): Promise<Invitee[]> {
    const eventId = String(event.uri || "")
        .split("/")
        .filter(Boolean)
        .at(-1);
    if (!eventId) return [];

    const url = new URL(`https://api.calendly.com/scheduled_events/${eventId}/invitees`);
    url.searchParams.set("status", "active");
    url.searchParams.set("count", "100");
    const data = await calendlyGet<{ collection?: Invitee[] }>(url, token);
    return data.collection || [];
}

export async function fetchCalendlyCommercialLeads(range: ReportDateRange): Promise<CalendlyLeadResult> {
    const token = String(process.env.CALENDLY_ACCESS_TOKEN || "").trim();
    const organization = String(process.env.CALENDLY_ORGANIZATION || "").trim();
    if (!token || !organization) {
        return {
            status: "not_configured",
            leads: [],
            message: "Calendly n'est pas configuré.",
        };
    }

    try {
        const events = await fetchCommercialEvents(token, organization, range);
        const inviteeGroups = await Promise.all(events.map((event) => fetchEventInvitees(event, token)));
        const startMs = Date.parse(range.startIso);
        const endMs = Date.parse(range.endIso);
        const leads: CalendlyLead[] = [];

        events.forEach((event, eventIndex) => {
            for (const invitee of inviteeGroups[eventIndex] || []) {
                const createdAt = String(invitee.created_at || "");
                const createdAtMs = Date.parse(createdAt);
                if (!Number.isFinite(createdAtMs) || createdAtMs < startMs || createdAtMs >= endMs) continue;

                leads.push({
                    eventUri: String(invitee.uri || event.uri || ""),
                    createdAt,
                    scheduledAt: event.start_time,
                    name: String(invitee.name || invitee.email || "Inconnu"),
                    email: String(invitee.email || ""),
                    source: normalizeAcquisitionSource(invitee.tracking?.utm_source) || "unknown",
                    placement: String(invitee.tracking?.utm_content || "").trim() || undefined,
                });
            }
        });

        leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return { status: "available", leads };
    } catch (error) {
        console.error("[SalesReport] Calendly leads unavailable", error);
        return {
            status: "unavailable",
            leads: [],
            message: "Les demandes Calendly sont temporairement indisponibles.",
        };
    }
}
