import { resolveAuthLocale, type AuthLocale, type SystemNotificationMessage } from "@/app/lib/authMailMessages";

type CouponMailMessage = {
    subject: string;
    bodyHtml: string;
};

type BuildCouponMessageParams = {
    localeLike?: string | null;
    userName?: string | null;
    couponCode?: string | null;
    plansPath?: string | null;
};

const BASE_URL = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");
const DEFAULT_COUPON_CODE = "BRAVO10";
const DEFAULT_PLANS_PATH = "/fide/pack-fide#pack-pricing";

function getFirstName(nameLike?: string | null, locale: AuthLocale = "fr"): string {
    const name = (nameLike || "").trim();
    if (!name) return locale === "fr" ? "vous" : "there";
    return name.split(/\s+/)[0];
}

function resolveCouponCode(codeLike?: string | null): string {
    const code = String(codeLike || "")
        .trim()
        .toUpperCase();
    return code || DEFAULT_COUPON_CODE;
}

function resolvePlansPath(pathLike?: string | null): string {
    const path = String(pathLike || "").trim();
    if (!path) return DEFAULT_PLANS_PATH;
    return path.startsWith("/") ? path : `/${path}`;
}

function toAbsoluteUrl(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return `${BASE_URL}${normalized}`;
}

export function buildBravoCouponMailMessage(params: BuildCouponMessageParams = {}): CouponMailMessage {
    const locale = resolveAuthLocale(params.localeLike);
    const firstName = getFirstName(params.userName, locale);
    const couponCode = resolveCouponCode(params.couponCode);
    const plansPath = resolvePlansPath(params.plansPath);
    const plansUrl = toAbsoluteUrl(plansPath);

    if (locale === "en") {
        return {
            subject: `Your ${couponCode} coupon is now active`,
            bodyHtml: `<p>Hi ${firstName},</p><p>Great news: your coupon <strong>${couponCode}</strong> is now active.</p><p>You can use it on:</p><ul><li>FIDE autonomous pack</li><li>FIDE assisted pack</li><li>Private lessons (6h)</li></ul><p>See plans here: <a href="${plansUrl}">${plansUrl}</a></p><p>See you soon,<br/>Yohann Coussot</p>`,
        };
    }

    return {
        subject: `Votre coupon ${couponCode} est activé`,
        bodyHtml: `<p>Bonjour ${firstName},</p><p>Bonne nouvelle: votre coupon <strong>${couponCode}</strong> est maintenant actif.</p><p>Vous pouvez l’utiliser sur :</p><ul><li>le Pack FIDE autonome</li><li>le Pack FIDE accompagné</li><li>les cours privés (6h)</li></ul><p>Voir les offres: <a href="${plansUrl}">${plansUrl}</a></p><p>À bientôt,<br/>Yohann Coussot</p>`,
    };
}

export function buildBravoCouponSystemNotification(params: BuildCouponMessageParams = {}): SystemNotificationMessage {
    const locale = resolveAuthLocale(params.localeLike);
    const firstName = getFirstName(params.userName, locale);
    const couponCode = resolveCouponCode(params.couponCode);
    const plansPath = resolvePlansPath(params.plansPath);

    if (locale === "en") {
        return {
            title: "Coupon unlocked",
            body: `Hi ${firstName}, your coupon ${couponCode} is active for the FIDE autonomous pack, assisted pack, and private lessons (6h).`,
            link: plansPath,
        };
    }

    return {
        title: "Coupon activé",
        body: `Bonjour ${firstName}, votre coupon ${couponCode} est actif sur le Pack FIDE autonome, le Pack FIDE accompagné et les cours privés (6h).`,
        link: plansPath,
    };
}
