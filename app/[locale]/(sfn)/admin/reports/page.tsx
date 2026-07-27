import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/authOptions";
import { ACQUISITION_SOURCE_LABELS } from "@/app/lib/acquisition";
import { createReportDateRange } from "@/app/lib/reporting/dateRange";
import { generateSalesReport, type SourceStat } from "@/app/lib/reporting/salesReport";
import { sendAdminSalesReportEmail } from "@/app/serverActions/reportActions";

export const dynamic = "force-dynamic";

export const metadata = {
    robots: { index: false, follow: false },
};

type PageProps = {
    params: Promise<{
        locale: string;
    }>;
    searchParams: Promise<{
        from?: string;
        to?: string;
        emailStatus?: string;
    }>;
};

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

function formatDate(value?: string): string {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-CH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Zurich",
    }).format(parsed);
}

function SourceTable({ title, stats, emptyLabel = "Aucune donnée sur cette période." }: { title: string; stats: SourceStat[]; emptyLabel?: string }) {
    return (
        <div className="card p-4 border border-solid border-neutral-300">
            <h2 className="text-xl mb-3">{title}</h2>
            {stats.length === 0 ? (
                <p className="mb-0 text-sm text-neutral-600">{emptyLabel}</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-600">
                            <th className="pb-2">Source</th>
                            <th className="pb-2 text-right">Nombre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((row) => (
                            <tr key={row.source} className="border-t border-neutral-200">
                                <td className="py-2">{row.label}</td>
                                <td className="py-2 text-right font-semibold">{row.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default async function AdminReportsPage({ params, searchParams }: PageProps) {
    const session = await getServerSession(authOptions);
    if (session?.user?.isAdmin !== true) {
        redirect("/");
    }

    const [{ locale }, requestedRange] = await Promise.all([params, searchParams]);
    const range = createReportDateRange(requestedRange.from, requestedRange.to);
    const report = await generateSalesReport(range);

    return (
        <div className="page-wrapper mt-8 sm:mt-12 mb-16">
            <div className="section hero v3 wf-section !pt-6">
                <div className="container-default w-container">
                    <div className="inner-container _100---tablet center">
                        <div className="text-center mb-8">
                            <h1 className="display-2 mb-3">
                                Rapport <span className="heading-span-secondary-1">ventes & acquisition</span>
                            </h1>
                            <p className="mb-0 text-neutral-700">
                                Les cours privés sont exclus des chiffres financiers. Rapport généré le {formatDate(report.generatedAt)}.
                            </p>
                        </div>

                        {requestedRange.emailStatus === "sent" ? (
                            <p className="rounded-md bg-green-100 border border-solid border-green-300 p-3 text-sm text-green-900">
                                Le rapport du {range.from} au {range.to} a bien été envoyé par email.
                            </p>
                        ) : null}
                        {requestedRange.emailStatus === "error" ? (
                            <p className="rounded-md bg-red-100 border border-solid border-red-300 p-3 text-sm text-red-900">
                                L&apos;envoi du rapport a échoué. Vérifie la configuration email ou réessaie dans quelques instants.
                            </p>
                        ) : null}

                        <div className="card p-4 mb-6 flex flex-col lg:flex-row lg:items-end gap-3 border-2 border-solid border-neutral-700">
                            <form method="get" className="flex flex-col sm:flex-row sm:items-end gap-3">
                                <label className="flex flex-col gap-1 text-sm font-semibold">
                                    Du
                                    <input name="from" type="date" defaultValue={range.from} className="rounded-md border border-neutral-400 bg-neutral-100 px-3 py-2 font-normal" />
                                </label>
                                <label className="flex flex-col gap-1 text-sm font-semibold">
                                    Au
                                    <input name="to" type="date" defaultValue={range.to} className="rounded-md border border-neutral-400 bg-neutral-100 px-3 py-2 font-normal" />
                                </label>
                                <button type="submit" className="btn btn-primary small !mb-0">
                                    Générer le rapport
                                </button>
                            </form>
                            <form action={sendAdminSalesReportEmail}>
                                <input type="hidden" name="from" value={range.from} />
                                <input type="hidden" name="to" value={range.to} />
                                <input type="hidden" name="locale" value={locale} />
                                <button type="submit" className="btn btn-secondary small !mb-0">
                                    Envoyer ce rapport par email
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                            <div className="card p-4">
                                <p className="mb-1 text-sm text-neutral-600">Achats numériques</p>
                                <p className="mb-0 text-3xl font-bold">{report.summary.purchaseCount}</p>
                            </div>
                            <div className="card p-4">
                                <p className="mb-1 text-sm text-neutral-600">Nouveaux clients</p>
                                <p className="mb-0 text-3xl font-bold">{report.summary.newCustomerCount}</p>
                            </div>
                            <div className="card p-4">
                                <p className="mb-1 text-sm text-neutral-600">Revenus numériques</p>
                                {Object.keys(report.summary.revenueByCurrency).length === 0 ? (
                                    <p className="mb-0 text-sm">Aucun montant disponible</p>
                                ) : (
                                    Object.entries(report.summary.revenueByCurrency).map(([currency, amount]) => (
                                        <p className="mb-0 text-xl font-bold" key={currency}>
                                            {formatMoney(amount, currency)}
                                        </p>
                                    ))
                                )}
                            </div>
                            <div className="card p-4">
                                <p className="mb-1 text-sm text-neutral-600">Dépenses Google Ads</p>
                                {report.googleAds.status === "available" ? (
                                    <p className="mb-0 text-3xl font-bold">{formatMoney(report.googleAds.amount, report.googleAds.currency)}</p>
                                ) : (
                                    <p className="mb-0 text-sm text-neutral-600">{report.googleAds.message}</p>
                                )}
                            </div>
                        </div>

                        {report.euroFinancialSummary ? (
                            <div className="card p-4 mb-6 border-2 border-solid border-secondary-2">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {Object.prototype.hasOwnProperty.call(report.summary.revenueByCurrency, "CHF") ? (
                                        <div>
                                            <p className="mb-1 text-sm text-neutral-600">Revenus CHF convertis en EUR</p>
                                            <p className="mb-0 text-2xl font-bold">{formatMoney(report.euroFinancialSummary.convertedChfRevenue, "EUR")}</p>
                                        </div>
                                    ) : null}
                                    <div>
                                        <p className="mb-1 text-sm text-neutral-600">Total des revenus en EUR</p>
                                        <p className="mb-0 text-2xl font-bold">{formatMoney(report.euroFinancialSummary.totalRevenue, "EUR")}</p>
                                    </div>
                                    {report.euroFinancialSummary.marketingResult !== undefined ? (
                                        <div>
                                            <p className="mb-1 text-sm text-neutral-600">Résultat marketing estimé</p>
                                            <p className="mb-0 text-3xl font-bold text-secondary-2">
                                                {formatMoney(report.euroFinancialSummary.marketingResult, "EUR")}
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                                <p className="mb-0 mt-3 text-xs text-neutral-500">Revenus numériques en EUR, après conversion des CHF, moins dépenses Google Ads. Hors cours privés, frais Stripe, taxes et autres coûts.</p>
                            </div>
                        ) : null}

                        {report.chfConversionUnavailable ? (
                            <p className="rounded-md bg-secondary-1/10 p-3 text-sm text-neutral-700">
                                La conversion CHF vers EUR est temporairement indisponible. Les montants originaux restent affichés.
                            </p>
                        ) : null}

                        {report.summary.purchasesWithoutAmount > 0 ? (
                            <p className="rounded-md bg-secondary-1/10 p-3 text-sm text-neutral-700">
                                {report.summary.purchasesWithoutAmount} ancien(s) achat(s) n&apos;ont pas encore de montant enregistré et ne sont pas inclus dans les revenus.
                            </p>
                        ) : null}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            <SourceTable title="Nouveaux clients par source" stats={report.newCustomersBySource} />
                            <SourceTable title="Achats par source" stats={report.purchasesBySource} />
                            <SourceTable title="Entretiens gratuits Calendly" stats={report.calendlyBySource} />
                        </div>

                        <div className="card border-2 border-solid border-neutral-700 overflow-x-auto p-0 mb-6">
                            <div className="p-4">
                                <h2 className="text-2xl mb-1">Produits numériques</h2>
                                <p className="mb-0 text-sm text-neutral-600">Quantités vendues pendant la période.</p>
                            </div>
                            <table className="min-w-[620px] w-full text-sm">
                                <thead className="bg-neutral-200 text-neutral-700">
                                    <tr>
                                        <th className="text-left px-4 py-3">Produit</th>
                                        <th className="text-right px-4 py-3">Achats</th>
                                        <th className="text-right px-4 py-3">Quantité</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.products.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-6 text-neutral-600">Aucun achat numérique.</td>
                                        </tr>
                                    ) : (
                                        report.products.map((product) => (
                                            <tr key={product.referenceKey} className="border-t border-neutral-300">
                                                <td className="px-4 py-3 font-medium">{product.label}</td>
                                                <td className="px-4 py-3 text-right">{product.purchases}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{product.quantity}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="card border-2 border-solid border-neutral-700 overflow-x-auto p-0 mb-6">
                            <div className="p-4">
                                <h2 className="text-2xl mb-1">Clients et ordre des achats</h2>
                                <p className="mb-0 text-sm text-neutral-600">Séquence complète connue, pas seulement les achats de la période.</p>
                            </div>
                            <table className="min-w-[900px] w-full text-sm">
                                <thead className="bg-neutral-200 text-neutral-700">
                                    <tr>
                                        <th className="text-left px-4 py-3">Utilisateur</th>
                                        <th className="text-left px-4 py-3">Email</th>
                                        <th className="text-left px-4 py-3">Source initiale</th>
                                        <th className="text-left px-4 py-3">Achats dans l&apos;ordre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.customers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-6 text-neutral-600">Aucun client sur cette période.</td>
                                        </tr>
                                    ) : (
                                        report.customers.map((customer) => (
                                            <tr key={customer.email} className="border-t border-neutral-300 align-top">
                                                <td className="px-4 py-3 font-medium">{customer.name}</td>
                                                <td className="px-4 py-3">{customer.email}</td>
                                                <td className="px-4 py-3">{ACQUISITION_SOURCE_LABELS[customer.source]}</td>
                                                <td className="px-4 py-3">{customer.sequence.join(" → ") || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="card border-2 border-solid border-neutral-700 overflow-x-auto p-0 mb-6">
                            <div className="p-4">
                                <h2 className="text-2xl mb-1">Demandes commerciales Calendly</h2>
                                <p className="mb-0 text-sm text-neutral-600">Uniquement les entretiens gratuits « Your FIDE Plan » réservés pendant la période.</p>
                            </div>
                            {report.calendly.status !== "available" ? (
                                <p className="px-4 pb-4 text-sm text-neutral-600">{report.calendly.message}</p>
                            ) : (
                                <table className="min-w-[850px] w-full text-sm">
                                    <thead className="bg-neutral-200 text-neutral-700">
                                        <tr>
                                            <th className="text-left px-4 py-3">Demande</th>
                                            <th className="text-left px-4 py-3">Rendez-vous</th>
                                            <th className="text-left px-4 py-3">Nom</th>
                                            <th className="text-left px-4 py-3">Email</th>
                                            <th className="text-left px-4 py-3">Source</th>
                                            <th className="text-left px-4 py-3">Bouton</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.calendly.leads.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-neutral-600">Aucune demande commerciale.</td>
                                            </tr>
                                        ) : (
                                            report.calendly.leads.map((lead) => (
                                                <tr key={lead.eventUri} className="border-t border-neutral-300">
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(lead.scheduledAt)}</td>
                                                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                                                    <td className="px-4 py-3">{lead.email}</td>
                                                    <td className="px-4 py-3">{ACQUISITION_SOURCE_LABELS[lead.source]}</td>
                                                    <td className="px-4 py-3">{lead.placement || "-"}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <details className="card p-4 opacity-70">
                            <summary className="cursor-pointer font-semibold">
                                Sources liées aux cours privés ({report.privateLessons.purchaseCount})
                            </summary>
                            <p className="mt-3 mb-3 text-sm text-neutral-600">Aucun montant n&apos;est affiché ni inclus dans les résultats financiers.</p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <SourceTable title="Sources" stats={report.privateLessons.sources} />
                                <div className="overflow-x-auto">
                                    <table className="min-w-[520px] w-full text-sm">
                                        <thead>
                                            <tr className="text-left">
                                                <th className="pb-2">Nom</th>
                                                <th className="pb-2">Email</th>
                                                <th className="pb-2">Source</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.privateLessons.customers.map((customer) => (
                                                <tr key={customer.email} className="border-t border-neutral-200">
                                                    <td className="py-2">{customer.name}</td>
                                                    <td className="py-2">{customer.email}</td>
                                                    <td className="py-2">{ACQUISITION_SOURCE_LABELS[customer.source]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}
