import "server-only";

import type { ReportDateRange } from "./dateRange";
import { fetchHistoricalChfToEurRates as fetchHistoricalRatesWithFallback } from "./exchangeRateClient.mjs";

export type HistoricalExchangeRate = {
    date: string;
    rate: number;
};

export async function fetchHistoricalChfToEurRates(range: ReportDateRange): Promise<HistoricalExchangeRate[] | null> {
    try {
        return await fetchHistoricalRatesWithFallback(range);
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
