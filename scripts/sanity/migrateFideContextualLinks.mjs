#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

import {
    FIDE_CONTEXTUAL_LINK_KEY_PREFIX,
    FIDE_CONTEXTUAL_LINK_PLAN,
    getFideContextualLinkTargets,
    rewriteFideContextualLinks,
} from "./fideContextualLinks.mjs";

dotenv.config({ path: ".env.local" });

const EXPECTED_DOCUMENTS = 12;
const BACKUP_PATH = "/tmp/startfrenchnow-sanity-backups/fide-posts-before-link-punctuation-removal-2026-08-03.json";
const modes = new Set(["--dry-run", "--apply", "--verify"]);
const mode = process.argv[2] || "--dry-run";

if (!modes.has(mode) || process.argv.length > 3) {
    console.error("Usage: node scripts/sanity/migrateFideContextualLinks.mjs [--dry-run|--apply|--verify]");
    process.exit(1);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET_PROD;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
    console.error("Missing required Sanity production configuration.");
    process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
const expectedSlugs = Object.keys(FIDE_CONTEXTUAL_LINK_PLAN).sort();
const fidePostsQuery = `*[
    _type == "post"
    && slug.current in $slugs
    && "fide" in categories
    && !(_id in path("drafts.**"))
] | order(slug.current asc) {
    _id,
    _rev,
    slug,
    title,
    title_en,
    body,
    body_en
}`;

function collectLinks(value, result = []) {
    if (Array.isArray(value)) {
        value.forEach((item) => collectLinks(item, result));
        return result;
    }
    if (!value || typeof value !== "object") return result;

    for (const [key, child] of Object.entries(value)) {
        if (key === "href" && typeof child === "string") result.push(child);
        else collectLinks(child, result);
    }
    return result;
}

function contextualFooter(body) {
    return body.filter((block) => String(block?._key || "").startsWith(FIDE_CONTEXTUAL_LINK_KEY_PREFIX));
}

function assertExpectedDocuments(documents) {
    const slugs = documents.map((document) => document.slug?.current).sort();
    if (documents.length !== EXPECTED_DOCUMENTS || JSON.stringify(slugs) !== JSON.stringify(expectedSlugs)) {
        throw new Error(`Safety check failed: expected exactly the 12 planned FIDE slugs; received ${slugs.join(", ")}.`);
    }
}

function migrateDocument(document) {
    const slug = document.slug.current;
    const french = rewriteFideContextualLinks(document.body, { slug, locale: "fr" });
    const english = rewriteFideContextualLinks(document.body_en, { slug, locale: "en" });
    return {
        document,
        fields: {
            ...(french.changed ? { body: french.value } : {}),
            ...(english.changed ? { body_en: english.value } : {}),
        },
        french,
        english,
    };
}

function assertFooter(body, slug, locale) {
    const footer = contextualFooter(body);
    if (footer.length !== 4) {
        throw new Error(`${slug} (${locale}): expected 4 generated footer blocks, received ${footer.length}.`);
    }

    const links = collectLinks(footer);
    const expectedLinks = getFideContextualLinkTargets(slug, locale);
    if (JSON.stringify(links) !== JSON.stringify(expectedLinks)) {
        throw new Error(`${slug} (${locale}): contextual destinations do not match the approved plan.`);
    }

    if (JSON.stringify(body).includes("ContactForFIDECourses")) {
        throw new Error(`${slug} (${locale}): the legacy contact anchor still exists.`);
    }
}

function printMigration(migration) {
    const slug = migration.document.slug.current;
    const frenchLinks = getFideContextualLinkTargets(slug, "fr");
    const englishLinks = getFideContextualLinkTargets(slug, "en");
    console.log(`${slug}`);
    console.log(`  FR: ${migration.french.changed ? "change" : "unchanged"}; remove ${migration.french.removedBlockCount}; ${frenchLinks.join(" | ")}`);
    console.log(`  EN: ${migration.english.changed ? "change" : "unchanged"}; remove ${migration.english.removedBlockCount}; ${englishLinks.join(" | ")}`);
}

async function loadDocuments() {
    const documents = await client.fetch(fidePostsQuery, { slugs: expectedSlugs });
    assertExpectedDocuments(documents);
    return documents;
}

async function validateDestinations() {
    const destinations = new Set(
        expectedSlugs.flatMap((slug) => [
            ...getFideContextualLinkTargets(slug, "fr"),
            ...getFideContextualLinkTargets(slug, "en"),
        ]),
    );
    const failures = [];

    for (const destination of destinations) {
        const requestUrl = new URL(destination);
        requestUrl.hash = "";
        let response = await fetch(requestUrl, { method: "HEAD", redirect: "follow" });
        if (response.status === 405 || response.status >= 500) response = await fetch(requestUrl, { redirect: "follow" });
        if (response.status >= 400) failures.push(`${requestUrl} -> HTTP ${response.status}`);
    }

    if (failures.length > 0) {
        throw new Error(`Destination verification failed:\n${failures.join("\n")}`);
    }
    return destinations.size;
}

async function dryRun() {
    const documents = await loadDocuments();
    const migrations = documents.map(migrateDocument);
    migrations.forEach(printMigration);
    const changedDocuments = migrations.filter((migration) => Object.keys(migration.fields).length > 0).length;
    const changedFields = migrations.reduce((total, migration) => total + Object.keys(migration.fields).length, 0);

    if (![0, EXPECTED_DOCUMENTS].includes(changedDocuments) || ![0, EXPECTED_DOCUMENTS * 2].includes(changedFields)) {
        throw new Error(`Safety check failed: partial migration state (${changedDocuments} documents, ${changedFields} fields).`);
    }
    console.log(`Dry run verified: ${documents.length} documents, ${changedDocuments} would change, ${changedFields} fields, no writes.`);
}

async function applyMigration() {
    const documents = await loadDocuments();
    const migrations = documents.map(migrateDocument);
    const changedDocuments = migrations.filter((migration) => Object.keys(migration.fields).length > 0).length;
    const changedFields = migrations.reduce((total, migration) => total + Object.keys(migration.fields).length, 0);

    if (changedDocuments !== EXPECTED_DOCUMENTS || changedFields !== EXPECTED_DOCUMENTS * 2) {
        throw new Error(`Safety check failed before apply: expected 12 documents and 24 fields; received ${changedDocuments} documents and ${changedFields} fields.`);
    }

    for (const migration of migrations) {
        assertFooter(migration.french.value, migration.document.slug.current, "fr");
        assertFooter(migration.english.value, migration.document.slug.current, "en");
    }

    await mkdir(path.dirname(BACKUP_PATH), { recursive: true });
    await writeFile(BACKUP_PATH, `${JSON.stringify(documents, null, 2)}\n`, { flag: "wx" });

    let transaction = client.transaction();
    for (const migration of migrations) {
        transaction = transaction.patch(migration.document._id, (patch) => patch.ifRevisionId(migration.document._rev).set(migration.fields));
    }
    await transaction.commit({ autoGenerateArrayKeys: true });
    console.log(`Applied contextual linking to ${migrations.length} documents and ${changedFields} localized fields.`);
    console.log(`Backup: ${BACKUP_PATH}`);
}

async function verifyMigration() {
    const documents = await loadDocuments();
    for (const document of documents) {
        const slug = document.slug.current;
        assertFooter(document.body, slug, "fr");
        assertFooter(document.body_en, slug, "en");
        const french = rewriteFideContextualLinks(document.body, { slug, locale: "fr" });
        const english = rewriteFideContextualLinks(document.body_en, { slug, locale: "en" });
        if (french.changed || english.changed) throw new Error(`${slug}: migration is not idempotent.`);
    }

    const destinationCount = await validateDestinations();
    console.log(`Verification passed: ${documents.length} documents, 72 contextual links, ${destinationCount} unique destinations reachable.`);
}

try {
    if (mode === "--dry-run") await dryRun();
    if (mode === "--apply") await applyMigration();
    if (mode === "--verify") await verifyMigration();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
