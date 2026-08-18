import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3100").replace(/\/$/, "");

async function loadSchemas(path) {
    const response = await fetch(`${baseUrl}${path}`);
    const document = new JSDOM(await response.text()).window.document;
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent || "null"));

    assert.equal(response.status, 200, `${path} must return HTTP 200`);
    return schemas;
}

function findSchema(schemas, type) {
    return schemas.find((schema) => schema?.["@type"] === type);
}

for (const locale of [
    { name: "English", prefix: "", aboutPath: "/about" },
    { name: "French", prefix: "/fr", aboutPath: "/fr/about" },
]) {
    test(`${locale.name} pages reuse the canonical organization and person entities`, async () => {
        const homeSchemas = await loadSchemas(locale.prefix || "/");
        const graph = homeSchemas.find((schema) => Array.isArray(schema?.["@graph"]));
        const website = graph?.["@graph"].find((node) => node?.["@type"] === "WebSite");
        const organization = graph?.["@graph"].find((node) => node?.["@type"] === "Organization");
        const person = graph?.["@graph"].find((node) => node?.["@type"] === "Person");

        assert.ok(graph, `${locale.name} home must render the shared entity graph`);
        assert.match(website?.["@id"] || "", /#website$/);
        assert.match(organization?.["@id"] || "", /#organization$/);
        assert.match(person?.["@id"] || "", /\/about#yohann-coussot$/);
        assert.equal(person.url.endsWith(locale.aboutPath), true);
        assert.deepEqual(website.publisher, { "@id": organization["@id"] });
        assert.deepEqual(organization.founder, { "@id": person["@id"] });

        const commercialPages = [
            { path: `${locale.prefix}/fide/mock-exams`, type: "Product", references: ["offers.seller"] },
            { path: `${locale.prefix}/fide/pack-fide`, type: "Product", references: ["offers.seller"] },
            { path: `${locale.prefix}/fide/private-courses`, type: "Service", references: ["provider"] },
        ];

        for (const page of commercialPages) {
            const schema = findSchema(await loadSchemas(page.path), page.type);
            assert.ok(schema, `${page.path} must render ${page.type} JSON-LD`);

            for (const referencePath of page.references) {
                const reference = referencePath.split(".").reduce((value, key) => value?.[key], schema);
                assert.equal(reference?.["@id"], organization["@id"], `${page.path} ${referencePath} must reuse the canonical organization`);
            }

            if (page.type === "Product") {
                assert.deepEqual(
                    schema.brand,
                    { "@type": "Brand", name: "Start French Now" },
                    `${page.path} brand must be a valid named Brand object`,
                );
            }
        }
    });
}
