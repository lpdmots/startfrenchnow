const FRANKFURTER_RATES_URL = "https://api.frankfurter.dev/v2/rates";
const ECB_RATES_URL = "https://data-api.ecb.europa.eu/service/data/EXR/D.CHF.EUR.SP00.A";

/**
 * @typedef {{ from: string, to: string }} DateRange
 * @typedef {{ date: string, rate: number }} HistoricalExchangeRate
 * @typedef {{ fetchImpl?: typeof fetch, logger?: Pick<Console, "warn"> }} FetchOptions
 */

function dateBefore(value, days) {
    const date = new Date(`${value}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
}

function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}

function normalizeFrankfurterRates(data) {
    if (!Array.isArray(data)) return [];

    return data
        .map((row) => ({
            date: String(row?.date || ""),
            rate: Number(row?.rate),
        }))
        .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.rate) && row.rate > 0)
        .sort((a, b) => a.date.localeCompare(b.date));
}

function parseEcbRates(csv) {
    const lines = String(csv || "")
        .trim()
        .split(/\r?\n/)
        .filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",");
    const dateIndex = headers.indexOf("TIME_PERIOD");
    const valueIndex = headers.indexOf("OBS_VALUE");
    if (dateIndex < 0 || valueIndex < 0) return [];

    return lines
        .slice(1)
        .map((line) => {
            const columns = line.split(",");
            const chfPerEur = Number(columns[valueIndex]);
            return {
                date: String(columns[dateIndex] || ""),
                rate: chfPerEur > 0 ? 1 / chfPerEur : Number.NaN,
            };
        })
        .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.rate) && row.rate > 0)
        .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchFrankfurterRates(range, fetchImpl) {
    const url = new URL(FRANKFURTER_RATES_URL);
    url.searchParams.set("base", "CHF");
    url.searchParams.set("quotes", "EUR");
    url.searchParams.set("from", dateBefore(range.from, 7));
    url.searchParams.set("to", range.to);
    url.searchParams.set("providers", "ECB");

    const response = await fetchImpl(url, { next: { revalidate: 24 * 60 * 60 } });
    if (!response.ok) throw new Error(`Frankfurter API ${response.status}`);

    const rates = normalizeFrankfurterRates(await response.json());
    if (rates.length === 0) throw new Error("Aucun taux CHF/EUR disponible via Frankfurter");
    return rates;
}

async function fetchEcbRates(range, fetchImpl) {
    const url = new URL(ECB_RATES_URL);
    url.searchParams.set("startPeriod", dateBefore(range.from, 7));
    url.searchParams.set("endPeriod", range.to);
    url.searchParams.set("format", "csvdata");

    const response = await fetchImpl(url, { next: { revalidate: 24 * 60 * 60 } });
    if (!response.ok) throw new Error(`ECB API ${response.status}`);

    const rates = parseEcbRates(await response.text());
    if (rates.length === 0) throw new Error("Aucun taux CHF/EUR disponible via la BCE");
    return rates;
}

/**
 * Fetches ECB CHF/EUR historical rates, using the ECB data API directly if
 * Frankfurter is temporarily unavailable.
 *
 * @param {DateRange} range
 * @param {FetchOptions} [options]
 * @returns {Promise<HistoricalExchangeRate[]>}
 */
export async function fetchHistoricalChfToEurRates(range, options = {}) {
    const fetchImpl = options.fetchImpl || globalThis.fetch;
    const logger = options.logger || console;

    try {
        return await fetchFrankfurterRates(range, fetchImpl);
    } catch (primaryError) {
        logger.warn("[SalesReport] Frankfurter unavailable; using the ECB fallback", primaryError);
        try {
            return await fetchEcbRates(range, fetchImpl);
        } catch (fallbackError) {
            throw new Error(`${errorMessage(primaryError)}; ${errorMessage(fallbackError)}`);
        }
    }
}
