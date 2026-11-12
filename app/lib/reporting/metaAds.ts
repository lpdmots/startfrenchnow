import "server-only";

import type { GoogleAdsCost } from "./googleAds";
import type { ReportDateRange } from "./dateRange";

export type MetaAdsCost = GoogleAdsCost;

type MetaInsightsResponse = {
    data?: Array<{ spend?: string }>;
    error?: { message?: string };
};

type MetaAccountResponse = {
    currency?: string;
    error?: { message?: string };
};

function cleanAccountId(value?: string): string {
    return String(value || "").replace(/\D/g, "");
}

async function fetchGraph<T extends { error?: { message?: string } }>(path: string, params: Record<string, string>, accessToken: string): Promise<T> {
    const apiVersion = String(process.env.META_GRAPH_API_VERSION || "v24.0").trim();
    const url = new URL(`https://graph.facebook.com/${apiVersion}/${path}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    });
    const body = (await response.json().catch(() => ({}))) as T;
    if (!response.ok || body.error) {
        throw new Error(`Meta Marketing API ${response.status}: ${String(body.error?.message || "").slice(0, 500)}`);
    }
    return body;
}

export async function fetchMetaAdsCost(range: ReportDateRange): Promise<MetaAdsCost> {
    const accountId = cleanAccountId(process.env.META_ADS_ACCOUNT_ID);
    const accessToken = String(process.env.META_ADS_ACCESS_TOKEN || "").trim();

    if (!accountId || !accessToken) {
        return {
            status: "not_configured",
            message: "Meta Ads n'est pas encore configuré.",
        };
    }

    try {
        const [insights, account] = await Promise.all([
            fetchGraph<MetaInsightsResponse>(
                `act_${accountId}/insights`,
                {
                    fields: "spend",
                    level: "account",
                    time_range: JSON.stringify({ since: range.from, until: range.to }),
                },
                accessToken,
            ),
            fetchGraph<MetaAccountResponse>(`act_${accountId}`, { fields: "currency" }, accessToken),
        ]);

        // Aucune ligne = aucune dépense sur la période.
        const spend = (insights.data || []).reduce((total, row) => total + (Number(row.spend) || 0), 0);

        return {
            status: "available",
            amount: Math.round(spend * 100) / 100,
            currency: String(account.currency || "EUR").toUpperCase(),
        };
    } catch (error) {
        console.error("[SalesReport] Meta Ads cost unavailable", error);
        return {
            status: "unavailable",
            message: "Les dépenses Meta Ads sont temporairement indisponibles.",
        };
    }
}
