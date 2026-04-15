"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        dataLayer?: unknown[];
        __sfnTrackedPurchaseIds?: string[];
    }
}

type PurchaseDataLayerPushProps = {
    transactionId?: string;
    value?: number;
    currency?: string;
    productSlug?: string;
    productName?: string;
    quantity?: number;
};

function sanitizeCurrency(currency?: string): string | undefined {
    const normalized = String(currency || "")
        .trim()
        .toUpperCase();
    return /^[A-Z]{3}$/.test(normalized) ? normalized : undefined;
}

function sanitizeQuantity(quantity?: number): number {
    if (!Number.isFinite(quantity)) return 1;
    const rounded = Math.round(quantity as number);
    return rounded > 0 ? rounded : 1;
}

export default function PurchaseDataLayerPush({ transactionId, value, currency, productSlug, productName, quantity }: PurchaseDataLayerPushProps) {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const txId = String(transactionId || "").trim();
        const amount = Number(value);
        const normalizedCurrency = sanitizeCurrency(currency);

        if (!txId || !Number.isFinite(amount) || !normalizedCurrency) return;

        const trackedPurchaseIds = window.__sfnTrackedPurchaseIds || [];
        if (trackedPurchaseIds.includes(txId)) return;

        const itemId = String(productSlug || txId).trim();
        const itemName = String(productName || productSlug || "Product").trim();
        const safeQuantity = sanitizeQuantity(quantity);

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: "purchase",
            ecommerce: {
                transaction_id: txId,
                value: amount,
                currency: normalizedCurrency,
                items: [
                    {
                        item_id: itemId,
                        item_name: itemName,
                        quantity: safeQuantity,
                    },
                ],
            },
        });

        window.__sfnTrackedPurchaseIds = [...trackedPurchaseIds, txId];
    }, [currency, productName, productSlug, quantity, transactionId, value]);

    return null;
}
