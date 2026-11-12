import "server-only";

import { groq } from "next-sanity";
import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import {
    ACQUISITION_SOURCE_LABELS,
    normalizeAcquisitionSource,
    type AcquisitionSource,
} from "@/app/lib/acquisition";
import { fetchCalendlyCommercialLeads, type CalendlyLeadResult } from "./calendly";
import { fetchHistoricalChfToEurRates, findHistoricalRate } from "./exchangeRate";
import { fetchGoogleAdsCost, type GoogleAdsCost } from "./googleAds";
import { fetchMetaAdsCost, type MetaAdsCost } from "./metaAds";
import type { ReportDateRange } from "./dateRange";

const PRIVATE_LESSON_REFERENCE_KEY = "Fide Preparation Class";

const PERIOD_PURCHASES_QUERY = groq`
*[
  _type == "pendingPurchase" &&
  purchasedAt >= $startIso &&
  purchasedAt < $endIso &&
  status != "refunded" &&
  status != "canceled"
] | order(purchasedAt asc){
  _id,
  email,
  purchasedAt,
  source,
  amountPaid,
  currency,
  status,
  "user": assignedTo->{
    _id,
    name,
    email
  },
  items[]{
    referenceKey,
    quantity,
    "productTitle": coalesce(productRef->title.fr, productRef->title.en, referenceKey)
  }
}
`;

const CUSTOMER_HISTORY_QUERY = groq`
*[
  _type == "pendingPurchase" &&
  lower(email) in $emails &&
  status != "refunded" &&
  status != "canceled"
] | order(purchasedAt asc){
  _id,
  email,
  purchasedAt,
  source,
  amountPaid,
  currency,
  status,
  "user": assignedTo->{
    _id,
    name,
    email
  },
  items[]{
    referenceKey,
    quantity,
    "productTitle": coalesce(productRef->title.fr, productRef->title.en, referenceKey)
  }
}
`;

type PurchaseItem = {
    referenceKey?: string;
    quantity?: number;
    productTitle?: string;
};

type PurchaseRecord = {
    _id: string;
    email?: string;
    purchasedAt?: string;
    source?: string;
    amountPaid?: number;
    currency?: string;
    status?: string;
    user?: {
        _id?: string;
        name?: string;
        email?: string;
    } | null;
    items?: PurchaseItem[];
};

export type SourceStat = {
    source: AcquisitionSource;
    label: string;
    count: number;
};

export type ProductStat = {
    referenceKey: string;
    label: string;
    quantity: number;
    purchases: number;
};

export type CustomerReportRow = {
    name: string;
    email: string;
    source: AcquisitionSource;
    firstPurchaseAt?: string;
    periodPurchaseCount: number;
    sequence: string[];
};

export type PrivateLessonReport = {
    purchaseCount: number;
    sources: SourceStat[];
    customers: CustomerReportRow[];
};

export type EuroFinancialSummary = {
    convertedChfRevenue: number;
    totalRevenue: number;
    marketingResult?: number;
};

export type FinancialSummary = {
    purchaseCount: number;
    revenueByCurrency: Record<string, number>;
    purchasesWithoutAmount: number;
    googleAds: GoogleAdsCost;
    metaAds: MetaAdsCost;
    /** Total Google Ads + Meta Ads en EUR (sources non configurées comptées à 0). */
    adsSpendEur?: number;
    euroFinancialSummary?: EuroFinancialSummary;
    chfConversionUnavailable: boolean;
};

export type TimelineGranularity = "day" | "week" | "month";

export type TimelinePoint = {
    /** Premier jour du regroupement (AAAA-MM-JJ, même découpage UTC que la période). */
    from: string;
    /** Dernier jour inclus du regroupement, borné à la fin de la période. */
    to: string;
    purchaseCount: number;
    newCustomerCount: number;
    /** Revenus EUR (EUR + CHF converti), undefined si les revenus EUR ne sont pas calculables. */
    revenueEur?: number;
};

export type SalesTimeline = {
    granularity: TimelineGranularity;
    points: TimelinePoint[];
};

