import "server-only";

import { getDefaultMailOptions, htmlToText, transporter } from "@/app/lib/nodemailer";
import { ACQUISITION_SOURCE_LABELS } from "@/app/lib/acquisition";
import { monthToDateComparisonRanges, type ReportDateRange } from "./dateRange";
import {
    generateFinancialSummary,
    type FinancialSummary,
    type SalesReport,
} from "./salesReport";

type MonthlyComparison = {
    currentRange: ReportDateRange;
    previousRange: ReportDateRange;
    current: FinancialSummary;
    previous: FinancialSummary;
    resultDifference?: number;
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
        return new Intl.NumberFormat("fr-CH", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
}

function formatSignedMoney(amount: number): string {
    const formatted = formatMoney(Math.abs(amount), "EUR");
    if (amount > 0) return `+${formatted}`;
    if (amount < 0) return `−${formatted}`;
    return formatted;
}

function formatPeriod(range: ReportDateRange): string {
    const format = (value: string) =>
        new Intl.DateTimeFormat("fr-CH", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        }).format(new Date(`${value}T00:00:00.000Z`));

    return `${format(range.from)} – ${format(range.to)}`;
}

function tableRows(rows: string[][]): string {
    return rows
        .map(
            (row) =>
                `<tr>${row
                    .map((cell) => `<td style="border-top:1px solid #e5e7eb;padding:10px 12px;vertical-align:top">${escapeHtml(cell)}</td>`)
                    .join("")}</tr>`,
        )
        .join("");
}

function financialRevenue(summary: FinancialSummary): string {
    return summary.euroFinancialSummary
        ? formatMoney(summary.euroFinancialSummary.totalRevenue, "EUR")
        : "Non calculable";
}

function financialAds(summary: FinancialSummary): string {
    return summary.googleAds.status === "available"
        ? formatMoney(summary.googleAds.amount, summary.googleAds.currency)
        : "Indisponible";
}

function financialResult(summary: FinancialSummary): string {
    return summary.euroFinancialSummary?.marketingResult !== undefined
        ? formatMoney(summary.euroFinancialSummary.marketingResult, "EUR")
        : "Non calculable";
}

async function generateMonthlyComparison(now = new Date()): Promise<MonthlyComparison> {
    const ranges = monthToDateComparisonRanges(now);
    const [current, previous] = await Promise.all([
        generateFinancialSummary(ranges.current),
        generateFinancialSummary(ranges.previous),
    ]);
    const currentResult = current.euroFinancialSummary?.marketingResult;
    const previousResult = previous.euroFinancialSummary?.marketingResult;

    return {
        currentRange: ranges.current,
        previousRange: ranges.previous,
        current,
        previous,
        resultDifference:
            currentResult !== undefined && previousResult !== undefined
                ? Math.round((currentResult - previousResult) * 100) / 100
                : undefined,
    };
}

