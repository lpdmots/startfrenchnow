import { JSDOM } from "jsdom";

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3100").replace(/\/$/, "");
const auditScope = process.env.SEO_AUDIT_SCOPE || "all";
const validAuditScopes = new Set(["all", "pages", "sitemap"]);
const auditLocale = process.env.SEO_AUDIT_LOCALE || "all";
const validAuditLocales = new Set(["all", "en", "fr"]);

if (!validAuditScopes.has(auditScope)) {
    throw new Error(`Invalid SEO_AUDIT_SCOPE “${auditScope}”; expected all, pages, or sitemap.`);
}
if (!validAuditLocales.has(auditLocale)) {
    throw new Error(`Invalid SEO_AUDIT_LOCALE “${auditLocale}”; expected all, en, or fr.`);
}

const pages = [
    { path: "/", title: "Swiss FIDE Test Prep (A1–B1) | Start French Now", maxHtmlBytes: 390_000 },
    { path: "/fide", title: "Swiss FIDE Test: Complete A1–B1 Guide | Start French Now", maxHtmlBytes: 390_000 },
    { path: "/fide/pack-fide", title: "FIDE Exam Pack A1–B1 | Start French Now", maxHtmlBytes: 390_000 },
    { path: "/fide/mock-exams", title: "Online FIDE Mock Exam A1–B1 | Start French Now", maxHtmlBytes: 390_000 },
    { path: "/fide/private-courses", title: "Online Private FIDE Lessons A1–B1 | Start French Now", maxHtmlBytes: 390_000 },
    { path: "/fr", title: "Préparation test FIDE Suisse (A1–B1) | Start French Now", maxHtmlBytes: 420_000 },
    { path: "/fr/fide", title: "Test FIDE Suisse : guide complet A1–B1 | Start French Now", maxHtmlBytes: 420_000 },
    { path: "/fr/fide/pack-fide", title: "Pack Exam FIDE A1–B1 | Start French Now", maxHtmlBytes: 420_000 },
    { path: "/fr/fide/mock-exams", title: "Examen blanc FIDE en ligne A1–B1 | Start French Now", maxHtmlBytes: 420_000 },
    { path: "/fr/fide/private-courses", title: "Cours privés FIDE en ligne A1–B1 | Start French Now", maxHtmlBytes: 420_000 },
];

const failures = [];
const results = new Map();
const selectedPages = pages.filter((page) => {
    if (auditLocale === "all") return true;
    return auditLocale === "fr" ? page.path === "/fr" || page.path.startsWith("/fr/") : !page.path.startsWith("/fr");
});

async function loadPage(pagePath) {
    const response = await fetch(`${baseUrl}${pagePath}`, { redirect: "manual" });
    const html = await response.text();
    return { html, status: response.status };
}

function check(condition, message) {
    if (!condition) failures.push(message);
}

