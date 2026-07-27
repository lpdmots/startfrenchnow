import "server-only";

import { getDefaultMailOptions, htmlToText, transporter } from "@/app/lib/nodemailer";
import { ACQUISITION_SOURCE_LABELS } from "@/app/lib/acquisition";
import type { SalesReport } from "./salesReport";

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
        return new Intl.NumberFormat("fr-CH", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
}

function tableRows(rows: string[][]): string {
    return rows
        .map(
            (row) =>
                `<tr>${row
                    .map((cell) => `<td style="border-top:1px solid #ddd;padding:8px;vertical-align:top">${escapeHtml(cell)}</td>`)
                    .join("")}</tr>`,
        )
        .join("");
}

export function buildSalesReportEmail(report: SalesReport): { subject: string; html: string; text: string } {
    const revenue = Object.entries(report.summary.revenueByCurrency)
        .map(([currency, amount]) => formatMoney(amount, currency))
        .join(" · ");
    const adsCost =
        report.googleAds.status === "available"
            ? formatMoney(report.googleAds.amount, report.googleAds.currency)
            : report.googleAds.message;
    const convertedChf = report.euroFinancialSummary
        ? formatMoney(report.euroFinancialSummary.convertedChfRevenue, "EUR")
        : "Non calculable";
    const totalRevenueEur = report.euroFinancialSummary
        ? formatMoney(report.euroFinancialSummary.totalRevenue, "EUR")
        : "Non calculable";
    const estimated =
        report.euroFinancialSummary?.marketingResult !== undefined
        ? formatMoney(report.euroFinancialSummary.marketingResult, "EUR")
        : "Non calculable";
    const baseUrl = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://startfrenchnow.ch").replace(/\/$/, "");
    const reportUrl = `${baseUrl}/fr/admin/reports?from=${encodeURIComponent(report.range.from)}&to=${encodeURIComponent(report.range.to)}`;

    const html = `
      <div style="font-family:Arial,sans-serif;color:#222;line-height:1.5">
        <h1>Rapport ventes & acquisition</h1>
        <p><strong>Période :</strong> ${escapeHtml(report.range.from)} au ${escapeHtml(report.range.to)}</p>

        <h2>Résumé</h2>
        <ul>
          <li>Achats numériques : <strong>${report.summary.purchaseCount}</strong></li>
          <li>Nouveaux clients : <strong>${report.summary.newCustomerCount}</strong></li>
          <li>Revenus numériques : <strong>${escapeHtml(revenue || "Aucun montant")}</strong></li>
          ${Object.prototype.hasOwnProperty.call(report.summary.revenueByCurrency, "CHF") ? `<li>Revenus CHF convertis en EUR : <strong>${escapeHtml(convertedChf)}</strong></li>` : ""}
          <li>Total des revenus en EUR : <strong>${escapeHtml(totalRevenueEur)}</strong></li>
          <li>Dépenses Google Ads : <strong>${escapeHtml(adsCost)}</strong></li>
          <li>Résultat marketing estimé : <strong>${escapeHtml(estimated)}</strong></li>
          <li>Entretiens gratuits Calendly : <strong>${report.calendly.leads.length}</strong></li>
        </ul>

        <h2>Nouveaux clients par source</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <thead><tr><th style="text-align:left;padding:8px">Source</th><th style="text-align:left;padding:8px">Clients</th></tr></thead>
          <tbody>${tableRows(report.newCustomersBySource.map((row) => [row.label, String(row.count)]))}</tbody>
        </table>

        <h2>Produits numériques</h2>
        <table style="border-collapse:collapse;width:100%;max-width:700px">
          <thead><tr><th style="text-align:left;padding:8px">Produit</th><th style="text-align:left;padding:8px">Achats</th><th style="text-align:left;padding:8px">Quantité</th></tr></thead>
          <tbody>${tableRows(report.products.map((row) => [row.label, String(row.purchases), String(row.quantity)]))}</tbody>
        </table>

        <h2>Clients et ordre des achats</h2>
        <table style="border-collapse:collapse;width:100%">
          <thead><tr><th style="text-align:left;padding:8px">Nom</th><th style="text-align:left;padding:8px">Email</th><th style="text-align:left;padding:8px">Source</th><th style="text-align:left;padding:8px">Achats</th></tr></thead>
          <tbody>${tableRows(
              report.customers.map((customer) => [
                  customer.name,
                  customer.email,
                  ACQUISITION_SOURCE_LABELS[customer.source],
                  customer.sequence.join(" → "),
              ]),
          )}</tbody>
        </table>

        <h2>Entretiens gratuits Calendly</h2>
        <table style="border-collapse:collapse;width:100%">
          <thead><tr><th style="text-align:left;padding:8px">Nom</th><th style="text-align:left;padding:8px">Email</th><th style="text-align:left;padding:8px">Source</th><th style="text-align:left;padding:8px">Bouton</th></tr></thead>
          <tbody>${tableRows(
              report.calendly.leads.map((lead) => [
                  lead.name,
                  lead.email,
                  ACQUISITION_SOURCE_LABELS[lead.source],
                  lead.placement || "-",
              ]),
          )}</tbody>
        </table>

        <p style="margin-top:24px"><a href="${escapeHtml(reportUrl)}">Ouvrir ce rapport dans l'administration</a></p>
        <p style="color:#666;font-size:12px">Les cours privés et leurs montants sont exclus des chiffres financiers. Le résultat estimé ne déduit pas les frais Stripe, taxes ou autres coûts.</p>
      </div>
    `;

    return {
        subject: `Rapport Start French Now · ${report.range.from} au ${report.range.to}`,
        html,
        text: htmlToText(html),
    };
}

export async function sendSalesReportEmail(report: SalesReport) {
    const recipient = String(process.env.REPORT_EMAIL_TO || process.env.EMAILYOH || "").trim();
    if (!recipient) {
        throw new Error("REPORT_EMAIL_TO ou EMAILYOH doit être configuré pour envoyer le rapport.");
    }

    const message = buildSalesReportEmail(report);
    return transporter.sendMail({
        ...getDefaultMailOptions({ to: recipient }),
        ...message,
    });
}
