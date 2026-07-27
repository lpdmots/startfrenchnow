import "server-only";

import { groq } from "next-sanity";
import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import {
    ACQUISITION_SOURCE_LABELS,
    normalizeAcquisitionSource,
    type AcquisitionSource,
} from "@/app/lib/acquisition";
import { fetchCalendlyCommercialLeads, type CalendlyLeadResult } from "./calendly";
import { fetchChfToEurRate } from "./exchangeRate";
import { fetchGoogleAdsCost, type GoogleAdsCost } from "./googleAds";
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
    calendly: CalendlyLeadResult;
    calendlyBySource: SourceStat[];
    googleAds: GoogleAdsCost;
    euroFinancialSummary?: {
        convertedChfRevenue: number;
        totalRevenue: number;
        marketingResult?: number;
    };
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

export async function generateSalesReport(range: ReportDateRange): Promise<SalesReport> {
    const [periodPurchases, googleAds, calendly] = await Promise.all([
        sanity.fetch<PurchaseRecord[]>(PERIOD_PURCHASES_QUERY, {
            startIso: range.startIso,
            endIso: range.endIso,
        }),
        fetchGoogleAdsCost(range),
        fetchCalendlyCommercialLeads(range),
    ]);

    const emails = Array.from(
        new Set(periodPurchases.map((purchase) => normalizeEmail(purchase.email || purchase.user?.email)).filter(Boolean)),
    );
    const history = emails.length
        ? await sanity.fetch<PurchaseRecord[]>(CUSTOMER_HISTORY_QUERY, { emails })
        : [];

    const publicPurchases = periodPurchases.filter((purchase) => !purchaseContainsPrivateLesson(purchase));
    const privatePurchases = periodPurchases.filter(purchaseContainsPrivateLesson);
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
        }
    }

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
    const chfToEurRate = hasChfRevenue ? await fetchChfToEurRate() : null;
    const chfConversionUnavailable = hasChfRevenue && chfToEurRate === null;
    const convertedChfRevenue = chfToEurRate === null ? 0 : roundMoney((revenueByCurrency.CHF || 0) * chfToEurRate);
    const totalRevenueEur =
        (hasEurRevenue || hasChfRevenue) && (!hasChfRevenue || chfToEurRate !== null)
            ? roundMoney((revenueByCurrency.EUR || 0) + convertedChfRevenue)
            : undefined;
    const marketingResult =
        totalRevenueEur !== undefined && googleAds.status === "available" && googleAds.currency === "EUR"
            ? roundMoney(totalRevenueEur - googleAds.amount)
            : undefined;
    const euroFinancialSummary =
        totalRevenueEur === undefined
            ? undefined
            : {
                  convertedChfRevenue,
                  totalRevenue: totalRevenueEur,
                  marketingResult,
              };
    const calendlyBySource = sourceStats(calendly.leads.map((lead) => lead.source));

    return {
        range,
        generatedAt: new Date().toISOString(),
        summary: {
            purchaseCount: publicPurchases.length,
            newCustomerCount: newCustomerSources.length,
            revenueByCurrency,
            purchasesWithoutAmount,
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
        calendly,
        calendlyBySource,
        googleAds,
        euroFinancialSummary,
        chfConversionUnavailable,
    };
}
