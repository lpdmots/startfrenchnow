import { resolveAuthLocale, type AuthLocale, type SystemNotificationMessage } from "@/app/lib/authMailMessages";
import { COURSES_PACKAGES_KEYS } from "@/app/lib/constantes";

type PurchaseMailMessage = {
    subject: string;
    bodyHtml: string;
};

type BuildPurchaseMessageParams = {
    localeLike?: string | null;
    userName?: string | null;
    referenceKey?: string | null;
    productLabel?: string | null;
    dashboardPath?: string | null;
};

const BASE_URL = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

function getFirstName(nameLike?: string | null, locale: AuthLocale = "fr"): string {
    const name = (nameLike || "").trim();
    if (!name) return locale === "fr" ? "vous" : "there";
    return name.split(/\s+/)[0];
}

function escapeHtml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function formatReferenceKey(referenceKey: string): string {
    return referenceKey
        .replace(/_/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isCoursesDashboard(referenceKey?: string | null): boolean {
    return !!referenceKey && (COURSES_PACKAGES_KEYS as readonly string[]).includes(referenceKey as (typeof COURSES_PACKAGES_KEYS)[number]);
}

function resolveDashboardPath(locale: AuthLocale, referenceKey?: string | null, explicitPath?: string | null): string {
    if (explicitPath?.trim()) return explicitPath.trim();
    const basePath = isCoursesDashboard(referenceKey) ? "/courses/dashboard" : "/fide/dashboard";
    return locale === "fr" ? `/fr${basePath}` : basePath;
}

function toAbsoluteUrl(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return `${BASE_URL}${normalizedPath}`;
}

function resolveProductLabel(locale: AuthLocale, referenceKey?: string | null, productLabel?: string | null): string {
    if (productLabel?.trim()) return productLabel.trim();
    if (referenceKey?.trim()) return formatReferenceKey(referenceKey);
    return locale === "fr" ? "votre achat" : "your purchase";
}

function resolveDashboardLabel(locale: AuthLocale, referenceKey?: string | null): string {
    if (locale === "en") {
        return isCoursesDashboard(referenceKey) ? "French dashboard" : "FIDE dashboard";
    }
    return isCoursesDashboard(referenceKey) ? "dashboard FR" : "dashboard FIDE";
}

function resolveMenuName(locale: AuthLocale): string {
    return locale === "en" ? "Profile button" : "bouton Profil";
}

export function buildPurchaseMailMessage(params: BuildPurchaseMessageParams = {}): PurchaseMailMessage {
    const locale = resolveAuthLocale(params.localeLike);
    const firstName = getFirstName(params.userName, locale);
    const productLabel = resolveProductLabel(locale, params.referenceKey, params.productLabel);
    const safeProductLabel = escapeHtml(productLabel);
    const dashboardLabel = resolveDashboardLabel(locale, params.referenceKey);
    const menuName = resolveMenuName(locale);
    const dashboardPath = resolveDashboardPath(locale, params.referenceKey, params.dashboardPath);
    const dashboardUrl = toAbsoluteUrl(dashboardPath);

    if (locale === "en") {
        return {
            subject: `Start French Now: thank you for your purchase (${productLabel})`,
            bodyHtml: `<p>Hi ${firstName},</p><p>Thank you for your purchase: <strong>${safeProductLabel}</strong>.</p><p>Your access is now active. You can start here:</p><p><a href="${dashboardUrl}">${dashboardLabel}</a></p><p>If you have any question, you can contact us directly via the dedicated message area at the bottom of your dashboard, available in the "${menuName}" menu.</p><p>See you soon,<br/>Yohann Coussot</p>`,
        };
    }

    return {
        subject: `Start French Now : merci pour votre achat (${productLabel})`,
        bodyHtml: `<p>Bonjour ${firstName},</p><p>Merci pour votre achat : <strong>${safeProductLabel}</strong>.</p><p>Votre accès est maintenant actif. Vous pouvez commencer ici :</p><p><a href="${dashboardUrl}">${dashboardLabel}</a></p><p>Si vous avez une question, vous pouvez nous écrire directement via l’espace de messagerie dédié en bas du dashboard, disponible dans le menu "${menuName}".</p><p>À bientôt,<br/>Yohann Coussot</p>`,
    };
}

export function buildPurchaseSystemNotification(params: BuildPurchaseMessageParams = {}): SystemNotificationMessage {
    const locale = resolveAuthLocale(params.localeLike);
    const firstName = getFirstName(params.userName, locale);
    const productLabel = resolveProductLabel(locale, params.referenceKey, params.productLabel);
    const dashboardLabel = resolveDashboardLabel(locale, params.referenceKey);
    const dashboardPath = resolveDashboardPath(locale, params.referenceKey, params.dashboardPath);

    if (locale === "en") {
        return {
            title: "Purchase confirmed",
            body: `Hi ${firstName}, thank you for your purchase (${productLabel}). You can access it from your ${dashboardLabel}. You can also use the dedicated message area at the bottom of your dashboard.`,
            link: dashboardPath,
        };
    }

    return {
        title: "Achat confirmé",
        body: `Bonjour ${firstName}, merci pour votre achat (${productLabel}). Vous pouvez y accéder depuis votre ${dashboardLabel}. Vous pouvez aussi utiliser l'espace de messagerie dédié en bas du dashboard.`,
        link: dashboardPath,
    };
}