export function buildSalesReportEmail(
    report: SalesReport,
    monthlyComparison?: MonthlyComparison,
): { subject: string; html: string; text: string } {
    const revenue = Object.entries(report.summary.revenueByCurrency)
        .map(([currency, amount]) => formatMoney(amount, currency))
        .join(" · ");
    const adsCost =
        report.googleAds.status === "available"
            ? formatMoney(report.googleAds.amount, report.googleAds.currency)
            : report.googleAds.message;
    const totalRevenueEur = report.euroFinancialSummary
        ? formatMoney(report.euroFinancialSummary.totalRevenue, "EUR")
        : "Non calculable";
    const estimated =
        report.euroFinancialSummary?.marketingResult !== undefined
            ? formatMoney(report.euroFinancialSummary.marketingResult, "EUR")
            : "Non calculable";
    const baseUrl = String(
        process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.NEXT_PUBLIC_BASE_URL ||
            "https://startfrenchnow.ch",
    ).replace(/\/$/, "");
    const reportUrl = `${baseUrl}/fr/admin/reports?from=${encodeURIComponent(report.range.from)}&to=${encodeURIComponent(report.range.to)}`;

    const monthlyDifference = monthlyComparison?.resultDifference;
    const monthlyDifferenceColor =
        monthlyDifference === undefined ? "#6b7280" : monthlyDifference >= 0 ? "#15803d" : "#b91c1c";
    const monthlySection = monthlyComparison
        ? `
          <div style="margin:0 0 24px;background:#ffffff;border:1px solid #ddd6fe;border-radius:14px;overflow:hidden">
            <div style="padding:18px 20px;background:#f5f3ff">
              <h2 style="margin:0;color:#4c1d95;font-size:20px">Bilan du mois en cours</h2>
              <p style="margin:5px 0 0;color:#6b7280;font-size:13px">Comparaison avec la même durée du mois précédent</p>
            </div>
            <div style="padding:0 20px 18px">
              <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
                <thead>
                  <tr>
                    <th style="padding:12px 8px;text-align:left;color:#6b7280">Période</th>
                    <th style="padding:12px 8px;text-align:right;color:#6b7280">Revenus</th>
                    <th style="padding:12px 8px;text-align:right;color:#6b7280">Google Ads</th>
                    <th style="padding:12px 8px;text-align:right;color:#6b7280">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:12px 8px;border-top:1px solid #e5e7eb;font-weight:700">${escapeHtml(formatPeriod(monthlyComparison.currentRange))}</td>
                    <td style="padding:12px 8px;border-top:1px solid #e5e7eb;text-align:right">${escapeHtml(financialRevenue(monthlyComparison.current))}</td>
                    <td style="padding:12px 8px;border-top:1px solid #e5e7eb;text-align:right">${escapeHtml(financialAds(monthlyComparison.current))}</td>
                    <td style="padding:12px 8px;border-top:1px solid #e5e7eb;text-align:right;font-weight:700">${escapeHtml(financialResult(monthlyComparison.current))}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 8px;border-top:1px solid #e5e7eb">${escapeHtml(formatPeriod(monthlyComparison.previousRange))}</td>
                    <td style="padding:12px 8px;border-top:1px solid #e5e7eb;text-align:right">${escapeHtml(financialRevenue(monthlyComparison.previous))}</td>
                    <td style="padding:12px 8px;border-top:1px solid #e5e7eb;text-align:right">${escapeHtml(financialAds(monthlyComparison.previous))}</td>
                    <td style="padding:12px 8px;border-top:1px solid #e5e7eb;text-align:right">${escapeHtml(financialResult(monthlyComparison.previous))}</td>
                  </tr>
                </tbody>
              </table>
              <div style="margin-top:12px;padding:14px;border-radius:10px;background:#f9fafb;text-align:center">
                <span style="color:#6b7280;font-size:13px">Différence de résultat</span><br>
                <strong style="font-size:24px;color:${monthlyDifferenceColor}">${escapeHtml(monthlyDifference === undefined ? "Non calculable" : formatSignedMoney(monthlyDifference))}</strong>
              </div>
            </div>
          </div>
        `
        : `
          <div style="margin:0 0 24px;padding:16px 20px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px">
            <strong>Bilan mensuel temporairement indisponible.</strong>
          </div>
        `;

    const html = `
      <!doctype html>
      <html lang="fr">
        <body style="margin:0;padding:0;background:#f3f4f6;color:#1f2937;font-family:Arial,Helvetica,sans-serif">
          <div style="display:none;max-height:0;overflow:hidden">Ventes, acquisition et bilan mensuel Start French Now</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6">
            <tr>
              <td align="center" style="padding:24px 12px">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px">
                  <tr>
                    <td style="padding:28px 30px;background:#4c1d95;border-radius:16px 16px 0 0;color:#ffffff">
                      <p style="margin:0 0 8px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#ddd6fe">Start French Now</p>
                      <h1 style="margin:0;font-size:30px;line-height:1.2">Rapport ventes & acquisition</h1>
                      <p style="margin:10px 0 0;color:#ede9fe">${escapeHtml(formatPeriod(report.range))}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px;background:#fafafa;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px">
                      ${monthlySection}

                      <h2 style="margin:0 0 12px;font-size:20px;color:#111827">Période du rapport</h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px">
                        <tr>
                          <td style="width:33%;padding:14px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
                            <span style="font-size:12px;color:#6b7280">Achats numériques</span><br>
                            <strong style="font-size:24px;color:#111827">${report.summary.purchaseCount}</strong>
                          </td>
                          <td style="width:2%"></td>
                          <td style="width:31%;padding:14px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
                            <span style="font-size:12px;color:#6b7280">Revenus en EUR</span><br>
                            <strong style="font-size:24px;color:#111827">${escapeHtml(totalRevenueEur)}</strong>
                          </td>
                          <td style="width:2%"></td>
                          <td style="width:32%;padding:14px;background:#ffffff;border:1px solid #ddd6fe;border-radius:12px">
                            <span style="font-size:12px;color:#6b7280">Résultat estimé</span><br>
                            <strong style="font-size:24px;color:#4c1d95">${escapeHtml(estimated)}</strong>
                          </td>
                        </tr>
                      </table>

                      <div style="margin-bottom:24px;padding:18px 20px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px">
                        <h2 style="margin:0 0 10px;font-size:18px">Résumé financier</h2>
                        <p style="margin:5px 0">Revenus originaux : <strong>${escapeHtml(revenue || "Aucun montant")}</strong></p>
                        <p style="margin:5px 0">Total après conversion CHF → EUR : <strong>${escapeHtml(totalRevenueEur)}</strong></p>
                        <p style="margin:5px 0">Dépenses Google Ads : <strong>${escapeHtml(adsCost)}</strong></p>
                        <p style="margin:5px 0">Nouveaux clients : <strong>${report.summary.newCustomerCount}</strong></p>
                        <p style="margin:5px 0">Entretiens gratuits Calendly : <strong>${report.calendly.leads.length}</strong></p>
                      </div>

                      <div style="margin-bottom:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
                        <h2 style="margin:0;padding:18px 20px;font-size:18px">Nouveaux clients par source</h2>
                        <table style="border-collapse:collapse;width:100%;font-size:14px">
                          <thead><tr><th style="text-align:left;padding:10px 12px;background:#f9fafb">Source</th><th style="text-align:right;padding:10px 12px;background:#f9fafb">Clients</th></tr></thead>
                          <tbody>${tableRows(report.newCustomersBySource.map((row) => [row.label, String(row.count)]))}</tbody>
                        </table>
                      </div>

                      <div style="margin-bottom:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
                        <h2 style="margin:0;padding:18px 20px;font-size:18px">Produits numériques</h2>
                        <table style="border-collapse:collapse;width:100%;font-size:14px">
                          <thead><tr><th style="text-align:left;padding:10px 12px;background:#f9fafb">Produit</th><th style="text-align:right;padding:10px 12px;background:#f9fafb">Achats</th><th style="text-align:right;padding:10px 12px;background:#f9fafb">Quantité</th></tr></thead>
                          <tbody>${tableRows(report.products.map((row) => [row.label, String(row.purchases), String(row.quantity)]))}</tbody>
                        </table>
                      </div>

                      <div style="margin-bottom:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
                        <h2 style="margin:0;padding:18px 20px;font-size:18px">Clients et ordre des achats</h2>
                        <table style="border-collapse:collapse;width:100%;font-size:13px">
                          <thead><tr><th style="text-align:left;padding:10px 12px;background:#f9fafb">Nom</th><th style="text-align:left;padding:10px 12px;background:#f9fafb">Email</th><th style="text-align:left;padding:10px 12px;background:#f9fafb">Source</th><th style="text-align:left;padding:10px 12px;background:#f9fafb">Achats</th></tr></thead>
                          <tbody>${tableRows(
                              report.customers.map((customer) => [
                                  customer.name,
                                  customer.email,
                                  ACQUISITION_SOURCE_LABELS[customer.source],
                                  customer.sequence.join(" → "),
                              ]),
                          )}</tbody>
                        </table>
                      </div>

                      <div style="margin-bottom:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
                        <h2 style="margin:0;padding:18px 20px;font-size:18px">Entretiens gratuits Calendly</h2>
                        <table style="border-collapse:collapse;width:100%;font-size:13px">
                          <thead><tr><th style="text-align:left;padding:10px 12px;background:#f9fafb">Nom</th><th style="text-align:left;padding:10px 12px;background:#f9fafb">Email</th><th style="text-align:left;padding:10px 12px;background:#f9fafb">Source</th><th style="text-align:left;padding:10px 12px;background:#f9fafb">Bouton</th></tr></thead>
                          <tbody>${tableRows(
                              report.calendly.leads.map((lead) => [
                                  lead.name,
                                  lead.email,
                                  ACQUISITION_SOURCE_LABELS[lead.source],
                                  lead.placement || "-",
                              ]),
                          )}</tbody>
                        </table>
                      </div>

                      <div style="text-align:center;margin:28px 0">
                        <a href="${escapeHtml(reportUrl)}" style="display:inline-block;padding:13px 22px;background:#4c1d95;color:#ffffff;text-decoration:none;font-weight:700;border-radius:9px">Ouvrir le rapport administratif</a>
                      </div>
                      <p style="margin:0;text-align:center;color:#6b7280;font-size:12px;line-height:1.5">Les cours privés sont exclus. Le résultat estimé correspond aux revenus numériques en EUR après conversion historique des CHF, moins Google Ads. Hors frais Stripe, taxes et autres coûts.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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

    let monthlyComparison: MonthlyComparison | undefined;
    try {
        monthlyComparison = await generateMonthlyComparison();
    } catch (error) {
        console.error("[SalesReport] monthly email comparison unavailable", error);
    }

    const message = buildSalesReportEmail(report, monthlyComparison);
    return transporter.sendMail({
        ...getDefaultMailOptions({ to: recipient }),
        ...message,
    });
}
