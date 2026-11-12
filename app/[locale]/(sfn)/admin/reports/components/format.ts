// Formats d'affichage des pages admin : montants et nombres en fr-CH, horodatages en heure de Zurich.

const ZURICH = "Europe/Zurich";

export function formatMoney(amount: number, currency: string, options: { compact?: boolean } = {}): string {
    try {
        return new Intl.NumberFormat("fr-CH", {
            style: "currency",
            currency,
            notation: options.compact ? "compact" : "standard",
            maximumFractionDigits: options.compact ? 1 : 2,
        }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
}

export function formatCount(value: number): string {
    return new Intl.NumberFormat("fr-CH").format(value);
}

/** Horodatage ISO (achat, demande Calendly…) affiché en heure de Zurich. */
export function formatDateTime(value?: string): string {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-CH", { dateStyle: "medium", timeStyle: "short", timeZone: ZURICH }).format(parsed);
}

/**
 * Jour calendaire AAAA-MM-JJ (bornes de période, regroupements de la timeline).
 * Ce sont des dates sans heure : on les formate en UTC pour ne jamais décaler le jour.
 */
export function formatDay(day: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
    const parsed = new Date(`${day}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return day;
    return new Intl.DateTimeFormat("fr-CH", { ...options, timeZone: "UTC" }).format(parsed);
}

export function formatDayRange(from: string, to: string): string {
    if (from === to) return formatDay(from);
    return `${formatDay(from)} – ${formatDay(to)}`;
}
