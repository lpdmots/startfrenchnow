const DEFAULT_SITE_URL = "https://startfrenchnow.ch";

function normalizeSiteUrl(siteUrl = DEFAULT_SITE_URL) {
    return String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

const MEANINGFUL_UPDATE_DELAY_MS = 24 * 60 * 60 * 1000;
const EDITORIAL_TIME_ZONE = "Europe/Zurich";

function getNonEmptyString(value) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getArticleDateMetadata({ publishedAt, updatedAt } = {}) {
    const publishedTimestamp = Date.parse(publishedAt);
    const updatedTimestamp = Date.parse(updatedAt);
    const hasMeaningfulUpdate =
        Number.isFinite(publishedTimestamp) && Number.isFinite(updatedTimestamp) && updatedTimestamp - publishedTimestamp >= MEANINGFUL_UPDATE_DELAY_MS;

    return {
        publishedAt,
        updatedAt: hasMeaningfulUpdate ? updatedAt : null,
    };
}

export function formatArticleDate(value, locale = "en") {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr" : "en", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: EDITORIAL_TIME_ZONE,
    }).format(new Date(value));
}

export function getLocalizedArticleMetadata(article = {}, locale = "en") {
    const localizedTitle = locale === "fr" ? getNonEmptyString(article.title) || getNonEmptyString(article.title_en) : getNonEmptyString(article.title_en) || getNonEmptyString(article.title);
    const localizedMetaDescription =
        locale === "fr"
            ? getNonEmptyString(article.metaDescription) || getNonEmptyString(article.metaDescription_en)
            : getNonEmptyString(article.metaDescription_en) || getNonEmptyString(article.metaDescription);
    const localizedDescription =
        locale === "fr"
            ? getNonEmptyString(article.description) || getNonEmptyString(article.description_en)
            : getNonEmptyString(article.description_en) || getNonEmptyString(article.description);
    const title = localizedTitle || "Start French Now";

    return {
        title,
        description: localizedMetaDescription || localizedDescription || title,
    };
}

export function getEntityIds(siteUrl = DEFAULT_SITE_URL) {
    const site = normalizeSiteUrl(siteUrl);

    return {
        website: `${site}#website`,
        organization: `${site}#organization`,
        person: `${site}/about#yohann-coussot`,
    };
}

export function buildSiteEntityGraph({ locale = "en", siteUrl = DEFAULT_SITE_URL } = {}) {
    const site = normalizeSiteUrl(siteUrl);
    const ids = getEntityIds(site);
    const isFr = locale === "fr";

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": ids.website,
                url: site,
                name: "Start French Now",
                inLanguage: ["en", "fr"],
                publisher: { "@id": ids.organization },
            },
            {
                "@type": "Organization",
                "@id": ids.organization,
                name: "Start French Now",
                url: site,
                logo: {
                    "@type": "ImageObject",
                    url: `${site}/images/logo.png`,
                },
                founder: { "@id": ids.person },
                sameAs: [
                    "https://www.youtube.com/@startfrenchnow",
                    "https://www.instagram.com/startfrenchnow/",
                    "https://www.tiktok.com/@startfrenchnow",
                ],
            },
            {
                "@type": "Person",
                "@id": ids.person,
                name: "Yohann Coussot",
                url: `${site}${isFr ? "/fr" : ""}/about`,
                image: `${site}/images/yoh-coussot-red.png`,
                jobTitle: isFr ? "Professeur de français langue étrangère et spécialiste de la préparation au test FIDE" : "French teacher and FIDE test preparation specialist",
                worksFor: { "@id": ids.organization },
                knowsAbout: ["French as a foreign language", "Online French teaching", "Swiss FIDE language test preparation"],
                sameAs: [
                    "https://www.udemy.com/user/yohann-coussot/",
                    "https://www.youtube.com/@startfrenchnow",
                    "https://www.instagram.com/startfrenchnow/",
                    "https://www.tiktok.com/@startfrenchnow",
                    "https://fr.linkedin.com/in/yohann-coussot-099384a6",
                ],
            },
        ],
    };
}

export function buildBlogPostingJsonLd({
    locale = "en",
    slug,
    title,
    description,
    publishedAt,
    updatedAt,
    imageUrl,
    siteUrl = DEFAULT_SITE_URL,
}) {
    const site = normalizeSiteUrl(siteUrl);
    const ids = getEntityIds(site);
    const dates = getArticleDateMetadata({ publishedAt, updatedAt });
    const localizedPrefix = locale === "fr" ? "/fr" : "";
    const canonicalUrl = `${site}${localizedPrefix}/blog/post/${slug}`;

    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}#article`,
        headline: title,
        description,
        image: [imageUrl || `${site}/images/fide-presentation-thumbnail.png`],
        datePublished: dates.publishedAt,
        dateModified: dates.updatedAt || dates.publishedAt,
        inLanguage: locale === "fr" ? "fr" : "en",
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
        },
        isPartOf: { "@id": ids.website },
        author: { "@id": ids.person },
        publisher: { "@id": ids.organization },
    };
}

export function serializeJsonLd(data) {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}
