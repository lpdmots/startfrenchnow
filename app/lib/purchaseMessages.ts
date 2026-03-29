import { resolveAuthLocale, type AuthLocale, type SystemNotificationMessage } from "@/app/lib/authMailMessages";

type PurchaseMailMessage = {
    subject: string;
    bodyHtml: string;
};

function getFirstName(nameLike?: string | null, locale: AuthLocale = "fr"): string {
    const name = (nameLike || "").trim();
    if (!name) return locale === "fr" ? "vous" : "there";
    return name.split(/\s+/)[0];
}

export function buildPurchaseMailMessage(localeLike?: string | null, userName?: string | null): PurchaseMailMessage {
    const locale = resolveAuthLocale(localeLike);
    const firstName = getFirstName(userName, locale);

    if (locale === "en") {
        return {
            subject: "Start French Now: your purchase is confirmed",
            bodyHtml: `<p>Hi ${firstName},</p><p>Your purchase has been confirmed successfully.</p><p>Your access has been updated on your account.</p><p>Thank you for your trust, and see you soon on Start French Now.</p>`,
        };
    }

    return {
        subject: "Start French Now : achat confirmé",
        bodyHtml: `<p>Bonjour ${firstName},</p><p>Votre achat a bien été confirmé.</p><p>Votre accès a été mis à jour sur votre compte.</p><p>Merci pour votre confiance, et à très bientôt sur Start French Now.</p>`,
    };
}

export function buildPurchaseSystemNotification(localeLike?: string | null, userName?: string | null): SystemNotificationMessage {
    const locale = resolveAuthLocale(localeLike);
    const firstName = getFirstName(userName, locale);

    if (locale === "en") {
        return {
            title: "Purchase confirmed",
            body: `Hi ${firstName}, your purchase is confirmed. Your access has been updated on your account.`,
            link: "/",
        };
    }

    return {
        title: "Achat confirmé",
        body: `Bonjour ${firstName}, votre achat est confirmé. Vos accès ont été mis à jour sur votre compte.`,
        link: "/",
    };
}
