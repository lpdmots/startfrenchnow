import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3100").replace(/\/$/, "");

async function findPublishedArticlePath(prefix) {
    const response = await fetch(`${baseUrl}${prefix}/blog`);
    const document = new JSDOM(await response.text()).window.document;
    const href = [...document.querySelectorAll(`a[href^="${prefix}/blog/post/"]`)]
        .map((link) => link.getAttribute("href"))
        .find(Boolean);

    assert.equal(response.status, 200);
    assert.ok(href, "the local dataset must expose at least one published blog post");
    return href;
}

for (const locale of [
    { name: "English", prefix: "", language: "en", aboutPath: "/about" },
    { name: "French", prefix: "/fr", language: "fr", aboutPath: "/fr/about" },
]) {
    test(`${locale.name} BlogPosting is connected to the visible author and shared publisher entities`, async () => {
        const articlePath = await findPublishedArticlePath(locale.prefix);
        const response = await fetch(`${baseUrl}${articlePath}`);
        const html = await response.text();
        const document = new JSDOM(html).window.document;
        const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent || "null"));
        const entityGraph = jsonLd.find((data) => Array.isArray(data?.["@graph"]));
        const article = jsonLd.find((data) => data?.["@type"] === "BlogPosting");
        const organizationId = entityGraph?.["@graph"]?.find((node) => node?.["@type"] === "Organization")?.["@id"];
        const personId = entityGraph?.["@graph"]?.find((node) => node?.["@type"] === "Person")?.["@id"];

        assert.equal(response.status, 200);
        assert.ok(article, "BlogPosting JSON-LD must be rendered");
        assert.equal(article.inLanguage, locale.language);
        assert.equal(article.mainEntityOfPage?.["@id"]?.endsWith(articlePath), true);
        assert.equal(article["@id"], `${article.mainEntityOfPage["@id"]}#article`);
        assert.equal(article.author?.["@id"], personId);
        assert.equal(article.publisher?.["@id"], organizationId);
        assert.equal(article.isPartOf?.["@id"]?.endsWith("#website"), true);
        assert.equal(typeof article.headline, "string");
        assert.ok(article.headline.length > 0);
        assert.equal(typeof article.description, "string");
        assert.ok(article.description.length > 0);
        assert.match(article.datePublished, /^\d{4}-\d{2}-\d{2}T/);
        assert.match(article.dateModified, /^\d{4}-\d{2}-\d{2}T/);
        assert.equal(new Date(article.dateModified).getTime() >= new Date(article.datePublished).getTime(), true);
        assert.equal(Array.isArray(article.image), true);
        assert.match(article.image[0], /^https?:\/\//);

        const author = document.querySelector("[data-post-author]");
        const authorLink = author?.querySelector(`a[href="${locale.aboutPath}"]`);
        const publicationTime = author?.querySelector('time[data-date-kind="published"]');
        const updateTime = author?.querySelector('time[data-date-kind="updated"]');

        assert.ok(author, "the article must expose a visible author signature");
        assert.match(author.textContent || "", /Yohann Coussot/);
        assert.ok(authorLink, "the visible author must link to the localized About page");
        assert.equal(publicationTime?.getAttribute("datetime"), article.datePublished);
        if (article.dateModified !== article.datePublished) {
            assert.equal(updateTime?.getAttribute("datetime"), article.dateModified);
        } else {
            assert.equal(updateTime, null);
        }
    });
}
