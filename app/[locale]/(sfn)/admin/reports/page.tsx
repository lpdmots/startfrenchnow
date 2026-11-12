import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/authOptions";
import { createReportDateRange } from "@/app/lib/reporting/dateRange";
import { generateSalesReport } from "@/app/lib/reporting/salesReport";
import { AdsVsRevenue } from "./components/AdsVsRevenue";
import { KpiStrip } from "./components/KpiStrip";
import { SourcesChart, TimelineCharts } from "./components/ReportCharts";
import { ReportToolbar } from "./components/ReportToolbar";
import { CalendlyTable, CustomersTable, Panel, PrivateLessonsDetails, ProductsTable } from "./components/ReportTables";

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

const GRANULARITY_LABELS = {
    day: "par jour",
    week: "par semaine (lundi à dimanche)",
    month: "par mois",
} as const;

export default async function AdminReportsPage({ params, searchParams }: PageProps) {
    const session = await getServerSession(authOptions);
    if (session?.user?.isAdmin !== true) {
        redirect("/");
    }

    const [{ locale }, requestedRange] = await Promise.all([params, searchParams]);
    const range = createReportDateRange(requestedRange.from, requestedRange.to);
    const report = await generateSalesReport(range);

    return (
        <div className="admin-viz mx-auto w-full max-w-[1200px] px-4 pb-16 pt-8 text-neutral-800 sm:px-6 sm:pt-12">
            <ReportToolbar range={range} locale={locale} generatedAt={report.generatedAt} emailStatus={requestedRange.emailStatus} />

            <div className="flex flex-col gap-6">
                <KpiStrip report={report} />

                <Panel
                    title="Évolution sur la période"
                    description={`Achats numériques ${GRANULARITY_LABELS[report.timeline.granularity]}, cours privés exclus.`}
                >
                    <TimelineCharts timeline={report.timeline} />
                </Panel>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Panel title="Par source" description="Source d'acquisition de chaque achat, nouveau client et rendez-vous.">
                        <SourcesChart
                            purchasesBySource={report.purchasesBySource}
                            newCustomersBySource={report.newCustomersBySource}
                            calendlyBySource={report.calendlyBySource}
                            calendlyMessage={report.calendly.status === "available" ? undefined : report.calendly.message}
                        />
                    </Panel>
                    <Panel title="Dépenses pub et revenus" description="Résultat marketing estimé sur la période.">
                        <AdsVsRevenue
                            revenueEur={report.euroFinancialSummary?.totalRevenue}
                            googleAds={report.googleAds}
                            metaAds={report.metaAds}
                            marketingResult={report.euroFinancialSummary?.marketingResult}
                        />
                    </Panel>
                </div>

                <ProductsTable products={report.products} />
                <CustomersTable customers={report.customers} />
                <CalendlyTable calendly={report.calendly} />
                <PrivateLessonsDetails privateLessons={report.privateLessons} />
            </div>
        </div>
    );
}
