import "server-only";

import type { ReportDateRange } from "./dateRange";

const FRANKFURTER_RATES_URL = "https://api.frankfurter.dev/v2/rates";

export type HistoricalExchangeRate = {
    date: string;
    rate: number;
};

function dateBefore(value: string, days: number): string {
    const date = new Date(`${value}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
}

export async function fetchHistoricalChfToEurRates(range: ReportDateRange): Promise<HistoricalExchangeRate[] | null> {
    try {
        const url = new URL(FRANKFURTER_RATES_URL);
        url.searchParams.set("base", "CHF");
        url.searchParams.set("quotes", "EUR");
        url.searchParams.set("from", dateBefore(range.from, 7));
        url.searchParams.set("to", range.to);
        url.searchParams.set("providers", "ECB");

        const response = await fetch(url, {
            next: { revalidate: 24 * 60 * 60 },
        });
        if (!response.ok) {
            throw new Error(`Frankfurter API ${response.status}`);
        }

        const data = (await response.json()) as Array<{
            date?: string;
            rate?: number;
        }>;
        const rates = (data || [])
            .map((row) => ({
                date: String(row.date || ""),
                rate: Number(row.rate),
            }))
            .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.rate) && row.rate > 0)
            .sort((a, b) => a.date.localeCompare(b.date));

        if (rates.length === 0) {
            throw new Error("Aucun taux CHF/EUR disponible");
        }

        return rates;
    } catch (error) {
        console.error("[SalesReport] historical CHF/EUR conversion unavailable", error);
        return null;
    }
}

export function findHistoricalRate(rates: HistoricalExchangeRate[], purchasedAt?: string): number | null {
    const purchaseDate = String(purchasedAt || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) return null;

    for (let index = rates.length - 1; index >= 0; index -= 1) {
        if (rates[index].date <= purchaseDate) {
            return rates[index].rate;
        }
    }

    return null;
}
