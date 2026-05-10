import nodemailer from "nodemailer";

const parsePort = (value, fallback) => {
    const parsed = Number.parseInt(String(value || ""), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value, fallback) => {
    if (typeof value !== "string") return fallback;

    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
    return fallback;
};

const decodeHtmlEntities = (value) =>
    value
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">");

const stripTags = (value) => value.replace(/<[^>]+>/g, " ");
const requireValue = (name, value) => {
    if (!value) {
        throw new Error(`[EmailTransport] Missing required environment variable: ${name}`);
    }

    return value;
};

const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
const smtpPort = parsePort(process.env.SMTP_PORT, 465);
const smtpSecure = parseBoolean(process.env.SMTP_SECURE, true);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailYoh = process.env.EMAILYOH;
const emailNico = process.env.EMAILNICO || smtpUser;
const emailFrom = process.env.EMAIL_FROM;
const emailReplyTo = process.env.EMAIL_REPLY_TO;

export const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
});

export const getDefaultMailOptions = (overrides = {}) => ({
    from: requireValue("EMAIL_FROM", emailFrom),
    replyTo: requireValue("EMAIL_REPLY_TO", emailReplyTo),
    ...overrides,
});

export const getMailOptions = (mailTo) => {
    const to = mailTo === "yohann" ? requireValue("EMAILYOH", emailYoh) : requireValue("EMAILNICO or SMTP_USER", emailNico);
    return getDefaultMailOptions({ to });
};

export const htmlToText = (html = "") => {
    let text = String(html)
        .replace(/\r/g, "")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, _quote, href, labelHtml) => {
            const label = decodeHtmlEntities(stripTags(labelHtml)).replace(/\s+/g, " ").trim();
            return label ? `${label} (${href})` : href;
        })
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<li>/gi, "- ")
        .replace(/<\/li>/gi, "\n")
        .replace(/<\/ul>/gi, "\n")
        .replace(/<\/ol>/gi, "\n");

    text = decodeHtmlEntities(stripTags(text));

    return text
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

export const verifyEmailTransport = async () => {
    requireValue("SMTP_USER", smtpUser);
    requireValue("SMTP_PASS", smtpPass);
    requireValue("EMAIL_FROM", emailFrom);
    requireValue("EMAIL_REPLY_TO", emailReplyTo);
    const result = await transporter.verify();

    if (process.env.NODE_ENV !== "production") {
        console.info("[EmailTransport] SMTP verification successful", {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            user: smtpUser,
        });
    }

    return result;
};
