import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { reportRangePresets, type ReportDateRange, type ReportRangePresetKey } from "@/app/lib/reporting/dateRange";
import { sendAdminSalesReportEmail } from "@/app/serverActions/reportActions";
import { formatDateTime, formatDayRange } from "./format";

const PRESET_LABELS: Record<ReportRangePresetKey, string> = {
    last7Days: "7 derniers jours",
    last30Days: "30 derniers jours",
    monthToDate: "Mois en cours",
    previousMonth: "Mois précédent",
};

/** En-tête du rapport : titre, période (raccourcis + dates), envoi par e-mail et retour d'envoi. */
export function ReportToolbar({
    range,
    locale,
    generatedAt,
    emailStatus,
}: {
    range: ReportDateRange;
    locale: string;
    generatedAt: string;
    emailStatus?: string;
}) {
    const presets = reportRangePresets();
    const periodLabel = formatDayRange(range.from, range.to);

    return (
        <>
            <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="mb-1 text-3xl font-semibold leading-tight sm:text-4xl">Ventes et acquisition</h1>
                    <p className="mb-0 text-neutral-700">{periodLabel}. Cours privés exclus des chiffres financiers.</p>
                </div>
                <p className="mb-0 text-xs text-neutral-600">Généré le {formatDateTime(generatedAt)}</p>
            </header>

            <section
                aria-label="Période du rapport"
                className="mb-6 flex flex-col gap-4 rounded-lg border border-solid border-neutral-300 bg-neutral-100 p-4 lg:flex-row lg:items-end lg:justify-between"
            >
                <div className="flex min-w-0 flex-col gap-3">
                    <nav aria-label="Raccourcis de période" className="flex flex-wrap gap-2">
                        {presets.map((preset) => {
                            const active = preset.from === range.from && preset.to === range.to;
                            return (
                                <Link
                                    key={preset.key}
                                    href={{ query: { from: preset.from, to: preset.to } }}
                                    aria-current={active ? "page" : undefined}
                                    className={
                                        active
                                            ? "rounded-full border border-solid border-neutral-800 bg-neutral-800 px-3 py-1 text-sm text-neutral-100 no-underline"
                                            : "rounded-full border border-solid border-neutral-300 px-3 py-1 text-sm text-neutral-800 no-underline hover:border-neutral-600"
                                    }
                                >
                                    {PRESET_LABELS[preset.key]}
                                </Link>
                            );
                        })}
                    </nav>
                    <form method="get" className="flex flex-wrap items-end gap-3">
                        <label className="flex flex-col gap-1 text-sm font-medium">
                            Du
                            <input
                                name="from"
                                type="date"
                                defaultValue={range.from}
                                className="rounded-md border border-solid border-neutral-300 bg-neutral-200 px-3 py-2 font-normal text-neutral-800"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium">
                            Au
                            <input
                                name="to"
                                type="date"
                                defaultValue={range.to}
                                className="rounded-md border border-solid border-neutral-300 bg-neutral-200 px-3 py-2 font-normal text-neutral-800"
                            />
                        </label>
                        <button type="submit" className="btn btn-primary small !mb-0">
                            Afficher la période
                        </button>
                    </form>
                </div>
                <form action={sendAdminSalesReportEmail}>
                    <input type="hidden" name="from" value={range.from} />
                    <input type="hidden" name="to" value={range.to} />
                    <input type="hidden" name="locale" value={locale} />
                    <button type="submit" className="btn btn-secondary small !mb-0">
                        Envoyer ce rapport par e-mail
                    </button>
                </form>
            </section>

            {emailStatus === "sent" ? (
                <p
                    role="status"
                    className="mb-6 flex items-center gap-2 rounded-md border border-solid border-green-300 bg-green-100 p-3 text-sm text-green-900 [[data-theme=dark]_&]:border-green-800 [[data-theme=dark]_&]:bg-green-950 [[data-theme=dark]_&]:text-green-100"
                >
                    <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0" />
                    Rapport envoyé par e-mail pour la période {periodLabel}.
                </p>
            ) : null}
            {emailStatus === "error" ? (
                <p role="alert" className="mb-6 flex items-center gap-2 rounded-md border border-solid border-red-300 bg-red-100 p-3 text-sm text-red-900 [[data-theme=dark]_&]:border-red-800 [[data-theme=dark]_&]:bg-red-950 [[data-theme=dark]_&]:text-red-100">
                    <AlertTriangle aria-hidden className="h-4 w-4 shrink-0" />
                    L&apos;envoi du rapport a échoué. Vérifie la configuration e-mail, puis réessaie.
                </p>
            ) : null}
        </>
    );
}
