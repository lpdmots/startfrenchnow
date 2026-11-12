import type { GoogleAdsCost } from "@/app/lib/reporting/googleAds";
import { formatMoney } from "./format";
import { StatusBadge, type DataState } from "./StatusBadge";

type Step = {
    key: string;
    label: string;
    color: string;
    /** Bornes de la barre en EUR ; absent = ligne hachurée avec un état. */
    bar?: { lo: number; hi: number };
    value?: string;
    state?: DataState;
    stateLabel?: string;
};

/**
 * Cascade « revenus − dépenses pub = résultat ». Barres en HTML : 4 lignes étiquetées,
 * pas besoin d'un graphique Recharts ici et les états manquants restent lisibles.
 */
export function AdsVsRevenue({
    revenueEur,
    googleAds,
    metaAds,
    marketingResult,
}: {
    revenueEur?: number;
    googleAds: GoogleAdsCost;
    metaAds: GoogleAdsCost;
    marketingResult?: number;
}) {
    if (revenueEur === undefined) {
        return (
            <p className="mb-0 rounded-md bg-neutral-300/40 px-3 py-6 text-center text-sm text-neutral-600">
                Comparaison impossible : les revenus EUR ne sont pas calculables (conversion CHF indisponible).
            </p>
        );
    }

    const steps: Step[] = [{ key: "revenue", label: "Revenus", color: "var(--viz-money)", bar: { lo: 0, hi: revenueEur }, value: formatMoney(revenueEur, "EUR") }];
    let running = revenueEur;
    for (const [key, label, cost] of [
        ["google", "Google Ads", googleAds],
        ["meta", "Meta Ads", metaAds],
    ] as const) {
        if (cost.status === "available" && cost.currency === "EUR") {
            steps.push({ key, label, color: "var(--viz-cost)", bar: { lo: running - cost.amount, hi: running }, value: `− ${formatMoney(cost.amount, "EUR")}` });
            running -= cost.amount;
        } else if (cost.status === "available") {
            steps.push({ key, label, color: "var(--viz-cost)", value: `− ${formatMoney(cost.amount, cost.currency)}`, state: "unavailable", stateLabel: "Devise non convertie" });
        } else {
            steps.push({ key, label, color: "var(--viz-cost)", state: cost.status });
        }
    }
    steps.push(
        marketingResult !== undefined
            ? {
                  key: "result",
                  label: "Résultat estimé",
                  color: "var(--viz-money)",
                  bar: { lo: Math.min(0, marketingResult), hi: Math.max(0, marketingResult) },
                  value: formatMoney(marketingResult, "EUR"),
              }
            : { key: "result", label: "Résultat estimé", color: "var(--viz-money)", state: "unavailable", stateLabel: "Non calculable" },
    );

    const bounds = steps.flatMap((step) => (step.bar ? [step.bar.lo, step.bar.hi] : []));
    const min = Math.min(0, ...bounds);
    const max = Math.max(0, ...bounds);
    const span = max - min || 1;
    const percent = (value: number) => ((value - min) / span) * 100;

    return (
        <div className="flex flex-col gap-4">
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {steps.map((step) => (
                    <li key={step.key} className={step.key === "result" ? "border-t border-solid border-neutral-300 pt-3" : undefined}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                            <span className={step.key === "result" ? "font-semibold text-neutral-800" : "text-neutral-700"}>{step.label}</span>
                            <span className="flex items-center gap-2 font-semibold tabular-nums text-neutral-800">
                                {step.state ? <StatusBadge state={step.state} label={step.stateLabel} /> : null}
                                {step.value}
                            </span>
                        </div>
                        <div className="relative h-3 rounded-sm">
                            {min < 0 ? <span aria-hidden className="absolute inset-y-[-4px] w-px bg-neutral-500" style={{ left: `${percent(0)}%` }} /> : null}
                            {step.bar ? (
                                <span
                                    aria-hidden
                                    className="absolute inset-y-0 rounded"
                                    style={{
                                        left: `${percent(step.bar.lo)}%`,
                                        width: `max(2px, ${percent(step.bar.hi) - percent(step.bar.lo)}%)`,
                                        background: step.color,
                                    }}
                                />
                            ) : (
                                <span aria-hidden className="admin-viz-hatch absolute inset-0 rounded" />
                            )}
                        </div>
                    </li>
                ))}
            </ol>
            <p className="mb-0 text-xs text-neutral-600">
                Revenus numériques en EUR (CHF convertis au taux du jour d&apos;achat), moins les dépenses Google Ads et Meta Ads. Hors cours privés, frais Stripe, taxes et
                autres coûts.
            </p>
        </div>
    );
}
