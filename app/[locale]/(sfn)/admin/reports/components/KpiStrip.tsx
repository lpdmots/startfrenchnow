import type { ReactNode } from "react";
import type { SalesReport } from "@/app/lib/reporting/salesReport";
import { formatCount, formatMoney } from "./format";
import { StatusBadge } from "./StatusBadge";

function Tile({ label, value, children, className = "" }: { label: string; value: ReactNode; children?: ReactNode; className?: string }) {
    return (
        <div className={`flex flex-col gap-1 bg-neutral-100 p-4 ${className}`}>
            <p className="mb-0 text-sm text-neutral-600">{label}</p>
            <div className="text-2xl font-semibold leading-tight tabular-nums text-neutral-800">{value}</div>
            {children ? <div className="mt-1 flex flex-col gap-1 text-xs text-neutral-600">{children}</div> : null}
        </div>
    );
}

function Line({ label, children }: { label: string; children: ReactNode }) {
    return (
        <p className="mb-0 flex items-center justify-between gap-2">
            <span>{label}</span>
            <span className="tabular-nums text-neutral-700">{children}</span>
        </p>
    );
}

export function KpiStrip({ report }: { report: SalesReport }) {
    const { summary, euroFinancialSummary, googleAds, metaAds, adsSpendEur } = report;
    const currencies = Object.entries(summary.revenueByCurrency);
    const ignoredCurrencies = currencies.filter(([currency]) => currency !== "EUR" && currency !== "CHF");
    const regies = [
        { label: "Google Ads", cost: googleAds },
        { label: "Meta Ads", cost: metaAds },
    ];
    const notConfigured = regies.filter(({ cost }) => cost.status === "not_configured");
    const noAdsConfigured = notConfigured.length === regies.length;
    const marketingResult = euroFinancialSummary?.marketingResult;

    return (
        <section aria-label="Chiffres clés" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg p-0 border border-solid border-neutral-300 bg-neutral-300 lg:grid-cols-5">
            <Tile label="Achats numériques" value={formatCount(summary.purchaseCount)}>
                {summary.purchasesWithoutAmount > 0 ? <p className="mb-0">dont {formatCount(summary.purchasesWithoutAmount)} sans montant enregistré</p> : null}
            </Tile>

            <Tile label="Nouveaux clients" value={formatCount(summary.newCustomerCount)}>
                <p className="mb-0">Premier achat sur la période</p>
            </Tile>

            <Tile
                label="Revenus"
                value={euroFinancialSummary ? formatMoney(euroFinancialSummary.totalRevenue, "EUR") : <StatusBadge state="unavailable" label="Conversion CHF indisponible" />}
            >
                {euroFinancialSummary && summary.revenueByCurrency.CHF !== undefined ? (
                    <Line label={`dont ${formatMoney(summary.revenueByCurrency.CHF, "CHF")}`}>{formatMoney(euroFinancialSummary.convertedChfRevenue, "EUR")}</Line>
                ) : null}
                {!euroFinancialSummary
                    ? currencies.map(([currency, amount]) => (
                          <Line key={currency} label={currency}>
                              {formatMoney(amount, currency)}
                          </Line>
                      ))
                    : null}
                {euroFinancialSummary
                    ? ignoredCurrencies.map(([currency, amount]) => (
                          <p className="mb-0" key={currency}>
                              {formatMoney(amount, currency)} non inclus (devise non convertie)
                          </p>
                      ))
                    : null}
                {summary.purchasesWithoutAmount > 0 ? <p className="mb-0">Hors achats sans montant</p> : null}
            </Tile>

            <Tile
                label="Dépenses pub"
                value={
                    noAdsConfigured ? (
                        <StatusBadge state="not_configured" label="Aucune régie configurée" />
                    ) : adsSpendEur !== undefined ? (
                        formatMoney(adsSpendEur, "EUR")
                    ) : (
                        <StatusBadge state="unavailable" label="Total incomplet" />
                    )
                }
            >
                {regies.map(({ label, cost }) => (
                    <Line key={label} label={label}>
                        {cost.status === "available" ? formatMoney(cost.amount, cost.currency) : <StatusBadge state={cost.status} />}
                    </Line>
                ))}
            </Tile>

            <Tile
                label="Résultat marketing estimé"
                className="col-span-2 lg:col-span-1"
                value={marketingResult !== undefined ? formatMoney(marketingResult, "EUR") : <StatusBadge state="unavailable" label="Non calculable" />}
            >
                {marketingResult === undefined ? (
                    <p className="mb-0">{euroFinancialSummary ? "Les dépenses pub sont incomplètes ou dans une autre devise." : "Les revenus EUR ne sont pas calculables."}</p>
                ) : noAdsConfigured ? (
                    <p className="mb-0">Aucune dépense pub déduite.</p>
                ) : notConfigured.length > 0 ? (
                    <p className="mb-0">Hors {notConfigured.map(({ label }) => label).join(" et ")}, non configuré.</p>
                ) : (
                    <p className="mb-0">Revenus moins dépenses pub</p>
                )}
            </Tile>
        </section>
    );
}