export type SalesReport = {
    range: ReportDateRange;
    generatedAt: string;
    summary: {
        purchaseCount: number;
        newCustomerCount: number;
        revenueByCurrency: Record<string, number>;
        purchasesWithoutAmount: number;
    };
    newCustomersBySource: SourceStat[];
    purchasesBySource: SourceStat[];
    products: ProductStat[];
    customers: CustomerReportRow[];
    privateLessons: PrivateLessonReport;
    timeline: SalesTimeline;
    calendly: CalendlyLeadResult;
    calendlyBySource: SourceStat[];
    googleAds: GoogleAdsCost;
    metaAds: MetaAdsCost;
    adsSpendEur?: number;
    euroFinancialSummary?: EuroFinancialSummary;
    chfConversionUnavailable: boolean;
};

function normalizeEmail(value?: string): string {
    return String(value || "").trim().toLowerCase();
}

function purchaseSource(purchase?: PurchaseRecord): AcquisitionSource {
    return normalizeAcquisitionSource(purchase?.source) || "unknown";
}

function purchaseContainsPrivateLesson(purchase: PurchaseRecord): boolean {
    return (purchase.items || []).some((item) => item.referenceKey === PRIVATE_LESSON_REFERENCE_KEY);
}

function sourceStats(values: AcquisitionSource[]): SourceStat[] {
    const counts = new Map<AcquisitionSource, number>();
    for (const source of values) {
        counts.set(source, (counts.get(source) || 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([source, count]) => ({
            source,
            label: ACQUISITION_SOURCE_LABELS[source],
            count,
        }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function purchaseLabels(purchase: PurchaseRecord): string[] {
    return (purchase.items || []).map((item) => {
        const title = String(item.productTitle || item.referenceKey || "Produit");
        const quantity = Math.max(1, Number(item.quantity || 1));
        return quantity > 1 ? `${title} ×${quantity}` : title;
    });
}

function buildCustomerRows(periodPurchases: PurchaseRecord[], history: PurchaseRecord[]): CustomerReportRow[] {
    const historyByEmail = new Map<string, PurchaseRecord[]>();
    for (const purchase of history) {
        const email = normalizeEmail(purchase.email || purchase.user?.email);
        if (!email) continue;
        const current = historyByEmail.get(email) || [];
        current.push(purchase);
        historyByEmail.set(email, current);
    }

    const periodByEmail = new Map<string, PurchaseRecord[]>();
    for (const purchase of periodPurchases) {
        const email = normalizeEmail(purchase.email || purchase.user?.email);
        if (!email) continue;
        const current = periodByEmail.get(email) || [];
        current.push(purchase);
        periodByEmail.set(email, current);
    }

    return Array.from(periodByEmail.entries())
        .map(([email, purchases]) => {
            const allPurchases = historyByEmail.get(email) || purchases;
            const firstPurchase = allPurchases[0];
            const userName =
                [...purchases, ...allPurchases].map((purchase) => String(purchase.user?.name || "").trim()).find(Boolean) ||
                email;

            return {
                name: userName,
                email,
                source: purchaseSource(firstPurchase),
                firstPurchaseAt: firstPurchase?.purchasedAt,
                periodPurchaseCount: purchases.length,
                sequence: allPurchases.filter((purchase) => !purchaseContainsPrivateLesson(purchase)).flatMap(purchaseLabels),
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
}

function buildPrivateCustomerRows(purchases: PurchaseRecord[]): CustomerReportRow[] {
    const purchasesByEmail = new Map<string, PurchaseRecord[]>();
    for (const purchase of purchases) {
        const email = normalizeEmail(purchase.email || purchase.user?.email);
        if (!email) continue;
        const current = purchasesByEmail.get(email) || [];
        current.push(purchase);
        purchasesByEmail.set(email, current);
    }

    return Array.from(purchasesByEmail.entries())
        .map(([email, customerPurchases]) => {
            const firstPurchase = customerPurchases[0];
            const name =
                customerPurchases.map((purchase) => String(purchase.user?.name || "").trim()).find(Boolean) || email;

            return {
                name,
                email,
                source: purchaseSource(firstPurchase),
                firstPurchaseAt: firstPurchase?.purchasedAt,
                periodPurchaseCount: customerPurchases.length,
                sequence: [],
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
}

function buildProductStats(purchases: PurchaseRecord[]): ProductStat[] {
    const stats = new Map<string, ProductStat>();
    for (const purchase of purchases) {
        for (const item of purchase.items || []) {
            const referenceKey = String(item.referenceKey || "unknown");
            const quantity = Math.max(1, Number(item.quantity || 1));
            const current = stats.get(referenceKey) || {
                referenceKey,
                label: String(item.productTitle || referenceKey),
                quantity: 0,
                purchases: 0,
            };
            current.quantity += quantity;
            current.purchases += 1;
            stats.set(referenceKey, current);
        }
    }

    return Array.from(stats.values()).sort((a, b) => b.quantity - a.quantity || a.label.localeCompare(b.label));
}

function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

/** Somme des dépenses pub en EUR ; undefined si une source configurée est indisponible ou dans une autre devise. */
function totalAdsSpendEur(costs: GoogleAdsCost[]): number | undefined {
    let total = 0;
    for (const cost of costs) {
        if (cost.status === "not_configured") continue;
        if (cost.status !== "available" || cost.currency !== "EUR") return undefined;
        total += cost.amount;
    }
    return roundMoney(total);
}

type FinancialComputation = {
    summary: FinancialSummary;
    /** Montant EUR de chaque achat compté dans les revenus EUR, par _id. */
    eurAmountById: Map<string, number>;
};

async function calculateFinancialSummary(
    publicPurchases: PurchaseRecord[],
    googleAds: GoogleAdsCost,
    metaAds: MetaAdsCost,
    range: ReportDateRange,
): Promise<FinancialComputation> {
    const revenueByCurrency: Record<string, number> = {};
    let purchasesWithoutAmount = 0;
    for (const purchase of publicPurchases) {
        const amount = purchase.amountPaid;
        const currency = String(purchase.currency || "").toUpperCase();
        if (typeof amount !== "number" || !Number.isFinite(amount) || !currency) {
            purchasesWithoutAmount += 1;
            continue;
        }
        revenueByCurrency[currency] = roundMoney((revenueByCurrency[currency] || 0) + amount);
    }

    const hasEurRevenue = Object.prototype.hasOwnProperty.call(revenueByCurrency, "EUR");
    const hasChfRevenue = Object.prototype.hasOwnProperty.call(revenueByCurrency, "CHF");
    const hasAnyRevenue = Object.keys(revenueByCurrency).length > 0;
    let chfConversionUnavailable = false;
    let convertedChfRevenue = 0;
    const eurAmountById = new Map<string, number>();
    for (const purchase of publicPurchases) {
        if (String(purchase.currency || "").toUpperCase() !== "EUR") continue;
        if (typeof purchase.amountPaid !== "number" || !Number.isFinite(purchase.amountPaid)) continue;
        eurAmountById.set(purchase._id, purchase.amountPaid);
    }

    if (hasChfRevenue) {
        const rates = await fetchHistoricalChfToEurRates(range);
        if (!rates) {
            chfConversionUnavailable = true;
        } else {
            for (const purchase of publicPurchases) {
                if (String(purchase.currency || "").toUpperCase() !== "CHF") continue;
                if (typeof purchase.amountPaid !== "number" || !Number.isFinite(purchase.amountPaid)) continue;

                const rate = findHistoricalRate(rates, purchase.purchasedAt);
                if (rate === null) {
                    chfConversionUnavailable = true;
                    break;
                }
                convertedChfRevenue += purchase.amountPaid * rate;
                eurAmountById.set(purchase._id, purchase.amountPaid * rate);
            }
            convertedChfRevenue = roundMoney(convertedChfRevenue);
        }
    }

    const totalRevenueEur =
        !hasAnyRevenue
            ? 0
            : (hasEurRevenue || hasChfRevenue) && !chfConversionUnavailable
            ? roundMoney((revenueByCurrency.EUR || 0) + convertedChfRevenue)
            : undefined;
    const adsSpendEur = totalAdsSpendEur([googleAds, metaAds]);
    const marketingResult =
        totalRevenueEur !== undefined && adsSpendEur !== undefined ? roundMoney(totalRevenueEur - adsSpendEur) : undefined;
    const euroFinancialSummary =
        totalRevenueEur === undefined
            ? undefined
            : {
                  convertedChfRevenue,
                  totalRevenue: totalRevenueEur,
                  marketingResult,
              };

    return {
        summary: {
            purchaseCount: publicPurchases.length,
            revenueByCurrency,
            purchasesWithoutAmount,
            googleAds,
            metaAds,
            adsSpendEur,
            euroFinancialSummary,
            chfConversionUnavailable,
        },
        eurAmountById,
    };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDateKey(value: Date): string {
    return value.toISOString().slice(0, 10);
}

function timelineGranularity(range: ReportDateRange): TimelineGranularity {
    const days = Math.round((Date.parse(range.endIso) - Date.parse(range.startIso)) / DAY_MS);
    if (days > 366) return "month";
    if (days > 62) return "week";
    return "day";
}

/** Début du regroupement contenant la date, borné au début de la période. */
function bucketStart(date: Date, granularity: TimelineGranularity, rangeStart: Date): Date {
    let start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    if (granularity === "week") {
        start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
    } else if (granularity === "month") {
        start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    }
    return start.getTime() < rangeStart.getTime() ? new Date(rangeStart) : start;
}

function nextBucketStart(start: Date, granularity: TimelineGranularity): Date {
    if (granularity === "month") return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    const next = new Date(start);
    if (granularity === "week") {
        next.setUTCDate(next.getUTCDate() + 7 - ((next.getUTCDay() + 6) % 7));
    } else {
        next.setUTCDate(next.getUTCDate() + 1);
    }
    return next;
}

function buildTimeline(
    range: ReportDateRange,
    publicPurchases: PurchaseRecord[],
    newCustomerDates: string[],
    eurAmountById: Map<string, number>,
    revenueEurAvailable: boolean,
): SalesTimeline {
    const granularity = timelineGranularity(range);
    const rangeStart = new Date(range.startIso);
    const rangeEnd = new Date(range.endIso);
    const points: TimelinePoint[] = [];
    const indexByKey = new Map<string, number>();

    for (let start = new Date(rangeStart); start.getTime() < rangeEnd.getTime(); start = nextBucketStart(start, granularity)) {
        const end = nextBucketStart(start, granularity);
        const lastDay = new Date(Math.min(end.getTime(), rangeEnd.getTime()) - DAY_MS);
        indexByKey.set(utcDateKey(start), points.length);
        points.push({
            from: utcDateKey(start),
            to: utcDateKey(lastDay),
            purchaseCount: 0,
            newCustomerCount: 0,
            revenueEur: revenueEurAvailable ? 0 : undefined,
        });
    }

    const pointFor = (value?: string): TimelinePoint | undefined => {
        const date = new Date(String(value || ""));
        if (Number.isNaN(date.getTime())) return undefined;
        const index = indexByKey.get(utcDateKey(bucketStart(date, granularity, rangeStart)));
        return index === undefined ? undefined : points[index];
    };

    for (const purchase of publicPurchases) {
        const point = pointFor(purchase.purchasedAt);
        if (!point) continue;
        point.purchaseCount += 1;
        const eurAmount = eurAmountById.get(purchase._id);
        if (point.revenueEur !== undefined && eurAmount !== undefined) {
            point.revenueEur += eurAmount;
        }
    }

    for (const date of newCustomerDates) {
        const point = pointFor(date);
        if (point) point.newCustomerCount += 1;
    }

    for (const point of points) {
        if (point.revenueEur !== undefined) point.revenueEur = roundMoney(point.revenueEur);
    }

    return { granularity, points };
}

export async function generateFinancialSummary(range: ReportDateRange): Promise<FinancialSummary> {
    const [periodPurchases, googleAds, metaAds] = await Promise.all([
        sanity.fetch<PurchaseRecord[]>(PERIOD_PURCHASES_QUERY, {
            startIso: range.startIso,
            endIso: range.endIso,
        }),
        fetchGoogleAdsCost(range),
        fetchMetaAdsCost(range),
    ]);
    const publicPurchases = periodPurchases.filter((purchase) => !purchaseContainsPrivateLesson(purchase));
    const { summary } = await calculateFinancialSummary(publicPurchases, googleAds, metaAds, range);
    return summary;
}

export async function generateSalesReport(range: ReportDateRange): Promise<SalesReport> {
    const [periodPurchases, googleAds, metaAds, calendly] = await Promise.all([
        sanity.fetch<PurchaseRecord[]>(PERIOD_PURCHASES_QUERY, {
            startIso: range.startIso,
            endIso: range.endIso,
        }),
        fetchGoogleAdsCost(range),
        fetchMetaAdsCost(range),
        fetchCalendlyCommercialLeads(range),
    ]);

    const emails = Array.from(
        new Set(periodPurchases.map((purchase) => normalizeEmail(purchase.email || purchase.user?.email)).filter(Boolean)),
    );
    const publicPurchases = periodPurchases.filter((purchase) => !purchaseContainsPrivateLesson(purchase));
    const privatePurchases = periodPurchases.filter(purchaseContainsPrivateLesson);
    const [history, { summary: financialSummary, eurAmountById }] = await Promise.all([
        emails.length
            ? sanity.fetch<PurchaseRecord[]>(CUSTOMER_HISTORY_QUERY, { emails })
            : Promise.resolve([] as PurchaseRecord[]),
        calculateFinancialSummary(publicPurchases, googleAds, metaAds, range),
    ]);
    const customers = buildCustomerRows(publicPurchases, history);
    const privateCustomers = buildPrivateCustomerRows(privatePurchases);

    const historyByEmail = new Map<string, PurchaseRecord[]>();
    for (const purchase of history) {
        const email = normalizeEmail(purchase.email || purchase.user?.email);
        if (!email) continue;
        const current = historyByEmail.get(email) || [];
        current.push(purchase);
        historyByEmail.set(email, current);
    }

    const newCustomerSources: AcquisitionSource[] = [];
    const newCustomerDates: string[] = [];
    for (const customer of customers) {
        const firstPurchase = historyByEmail.get(customer.email)?.[0];
        const firstPurchaseTime = Date.parse(String(firstPurchase?.purchasedAt || ""));
        if (
            Number.isFinite(firstPurchaseTime) &&
            firstPurchaseTime >= Date.parse(range.startIso) &&
            firstPurchaseTime < Date.parse(range.endIso) &&
            firstPurchase &&
            !purchaseContainsPrivateLesson(firstPurchase)
        ) {
            newCustomerSources.push(purchaseSource(firstPurchase));
            newCustomerDates.push(String(firstPurchase.purchasedAt));
        }
    }

    const calendlyBySource = sourceStats(calendly.leads.map((lead) => lead.source));

    return {
        range,
        generatedAt: new Date().toISOString(),
        summary: {
            purchaseCount: publicPurchases.length,
            newCustomerCount: newCustomerSources.length,
            revenueByCurrency: financialSummary.revenueByCurrency,
            purchasesWithoutAmount: financialSummary.purchasesWithoutAmount,
        },
        newCustomersBySource: sourceStats(newCustomerSources),
        purchasesBySource: sourceStats(publicPurchases.map(purchaseSource)),
        products: buildProductStats(publicPurchases),
        customers,
        privateLessons: {
            purchaseCount: privatePurchases.length,
            sources: sourceStats(privatePurchases.map(purchaseSource)),
            customers: privateCustomers,
        },
        timeline: buildTimeline(
            range,
            publicPurchases,
            newCustomerDates,
            eurAmountById,
            financialSummary.euroFinancialSummary !== undefined,
        ),
        calendly,
        calendlyBySource,
        googleAds,
        metaAds,
        adsSpendEur: financialSummary.adsSpendEur,
        euroFinancialSummary: financialSummary.euroFinancialSummary,
        chfConversionUnavailable: financialSummary.chfConversionUnavailable,
    };
}
