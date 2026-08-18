import assert from "node:assert/strict";
import test from "node:test";

let seo = {};
try {
    seo = await import("../../app/lib/seo/entityGraph.mjs");
} catch {
    seo = {};
}

function requireExport(name) {
    assert.equal(typeof seo[name], "function", `${name} must be implemented`);
    return seo[name];
}

test("builds stable entity identifiers from a normalized canonical origin", () => {
    const getEntityIds = requireExport("getEntityIds");

    assert.deepEqual(getEntityIds("https://example.com/"), {
        website: "https://example.com#website",
        organization: "https://example.com#organization",
        person: "https://example.com/about#yohann-coussot",
    });
});

test("connects the bilingual website, organization, and verified Yohann identity profiles", () => {
    const buildSiteEntityGraph = requireExport("buildSiteEntityGraph");
    const graph = buildSiteEntityGraph({ locale: "fr", siteUrl: "https://startfrenchnow.ch/" });

    assert.equal(graph["@context"], "https://schema.org");
    assert.equal(graph["@graph"].length, 3);

    const website = graph["@graph"].find((node) => node["@id"] === "https://startfrenchnow.ch#website");
    const organization = graph["@graph"].find((node) => node["@id"] === "https://startfrenchnow.ch#organization");
    const person = graph["@graph"].find((node) => node["@id"] === "https://startfrenchnow.ch/about#yohann-coussot");

    assert.deepEqual(website, {
        "@type": "WebSite",
        "@id": "https://startfrenchnow.ch#website",
        url: "https://startfrenchnow.ch",
        name: "Start French Now",
        inLanguage: ["en", "fr"],
        publisher: { "@id": "https://startfrenchnow.ch#organization" },
    });
    assert.equal(organization["@type"], "Organization");
    assert.deepEqual(organization.founder, { "@id": "https://startfrenchnow.ch/about#yohann-coussot" });
    assert.deepEqual(organization.sameAs, [
        "https://www.youtube.com/@startfrenchnow",
        "https://www.instagram.com/startfrenchnow/",
        "https://www.tiktok.com/@startfrenchnow",
    ]);
    assert.equal(organization.logo.url, "https://startfrenchnow.ch/images/logo.png");
    assert.equal(person["@type"], "Person");
    assert.equal(person.name, "Yohann Coussot");
    assert.equal(person.url, "https://startfrenchnow.ch/fr/about");
    assert.deepEqual(person.worksFor, { "@id": "https://startfrenchnow.ch#organization" });
    assert.deepEqual(person.sameAs, [
        "https://www.udemy.com/user/yohann-coussot/",
        "https://www.youtube.com/@startfrenchnow",
        "https://www.instagram.com/startfrenchnow/",
        "https://www.tiktok.com/@startfrenchnow",
        "https://fr.linkedin.com/in/yohann-coussot-099384a6",
    ]);
    assert.deepEqual(person.knowsAbout, ["French as a foreign language", "Online French teaching", "Swiss FIDE language test preparation"]);
});

test("builds a localized BlogPosting linked to the canonical person and organization", () => {
    const buildBlogPostingJsonLd = requireExport("buildBlogPostingJsonLd");
    const article = buildBlogPostingJsonLd({
        locale: "fr",
        slug: "fide-a2-oral",
        title: "Réussir l’oral FIDE A2",
        description: "Une méthode claire pour préparer l’oral.",
        publishedAt: "2026-03-03T09:00:00.000Z",
        updatedAt: "2026-08-05T12:00:00.000Z",
        imageUrl: "https://cdn.sanity.io/images/example.jpg",
        siteUrl: "https://startfrenchnow.ch/",
    });

    assert.deepEqual(article, {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": "https://startfrenchnow.ch/fr/blog/post/fide-a2-oral#article",
        headline: "Réussir l’oral FIDE A2",
        description: "Une méthode claire pour préparer l’oral.",
        image: ["https://cdn.sanity.io/images/example.jpg"],
        datePublished: "2026-03-03T09:00:00.000Z",
        dateModified: "2026-08-05T12:00:00.000Z",
        inLanguage: "fr",
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://startfrenchnow.ch/fr/blog/post/fide-a2-oral",
        },
        isPartOf: { "@id": "https://startfrenchnow.ch#website" },
        author: { "@id": "https://startfrenchnow.ch/about#yohann-coussot" },
        publisher: { "@id": "https://startfrenchnow.ch#organization" },
    });
});

test("falls back to the publication date when an article has no later modification date", () => {
    const buildBlogPostingJsonLd = requireExport("buildBlogPostingJsonLd");
    const article = buildBlogPostingJsonLd({
        locale: "en",
        slug: "fide-guide",
        title: "FIDE guide",
        description: "A practical guide.",
        publishedAt: "2026-03-03T09:00:00.000Z",
        siteUrl: "https://startfrenchnow.ch",
    });

    assert.equal(article["@id"], "https://startfrenchnow.ch/blog/post/fide-guide#article");
    assert.equal(article.dateModified, "2026-03-03T09:00:00.000Z");
    assert.deepEqual(article.image, ["https://startfrenchnow.ch/images/fide-presentation-thumbnail.png"]);
});

test("exposes a modification date only when it is meaningfully later than publication", () => {
    const getArticleDateMetadata = requireExport("getArticleDateMetadata");

    assert.deepEqual(
        getArticleDateMetadata({
            publishedAt: "2026-03-03T09:00:00.000Z",
            updatedAt: "2026-08-05T12:00:00.000Z",
        }),
        {
            publishedAt: "2026-03-03T09:00:00.000Z",
            updatedAt: "2026-08-05T12:00:00.000Z",
        }
    );
});

test("suppresses editorial timestamps that are not a meaningful article update", () => {
    const getArticleDateMetadata = requireExport("getArticleDateMetadata");
    const publishedAt = "2026-03-03T09:00:00.000Z";

    assert.deepEqual(getArticleDateMetadata({ publishedAt, updatedAt: "2026-03-03T09:30:00.000Z" }), {
        publishedAt,
        updatedAt: null,
    });
    assert.deepEqual(getArticleDateMetadata({ publishedAt, updatedAt: "not-a-date" }), {
        publishedAt,
        updatedAt: null,
    });
});

test("formats visible article dates in the Europe/Zurich editorial timezone", () => {
    const formatArticleDate = requireExport("formatArticleDate");

    assert.equal(formatArticleDate("2026-10-22T22:30:00.000Z", "fr"), "23 octobre 2026");
    assert.equal(formatArticleDate("2026-10-22T22:30:00.000Z", "en"), "October 23, 2026");
});

test("uses French article metadata when the English translation is missing", () => {
    const getLocalizedArticleMetadata = requireExport("getLocalizedArticleMetadata");
    const article = {
        title: "Réussir le test FIDE",
        title_en: "",
        description: "Un guide pratique.",
        description_en: "",
        metaDescription: "Préparez le test FIDE avec une méthode claire.",
        metaDescription_en: "",
    };

    assert.deepEqual(getLocalizedArticleMetadata(article, "en"), {
        title: "Réussir le test FIDE",
        description: "Préparez le test FIDE avec une méthode claire.",
    });
});

test("serializes JSON-LD without allowing a script-closing sequence", () => {
    const serializeJsonLd = requireExport("serializeJsonLd");
    const input = { value: "</script><script>alert('xss')</script>" };
    const serialized = serializeJsonLd(input);

    assert.equal(serialized.includes("<"), false);
    assert.deepEqual(JSON.parse(serialized), input);
});
