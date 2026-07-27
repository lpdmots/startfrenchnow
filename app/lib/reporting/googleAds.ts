import "server-only";

import { google } from "googleapis";
import type { ReportDateRange } from "./dateRange";

export type GoogleAdsCost =
    | {
          status: "available";
          amount: number;
          currency: string;
      }
    | {
          status: "not_configured" | "unavailable";
          message: string;
      };

function cleanCustomerId(value?: string): string {
    return String(value || "").replace(/\D/g, "");
}

function normalizePrivateKey(value?: string): string {
    return String(value || "").replace(/\\n/g, "\n").trim();
}

export async function fetchGoogleAdsCost(range: ReportDateRange): Promise<GoogleAdsCost> {
    const developerToken = String(process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "").trim();
    const customerId = cleanCustomerId(process.env.GOOGLE_ADS_CUSTOMER_ID);
    const loginCustomerId = cleanCustomerId(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID);
    const serviceAccountEmail = String(process.env.GOOGLE_ADS_SERVICE_ACCOUNT_EMAIL || "").trim();
    const privateKey = normalizePrivateKey(process.env.GOOGLE_ADS_SERVICE_ACCOUNT_PRIVATE_KEY);

    if (!developerToken || !customerId || !loginCustomerId || !serviceAccountEmail || !privateKey) {
        return {
            status: "not_configured",
            message: "Google Ads n'est pas encore configuré. Les revenus restent disponibles sans les dépenses publicitaires.",
        };
    }

    try {
        const auth = new google.auth.JWT({
            email: serviceAccountEmail,
            key: privateKey,
            scopes: ["https://www.googleapis.com/auth/adwords"],
        });
        const accessToken = await auth.getAccessToken();
        if (!accessToken.token) {
            throw new Error("Jeton OAuth Google Ads manquant");
        }

        const apiVersion = String(process.env.GOOGLE_ADS_API_VERSION || "v25").trim();
        const response = await fetch(`https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/googleAds:searchStream`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken.token}`,
                "Content-Type": "application/json",
                "developer-token": developerToken,
                "login-customer-id": loginCustomerId,
            },
            body: JSON.stringify({
                query: `
                    SELECT
                        customer.currency_code,
                        metrics.cost_micros
                    FROM customer
                    WHERE segments.date BETWEEN '${range.from}' AND '${range.to}'
                `,
            }),
            cache: "no-store",
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Google Ads API ${response.status}: ${body.slice(0, 500)}`);
        }

        const batches = (await response.json()) as Array<{
            results?: Array<{
                customer?: { currencyCode?: string };
                metrics?: { costMicros?: string | number };
            }>;
        }>;

        let costMicros = 0;
        let currency = "";
        for (const batch of batches || []) {
            for (const row of batch.results || []) {
                costMicros += Number(row.metrics?.costMicros || 0);
                currency ||= String(row.customer?.currencyCode || "").toUpperCase();
            }
        }

        return {
            status: "available",
            amount: Math.round((costMicros / 1_000_000) * 100) / 100,
            currency: currency || "CHF",
        };
    } catch (error) {
        console.error("[SalesReport] Google Ads cost unavailable", error);
        return {
            status: "unavailable",
            message: "Les dépenses Google Ads sont temporairement indisponibles.",
        };
    }
}
