"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AcquisitionSource } from "@/app/lib/acquisition";
import type { SalesTimeline, SourceStat } from "@/app/lib/reporting/salesReport";
import { formatCount, formatDay, formatDayRange, formatMoney } from "./format";

const AXIS_TICK = { fill: "var(--viz-axis)", fontSize: 12 };

type Series = { key: string; label: string; color: string };

function Legend({ series }: { series: Series[] }) {
    return (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-700 list-none p-0 m-0">
            {series.map((item) => (
                <li key={item.key} className="flex items-center gap-1.5">
                    <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
                    {item.label}
                </li>
            ))}
        </ul>
    );
}

function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string }[] }) {
    return (
        <div className="rounded-md border border-solid border-neutral-300 bg-neutral-100 px-3 py-2 text-xs text-neutral-800 shadow-md">
            <p className="mb-1 font-semibold">{title}</p>
            {rows.map((row) => (
                <p key={row.label} className="mb-0 flex items-center gap-2">
                    {row.color ? <span aria-hidden className="inline-block h-2 w-2 rounded-sm" style={{ background: row.color }} /> : null}
                    <span className="text-neutral-600">{row.label}</span>
                    <span className="ml-auto pl-3 font-semibold tabular-nums">{row.value}</span>
                </p>
            ))}
        </div>
    );
}

