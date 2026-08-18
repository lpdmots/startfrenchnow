#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

import { rewritePortableTextLegacyLinks } from "./fideLegacyLinks.mjs";

dotenv.config({ path: ".env.local" });

const EXPECTED_DOCUMENTS = 12;
const EXPECTED_INITIAL_CHANGES = 48;
const BACKUP_PATH = "/tmp/startfrenchnow-sanity-backups/fide-posts-before-link-migration-2026-08-03.json";
const modes = new Set(["--dry-run", "--apply", "--verify"]);
const mode = process.argv[2] || "--dry-run";

if (!modes.has(mode) || process.argv.length > 3) {
    console.error("Usage: node scripts/sanity/migrateFideLegacyLinks.mjs [--dry-run|--apply|--verify]");
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
const fidePostsQuery = `*[
    _type == "post"
    && "fide" in categories
    && !(_id in path("drafts.**"))
] | order(slug.current asc)`;

function migrateDocument(document) {
    const french = rewritePortableTextLegacyLinks(document.body, "fr");
    const english = rewritePortableTextLegacyLinks(document.body_en, "en");
    return {
        document,
        fields: {
            ...(french.changes.length > 0 ? { body: french.value } : {}),
            ...(english.changes.length > 0 ? { body_en: english.value } : {}),
        },
        changes: [
            ...french.changes.map((change) => ({ ...change, field: "body" })),
            ...english.changes.map((change) => ({ ...change, field: "body_en" })),
        ],
    };
}

function collectStartFrenchNowLinks(value, result = []) {
    if (Array.isArray(value)) {
        value.forEach((item) => collectStartFrenchNowLinks(item, result));
        return result;
    }
    if (!value || typeof value !== "object") return result;

    for (const [key, child] of Object.entries(value)) {
        if (key === "href" && typeof child === "string") {
            try {
                const parsed = new URL(child);
                if (["startfrenchnow.com", "www.startfrenchnow.com", "startfrenchnow.ch", "www.startfrenchnow.ch"].includes(parsed.hostname.toLowerCase())) {
                    result.push(child);
                }
            } catch {
                // Relative and malformed links are outside this domain migration.
            }
        } else {
            collectStartFrenchNowLinks(child, result);
        }
    }
    return result;
}

function assertExpectedDocuments(documents) {
    if (documents.length !== EXPECTED_DOCUMENTS) {
        throw new Error(`Safety check failed: expected ${EXPECTED_DOCUMENTS} published FIDE posts, received ${documents.length}.`);
    }
}

function printChanges(migrations) {
    for (const migration of migrations) {
        for (const change of migration.changes) {
            console.log(`${migration.document.slug?.current} ${change.field}.${change.path}`);
            console.log(`  ${change.from}`);
            console.log(`  -> ${change.to}`);
        }
    }
}

async function validateDestinations(documents) {
    const links = new Set(
        documents.flatMap((document) => [
            ...collectStartFrenchNowLinks(document.body),
            ...collectStartFrenchNowLinks(document.body_en),
        ]),
    );
    const failures = [];

    for (const link of links) {
        const requestUrl = new URL(link);
        requestUrl.hash = "";
        let response = await fetch(requestUrl, { method: "HEAD", redirect: "follow" });
        if (response.status === 405) response = await fetch(requestUrl, { redirect: "follow" });
        if (response.status >= 400) failures.push(`${requestUrl} -> HTTP ${response.status}`);
    }

    if (failures.length > 0) {
        throw new Error(`Destination verification failed:\n${failures.join("\n")}`);
    }
    return links.size;
}

async function loadDocuments() {
    const documents = await client.fetch(fidePostsQuery);
    assertExpectedDocuments(documents);
    return documents;
}

async function dryRun() {
    const documents = await loadDocuments();
    const migrations = documents.map(migrateDocument);
    const changeCount = migrations.reduce((total, migration) => total + migration.changes.length, 0);
    printChanges(migrations);
    if (changeCount !== EXPECTED_INITIAL_CHANGES) {
        throw new Error(`Safety check failed: expected ${EXPECTED_INITIAL_CHANGES} legacy links, received ${changeCount}.`);
    }
    console.log(`Dry run verified: ${documents.length} documents, ${changeCount} URL changes, no writes.`);
}

async function applyMigration() {
    const documents = await loadDocuments();
    const migrations = documents.map(migrateDocument);
    const changeCount = migrations.reduce((total, migration) => total + migration.changes.length, 0);
    if (changeCount !== EXPECTED_INITIAL_CHANGES) {
        throw new Error(`Safety check failed: expected ${EXPECTED_INITIAL_CHANGES} legacy links before apply, received ${changeCount}.`);
    }

    await mkdir(path.dirname(BACKUP_PATH), { recursive: true });
    await writeFile(BACKUP_PATH, `${JSON.stringify(documents, null, 2)}\n`, { flag: "wx" });

    let transaction = client.transaction();
    for (const migration of migrations) {
        transaction = transaction.patch(migration.document._id, (patch) => patch.set(migration.fields));
    }
    await transaction.commit({ autoGenerateArrayKeys: true });
    console.log(`Applied ${changeCount} URL changes in ${migrations.length} documents.`);
    console.log(`Backup: ${BACKUP_PATH}`);
}

async function verifyMigration() {
    const documents = await loadDocuments();
    const migrations = documents.map(migrateDocument);
    const remainingChanges = migrations.reduce((total, migration) => total + migration.changes.length, 0);
    const serialized = JSON.stringify(documents);

    if (remainingChanges !== 0 || serialized.includes("startfrenchnow.com")) {
        throw new Error(`Verification failed: ${remainingChanges} rewriteable legacy links remain.`);
    }

    for (const document of documents) {
        const frenchLinks = collectStartFrenchNowLinks(document.body).map((link) => new URL(link));
        const englishLinks = collectStartFrenchNowLinks(document.body_en).map((link) => new URL(link));
        const invalidFrench = frenchLinks.filter((link) => !link.pathname.startsWith("/fr/"));
        const invalidEnglish = englishLinks.filter((link) => link.pathname === "/fr" || link.pathname.startsWith("/fr/"));
        if (invalidFrench.length > 0 || invalidEnglish.length > 0) {
            throw new Error(`Locale verification failed for ${document.slug?.current}.`);
        }
    }

    const destinationCount = await validateDestinations(documents);
    console.log(`Verification passed: ${documents.length} documents, 0 legacy links, ${destinationCount} unique canonical destinations reachable.`);
}

try {
    if (mode === "--dry-run") await dryRun();
    if (mode === "--apply") await applyMigration();
    if (mode === "--verify") await verifyMigration();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