if (auditScope !== "sitemap") {
for (const page of selectedPages) {
    const response = await loadPage(page.path);
    const { html } = response;
    const document = new JSDOM(html).window.document;
    const htmlBytes = Buffer.byteLength(html);
    const h1Count = document.querySelectorAll("h1").length;
    const forcedEnglishLinks = [...document.querySelectorAll('a[href^="/en/"]')].map((link) => link.getAttribute("href"));

    results.set(page.path, { document, html, htmlBytes });

    check(response.status === 200, `${page.path}: expected HTTP 200, received ${response.status}`);
    check(document.title === page.title, `${page.path}: expected title “${page.title}”, received “${document.title}”`);
    check(h1Count === 1, `${page.path}: expected exactly one H1, received ${h1Count}`);
    check(forcedEnglishLinks.length === 0, `${page.path}: found ${forcedEnglishLinks.length} forced /en/ link(s), e.g. ${forcedEnglishLinks.slice(0, 3).join(", ")}`);
    check(htmlBytes <= page.maxHtmlBytes, `${page.path}: HTML is ${htmlBytes} bytes; limit is ${page.maxHtmlBytes}`);
}

if (auditLocale !== "fr") {
    const home = results.get("/")?.document;
    check(Boolean(home?.querySelector('meta[property="og:title"]')?.getAttribute("content")), "/: missing og:title");
    check(Boolean(home?.querySelector('meta[property="og:description"]')?.getAttribute("content")), "/: missing og:description");
    check(Boolean(home?.querySelector('meta[property="og:image"]')?.getAttribute("content")), "/: missing og:image");
    check(home?.querySelector('meta[name="twitter:card"]')?.getAttribute("content") === "summary_large_image", "/: missing summary_large_image Twitter card");
    const preloadedFonts = home?.querySelectorAll('link[rel="preload"][as="font"]') || [];
    check(preloadedFonts.length > 0 && preloadedFonts.length <= 4, `/: expected 1–4 optimized font preloads, received ${preloadedFonts.length}`);

const englishFideHtml = results.get("/fide")?.html || "";
const englishFideDocument = results.get("/fide")?.document;
const knownFrenchGuideTitles = [
    "FIDE Test : la partie B1 parler",
    "Le test FIDE : l’oral A2 en détail",
    "Le test FIDE : l'oral A2 en détail",
    "Le test FIDE : l’oral B1 en détail",
    "Le test FIDE : l'oral B1 en détail",
];
for (const title of knownFrenchGuideTitles) {
    check(!englishFideHtml.includes(title), `/fide: untranslated French guide title remains: “${title}”`);
}

const fideYoutubeIds = ["Cc78NsVrKNY", "HJ0gjYlbmAw", "q2ov3ONIszw", "aSyBOLTKkcc", "wMv-bzxLmnk"];
for (const id of fideYoutubeIds) {
    const thumbnail = englishFideDocument?.querySelector(`img[data-youtube-thumbnail="${id}"]`);
    check(Boolean(thumbnail), `/fide: missing local lightweight YouTube thumbnail for ${id}`);
    check(thumbnail?.getAttribute("loading") === "lazy", `/fide: YouTube thumbnail ${id} is not lazy-loaded`);
    check(thumbnail?.getAttribute("src")?.includes(`/images/youtube/${id}.webp`), `/fide: YouTube thumbnail ${id} is not served locally as WebP`);
}
}

if (auditLocale !== "en") {
const frenchMockDocument = results.get("/fr/fide/mock-exams")?.document;
const frenchMockHtml = results.get("/fr/fide/mock-exams")?.html || "";
check(!frenchMockHtml.includes("/images/thumbnail-mock-exam.png"), "/fr/fide/mock-exams: heavy PNG video poster is still referenced");
check(frenchMockHtml.includes("/images/thumbnail-mock-exam.webp"), "/fr/fide/mock-exams: optimized WebP video poster is missing");
const frenchMockJsonLd = [...(frenchMockDocument?.querySelectorAll('script[type="application/ld+json"]') || [])]
    .map((script) => {
        try {
            return JSON.parse(script.textContent || "null");
        } catch {
            return null;
        }
    })
    .find((data) => data?.["@type"] === "Product");
const frenchOfferUrl = frenchMockJsonLd?.offers?.url || "";
check(frenchOfferUrl.includes("/fr/checkout/mock_exam"), `/fr/fide/mock-exams: Product offer URL is not localized: ${frenchOfferUrl}`);
check(frenchOfferUrl.includes(encodeURIComponent("/fr/fide/mock-exams")), `/fr/fide/mock-exams: callback URL is not localized: ${frenchOfferUrl}`);

const frenchHomeDocument = results.get("/fr")?.document;
const siteEntityGraph = [...(frenchHomeDocument?.querySelectorAll('script[type="application/ld+json"]') || [])]
    .map((script) => {
        try {
            return JSON.parse(script.textContent || "null");
        } catch {
            return null;
        }
    })
    .find((data) => Array.isArray(data?.["@graph"]));
const organizationId = siteEntityGraph?.["@graph"]?.find((node) => node?.["@type"] === "Organization")?.["@id"];
check(Boolean(siteEntityGraph), "/fr: missing shared WebSite/Organization/Person entity graph");
check(typeof organizationId === "string" && organizationId.endsWith("#organization"), `/fr: invalid canonical organization ID: ${organizationId}`);
const commercialEntityExpectations = [
    { path: "/fr/fide/mock-exams", type: "Product", references: ["offers.seller"] },
    { path: "/fr/fide/pack-fide", type: "Product", references: ["offers.seller"] },
    { path: "/fr/fide/private-courses", type: "Service", references: ["provider"] },
];
for (const expectation of commercialEntityExpectations) {
    const document = results.get(expectation.path)?.document;
    const schema = [...(document?.querySelectorAll('script[type="application/ld+json"]') || [])]
        .map((script) => {
            try {
                return JSON.parse(script.textContent || "null");
            } catch {
                return null;
            }
        })
        .find((data) => data?.["@type"] === expectation.type);

    check(Boolean(schema), `${expectation.path}: missing ${expectation.type} JSON-LD`);
    for (const referencePath of expectation.references) {
        const reference = referencePath.split(".").reduce((value, key) => value?.[key], schema);
        check(reference?.["@id"] === organizationId, `${expectation.path}: ${referencePath} must reference the shared organization ${organizationId}`);
    }
    if (expectation.type === "Product") {
        check(schema?.brand?.["@type"] === "Brand", `${expectation.path}: brand must use the Brand type`);
        check(schema?.brand?.name === "Start French Now", `${expectation.path}: brand must include the Start French Now name`);
    }
}
}

const permitPathExpectations = {
    "/fide": ["A1 speaking", "A2 speaking + A1 writing", "B1 speaking + A2 writing"],
    "/fr/fide": ["A1 oral", "A2 oral + A1 écrit", "B1 oral + A2 écrit"],
};
for (const [path, expectedLevels] of Object.entries(permitPathExpectations)) {
    if (!results.has(path)) continue;
    const document = results.get(path)?.document;
    const sections = document?.querySelectorAll("[data-fide-permit-path]") || [];
    const routes = document?.querySelectorAll("[data-fide-permit-route]") || [];
    const legacyCards = document?.querySelectorAll("[data-fide-permit-card]") || [];
    const sectionText = sections[0]?.textContent?.replace(/\s+/g, " ") || "";
    const sectionTitle = sections[0]?.querySelector("#fide-permit-path-title");
    const titleHighlight = sectionTitle?.querySelector(".heading-span-secondary-3");
    const officialLink = sections[0]?.querySelector('a[href^="https://www.sem.admin.ch/sem/"]');
    const preparationLink = sections[0]?.querySelector('a[href$="#fide-hub"]');

    check(sections.length === 1, `${path}: expected one compact permit path section, received ${sections.length}`);
    check(sections[0]?.classList.contains("bg-neutral-200"), `${path}: permit path section should use the neutral-200 background`);
    check(sectionTitle?.classList.contains("display-2"), `${path}: permit path title should use display-2 like neighboring section titles`);
    check(Boolean(titleHighlight), `${path}: permit path title is missing its secondary-3 highlighted span`);
    check(routes.length === 3, `${path}: expected three permit routes in the comparison rail, received ${routes.length}`);
    check(legacyCards.length === 0, `${path}: the repeated card layout is still present`);
    for (const level of expectedLevels) {
        check(sectionText.includes(level), `${path}: permit path section is missing “${level}”`);
    }
    check(Boolean(officialLink), `${path}: missing official SEM language-requirements source`);
    check(officialLink?.getAttribute("target") === "_blank", `${path}: official SEM source should open in a new tab`);
    check(officialLink?.getAttribute("rel")?.includes("noreferrer"), `${path}: official SEM source is missing a safe rel attribute`);
    check(Boolean(preparationLink), `${path}: permit path section is missing the #fide-hub preparation link`);
}

const proofPages = ["/", "/fide/pack-fide", "/fide/private-courses"];
for (const path of proofPages) {
    if (!results.has(path)) continue;
    const document = results.get(path)?.document;
    const body = document?.body.cloneNode(true);
    body?.querySelectorAll("script, style").forEach((node) => node.remove());
    const text = body?.textContent || "";
    check(text.includes("98%"), `${path}: expected a visible 98% success-rate proof`);
    check(!document?.querySelector('[data-current-value="99"]'), `${path}: stale 99% success-rate proof remains`);
    check(!text.toLowerCase().includes("close to 100%"), `${path}: stale “close to 100%” claim remains`);
}

const commercialClaimPages = ["/", "/fide/pack-fide", "/fide/private-courses", "/fr", "/fr/fide/pack-fide", "/fr/fide/private-courses"];
const unsupportedCommercialClaims = [
    "most complete e-learning platform",
    "plateforme e-learning la plus complète",
    "guaranteed progress",
    "progression garantie",
    "proven method",
    "méthode validée",
    "méthode qui a fait ses preuves",
    "best french instructor",
    "meilleur formateur de français",
    "best preparation possible",
    "meilleure préparation possible",
    "most popular french instructor",
    "formateur de français le plus plébiscité",
    "fide exam expert",
    "expert de l'examen fide",
    "guidance from an expert",
    "guidé par un expert",
    "best possible plan",
    "meilleur plan possible",
    "current scenarios",
    "scénarios actuels",
    "recent a1-a2",
    "scénarios récents a1-a2",
];
for (const path of commercialClaimPages) {
    if (!results.has(path)) continue;
    const body = results.get(path)?.document.body.cloneNode(true);
    body?.querySelectorAll("script, style").forEach((node) => node.remove());
    const text = (body?.textContent || "").replace(/\s+/g, " ").toLowerCase();
    for (const claim of unsupportedCommercialClaims) {
        check(!text.includes(claim), `${path}: unsupported commercial claim remains: “${claim}”`);
    }
}

}