function ChartNote({ children }: { children: ReactNode }) {
    return <p className="mb-0 rounded-md bg-neutral-300/40 px-3 py-6 text-center text-sm text-neutral-600">{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Évolution sur la période                                            */
/* ------------------------------------------------------------------ */

type TimelineRow = {
    tick: string;
    period: string;
    revenue?: number;
    purchases: number;
    customers: number;
};

const ACTIVITY_SERIES: Series[] = [
    { key: "purchases", label: "Achats", color: "var(--viz-purchases)" },
    { key: "customers", label: "Nouveaux clients", color: "var(--viz-customers)" },
];

export function TimelineCharts({ timeline }: { timeline: SalesTimeline }) {
    const rows: TimelineRow[] = timeline.points.map((point) => ({
        tick:
            timeline.granularity === "month"
                ? formatDay(point.from, { month: "short", year: "2-digit" })
                : formatDay(point.from, { day: "numeric", month: "short" }),
        period: timeline.granularity === "day" ? formatDay(point.from, { weekday: "short", day: "numeric", month: "short" }) : formatDayRange(point.from, point.to),
        revenue: point.revenueEur,
        purchases: point.purchaseCount,
        customers: point.newCustomerCount,
    }));

    const hasActivity = rows.some((row) => row.purchases > 0 || row.customers > 0);
    const revenueAvailable = rows.every((row) => row.revenue !== undefined);
    const showDots = rows.length <= 31;

    if (!hasActivity) {
        return <ChartNote>Aucun achat sur cette période.</ChartNote>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="mb-2 text-sm font-semibold text-neutral-800">Revenus en EUR</h3>
                {revenueAvailable ? (
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rows} syncId="sales-timeline" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                                <XAxis dataKey="tick" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={16} />
                                <YAxis
                                    tick={AXIS_TICK}
                                    tickLine={false}
                                    axisLine={false}
                                    width={56}
                                    tickFormatter={(value: number) => formatMoney(value, "EUR", { compact: true })}
                                />
                                <Tooltip
                                    cursor={{ fill: "var(--viz-grid)" }}
                                    content={({ active, payload }) => {
                                        const row = payload?.[0]?.payload as TimelineRow | undefined;
                                        if (!active || !row) return null;
                                        return (
                                            <TooltipBox
                                                title={row.period}
                                                rows={[{ label: "Revenus", value: formatMoney(row.revenue || 0, "EUR"), color: "var(--viz-money)" }]}
                                            />
                                        );
                                    }}
                                />
                                <Bar dataKey="revenue" fill="var(--viz-money)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <ChartNote>Revenus EUR non calculables sur cette période : la conversion CHF vers EUR est indisponible.</ChartNote>
                )}
            </div>

            <div>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="mb-0 text-sm font-semibold text-neutral-800">Achats et nouveaux clients</h3>
                    <Legend series={ACTIVITY_SERIES} />
                </div>
                <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={rows} syncId="sales-timeline" margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                            <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                            <XAxis dataKey="tick" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={16} />
                            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={56} allowDecimals={false} />
                            <Tooltip
                                cursor={{ stroke: "var(--viz-axis)", strokeDasharray: "3 3" }}
                                content={({ active, payload }) => {
                                    const row = payload?.[0]?.payload as TimelineRow | undefined;
                                    if (!active || !row) return null;
                                    return (
                                        <TooltipBox
                                            title={row.period}
                                            rows={[
                                                { label: "Achats", value: formatCount(row.purchases), color: "var(--viz-purchases)" },
                                                { label: "Nouveaux clients", value: formatCount(row.customers), color: "var(--viz-customers)" },
                                            ]}
                                        />
                                    );
                                }}
                            />
                            {ACTIVITY_SERIES.map((series) => (
                                <Line
                                    key={series.key}
                                    dataKey={series.key}
                                    name={series.label}
                                    stroke={series.color}
                                    strokeWidth={2}
                                    type="linear"
                                    dot={showDots ? { r: 3, strokeWidth: 0, fill: series.color } : false}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: "rgb(var(--neutral-100-rgb))" }}
                                    isAnimationActive={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Répartition par source                                              */
/* ------------------------------------------------------------------ */

/** Libellés courts pour l'axe : le libellé complet reste dans l'infobulle. */
const SHORT_SOURCE_LABELS: Partial<Record<AcquisitionSource, string>> = {
    meta_ads: "Meta Ads",
    google_organic: "Google (SEO)",
};

type SourceRow = {
    source: AcquisitionSource;
    label: string;
    shortLabel: string;
    purchases: number;
    customers: number;
    calendly?: number;
};

export function SourcesChart({
    purchasesBySource,
    newCustomersBySource,
    calendlyBySource,
    calendlyMessage,
}: {
    purchasesBySource: SourceStat[];
    newCustomersBySource: SourceStat[];
    calendlyBySource: SourceStat[];
    /** Message affiché quand Calendly n'est pas disponible ; la série RDV est alors retirée. */
    calendlyMessage?: string;
}) {
    const calendlyAvailable = calendlyMessage === undefined;
    const bySource = new Map<AcquisitionSource, SourceRow>();
    const rowFor = (stat: SourceStat) => {
        const row = bySource.get(stat.source) || {
            source: stat.source,
            label: stat.label,
            shortLabel: SHORT_SOURCE_LABELS[stat.source] || stat.label,
            purchases: 0,
            customers: 0,
            calendly: calendlyAvailable ? 0 : undefined,
        };
        bySource.set(stat.source, row);
        return row;
    };
    for (const stat of purchasesBySource) rowFor(stat).purchases = stat.count;
    for (const stat of newCustomersBySource) rowFor(stat).customers = stat.count;
    if (calendlyAvailable) for (const stat of calendlyBySource) rowFor(stat).calendly = stat.count;

    const rows = Array.from(bySource.values()).sort(
        (a, b) => b.purchases + b.customers + (b.calendly || 0) - (a.purchases + a.customers + (a.calendly || 0)) || a.label.localeCompare(b.label),
    );

    const series: Series[] = [
        { key: "purchases", label: "Achats", color: "var(--viz-purchases)" },
        { key: "customers", label: "Nouveaux clients", color: "var(--viz-customers)" },
        ...(calendlyAvailable ? [{ key: "calendly", label: "RDV Calendly", color: "var(--viz-calendly)" }] : []),
    ];
    const barSize = 8;
    const rowHeight = series.length * (barSize + 2) + 22;

    return (
        <div className="flex flex-col gap-3">
            {rows.length > 0 ? <Legend series={series} /> : null}
            {rows.length === 0 ? (
                <ChartNote>Aucun achat ni rendez-vous sur cette période.</ChartNote>
            ) : (
                <div style={{ height: rows.length * rowHeight + 8 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rows} layout="vertical" barGap={2} barCategoryGap={10} margin={{ top: 0, right: 28, bottom: 0, left: 0 }}>
                            <XAxis type="number" hide allowDecimals={false} />
                            <YAxis type="category" dataKey="shortLabel" tick={{ ...AXIS_TICK, fill: "rgb(var(--neutral-800-rgb))" }} tickLine={false} axisLine={false} width={116} />
                            <Tooltip
                                cursor={{ fill: "var(--viz-grid)" }}
                                content={({ active, payload }) => {
                                    const row = payload?.[0]?.payload as SourceRow | undefined;
                                    if (!active || !row) return null;
                                    return (
                                        <TooltipBox
                                            title={row.label}
                                            rows={series.map((item) => ({
                                                label: item.label,
                                                value: formatCount(Number(row[item.key as "purchases" | "customers" | "calendly"] || 0)),
                                                color: item.color,
                                            }))}
                                        />
                                    );
                                }}
                            />
                            {series.map((item) => (
                                <Bar key={item.key} dataKey={item.key} name={item.label} fill={item.color} barSize={barSize} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                                    <LabelList
                                        dataKey={item.key}
                                        position="right"
                                        offset={4}
                                        fill="rgb(var(--neutral-700-rgb))"
                                        fontSize={11}
                                        formatter={(value: unknown) => (Number(value) > 0 ? formatCount(Number(value)) : "")}
                                    />
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            {calendlyMessage ? <p className="mb-0 text-xs text-neutral-600">RDV Calendly non affichés : {calendlyMessage}</p> : null}
        </div>
    );
}
