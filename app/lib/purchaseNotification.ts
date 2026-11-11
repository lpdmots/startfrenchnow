import "server-only";

import { getDefaultMailOptions, htmlToText, transporter } from "@/app/lib/nodemailer";
import { ACQUISITION_SOURCE_LABELS, type AcquisitionSource } from "@/app/lib/acquisition";

/** Produits dont l'achat déclenche une notification interne par email. */
const NOTIFIED_PRODUCTS: Record<string, string> = {
    "pack-fide": "Pack FIDE (pack exam)",
    mock_exam: "Examens blancs FIDE",
};

export function shouldNotifyPurchase(productSlug: string): boolean {
    return productSlug in NOTIFIED_PRODUCTS;
}

type PurchaseNotification = {
    productSlug: string;
    quantity: number;
    buyerEmail: string;
    amountPaid: number;
    currency: string;
    purchasedAt: string;
    stripePaymentId: string;
    acquisitionSource: AcquisitionSource;
    couponCode?: string;
    hasAccount: boolean;
};

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatMoney(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat("fr-CH", { style: "currency", currency }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
}

/**
 * Envoie une notification d'achat (pack exam / examens blancs) à l'adresse interne.
 * Destinataire : PURCHASE_NOTIFY_EMAIL_TO, sinon EMAILNICO, sinon SMTP_USER.
 * Ne lève jamais : un échec d'email ne doit pas faire échouer le webhook Stripe.
 */
export async function sendPurchaseNotification(purchase: PurchaseNotification): Promise<void> {
    const recipient = String(process.env.PURCHASE_NOTIFY_EMAIL_TO || process.env.EMAILNICO || process.env.SMTP_USER || "").trim();
    if (!recipient) {
        console.error("[PurchaseNotification] aucun destinataire configuré (PURCHASE_NOTIFY_EMAIL_TO / EMAILNICO / SMTP_USER)");
        return;
    }

    const productLabel = NOTIFIED_PRODUCTS[purchase.productSlug] || purchase.productSlug;
    const amount = formatMoney(purchase.amountPaid, purchase.currency || "CHF");
    const purchasedAt = new Intl.DateTimeFormat("fr-CH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Zurich",
    }).format(new Date(purchase.purchasedAt));

    const rows: [string, string][] = [
        ["Produit", productLabel],
        ["Quantité", String(purchase.quantity)],
        ["Montant payé", amount],
        ["Acheteur", purchase.buyerEmail],
        ["Compte existant", purchase.hasAccount ? "Oui" : "Non"],
        ["Date", purchasedAt],
        ["Source", ACQUISITION_SOURCE_LABELS[purchase.acquisitionSource] || purchase.acquisitionSource],
        ["Coupon", purchase.couponCode || "—"],
        ["Paiement Stripe", purchase.stripePaymentId],
    ];

    const html = `
<div style="font-family:Arial,sans-serif;color:#111827;max-width:560px">
  <h2 style="margin:0 0 16px">Nouvel achat : ${escapeHtml(productLabel)}</h2>
  <table style="border-collapse:collapse;width:100%;font-size:14px">
    ${rows
        .map(
            ([label, value]) =>
                `<tr><td style="border-top:1px solid #e5e7eb;padding:8px 12px;color:#6b7280;white-space:nowrap">${escapeHtml(label)}</td><td style="border-top:1px solid #e5e7eb;padding:8px 12px">${escapeHtml(value)}</td></tr>`,
        )
        .join("")}
  </table>
  <p style="margin-top:16px;font-size:13px"><a href="https://dashboard.stripe.com/payments/${encodeURIComponent(purchase.stripePaymentId)}">Voir le paiement dans Stripe</a></p>
</div>`;

    try {
        await transporter.sendMail({
            ...getDefaultMailOptions({ to: recipient }),
            subject: `Nouvel achat : ${productLabel} — ${amount}`,
            html,
            text: htmlToText(html),
        });
    } catch (error) {
        console.error("[PurchaseNotification] échec d'envoi", { stripePaymentId: purchase.stripePaymentId, error });
    }
}
