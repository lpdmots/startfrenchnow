export type ReportDateRange = {
    from: string;
    to: string;
    startIso: string;
    endIso: string;
};

export type MonthToDateComparisonRanges = {
    current: ReportDateRange;
    previous: ReportDateRange;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatUtcDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function parseDateInput(value: string): Date | null {
    if (!DATE_PATTERN.test(value)) return null;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) || formatUtcDate(parsed) !== value ? null : parsed;
}

export function createReportDateRange(fromInput?: string, toInput?: string, now = new Date()): ReportDateRange {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const defaultTo = formatUtcDate(today);
    const defaultFromDate = new Date(today);
    defaultFromDate.setUTCDate(defaultFromDate.getUTCDate() - 6);
    const defaultFrom = formatUtcDate(defaultFromDate);

    const from = parseDateInput(String(fromInput || "")) ? String(fromInput) : defaultFrom;
    const to = parseDateInput(String(toInput || "")) ? String(toInput) : defaultTo;
    const startDate = parseDateInput(from) as Date;
    const toDate = parseDateInput(to) as Date;

    if (startDate.getTime() > toDate.getTime()) {
        return createReportDateRange(to, from, now);
    }

    const endDate = new Date(toDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    return {
        from,
        to,
        startIso: startDate.toISOString(),
        endIso: endDate.toISOString(),
    };
}

export function previousCompletedWeekRange(now = new Date()): ReportDateRange {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dayOfWeek = today.getUTCDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;

    const currentMonday = new Date(today);
    currentMonday.setUTCDate(currentMonday.getUTCDate() - daysSinceMonday);

    const previousMonday = new Date(currentMonday);
    previousMonday.setUTCDate(previousMonday.getUTCDate() - 7);

    const previousSunday = new Date(currentMonday);
    previousSunday.setUTCDate(previousSunday.getUTCDate() - 1);

    return createReportDateRange(formatUtcDate(previousMonday), formatUtcDate(previousSunday), now);
}

export function monthToDateComparisonRanges(now = new Date()): MonthToDateComparisonRanges {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const currentFrom = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

    const previousFrom = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    const previousLastDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0)).getUTCDate();
    const previousTo = new Date(
        Date.UTC(previousFrom.getUTCFullYear(), previousFrom.getUTCMonth(), Math.min(today.getUTCDate(), previousLastDay)),
    );

    return {
        current: createReportDateRange(formatUtcDate(currentFrom), formatUtcDate(today), now),
        previous: createReportDateRange(formatUtcDate(previousFrom), formatUtcDate(previousTo), now),
    };
}