if (auditScope !== "pages") {
const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
const sitemapXml = await sitemapResponse.text();
const sitemapDocument = new JSDOM(sitemapXml, { contentType: "text/xml" }).window.document;
const sitemapLocations = [...sitemapDocument.querySelectorAll("loc")].map((node) => node.textContent?.trim()).filter(Boolean);
const duplicateLocations = [...new Set(sitemapLocations.filter((location, index) => sitemapLocations.indexOf(location) !== index))];
const sitemapPathnames = sitemapLocations.map((location) => {
    try {
        return new URL(location).pathname;
    } catch {
        return location;
    }
});
const publishedFideArticleSlugs = [
    "1-votre-guide-pratique-pour-reussir-le-test-fide",
    "2-le-test-fide-la-partie-orale-parler",
    "3-le-test-fide-la-partie-orale-comprendre",
    "4-le-test-fide-lire-et-ecrire",
    "5-le-test-fide-l-oral-a2-en-detail",
    "6-le-test-fide-l-oral-b1-en-detail",
    "7-le-test-fide-conseils-et-strategies",
    "fide-a2-oral-reussir-discussion-tache-3",
    "fide-a2-reussir-description-image-oral-tache-1",
    "fide-exam-jeu-de-role-simulation-a2",
    "fide-test-la-partie-b1-parler",
    "passe-compose-a2-usage-avoir-etre-participe-passe",
];
check(sitemapResponse.status === 200, `/sitemap.xml: expected HTTP 200, received ${sitemapResponse.status}`);
check(duplicateLocations.length === 0, `/sitemap.xml: duplicate URLs: ${duplicateLocations.join(", ")}`);
check(!sitemapPathnames.includes("/blog/category/fide"), "/sitemap.xml: non-routable English FIDE category remains");
check(!sitemapPathnames.includes("/fr/blog/category/fide"), "/sitemap.xml: non-routable French FIDE category remains");
for (const slug of publishedFideArticleSlugs) {
    check(sitemapPathnames.includes(`/blog/post/${slug}`), `/sitemap.xml: missing English FIDE article ${slug}`);
    check(sitemapPathnames.includes(`/fr/blog/post/${slug}`), `/sitemap.xml: missing French FIDE article ${slug}`);
}
}

for (const [path, result] of results) {
    console.log(`${path.padEnd(30)} ${String(result.htmlBytes).padStart(8)} bytes`);
}

if (failures.length > 0) {
    console.error(`\nSEO integration audit failed with ${failures.length} issue(s):`);
    failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
    process.exitCode = 1;
} else {
    console.log("\nSEO integration audit passed.");
}
