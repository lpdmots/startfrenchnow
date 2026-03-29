#!/usr/bin/env node
import dotenv from "dotenv";
import { createClient } from "@sanity/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const getEnv = (name, fallback = "") => {
    const raw = process.env[name];
    if (typeof raw !== "string") return fallback;
    return raw.replace(/\r/g, "").trim() || fallback;
};

const projectId = getEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
const devDataset = getEnv("NEXT_PUBLIC_SANITY_DATASET");
const prodDataset = getEnv("NEXT_PUBLIC_SANITY_DATASET_PROD");
const apiVersion = getEnv("NEXT_PUBLIC_SANITY_API_VERSION", "2024-01-01");
const token = getEnv("SANITY_API_TOKEN");

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

const taskIdsArg =
    args.find((arg) => arg.startsWith("--taskIds="))?.slice("--taskIds=".length) ||
    (() => {
        const index = args.findIndex((arg) => arg === "--taskIds");
        return index >= 0 ? args[index + 1] : "";
    })();

const taskIds = (taskIdsArg || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

if (!projectId || !devDataset || !prodDataset || !token) {
    console.error("Missing env vars. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, NEXT_PUBLIC_SANITY_DATASET_PROD, SANITY_API_TOKEN");
    process.exit(1);
}

const devClient = createClient({
    projectId,
    dataset: devDataset,
    apiVersion,
    token,
    useCdn: false,
});

const prodClient = createClient({
    projectId,
    dataset: prodDataset,
    apiVersion,
    token,
    useCdn: false,
});

const isAssetRef = (ref) => typeof ref === "string" && (ref.startsWith("image-") || ref.startsWith("file-"));

const collectAssetRefs = (node, refs) => {
    if (Array.isArray(node)) {
        for (const item of node) collectAssetRefs(item, refs);
        return;
    }

    if (!node || typeof node !== "object") return;

    if (node._type === "reference" && isAssetRef(node._ref)) {
        refs.add(node._ref);
    }

    for (const value of Object.values(node)) {
        collectAssetRefs(value, refs);
    }
};

const remapAssetRefsInPlace = (node, refMap) => {
    if (Array.isArray(node)) {
        for (const item of node) remapAssetRefsInPlace(item, refMap);
        return;
    }

    if (!node || typeof node !== "object") return;

    if (node._type === "reference" && typeof node._ref === "string" && refMap.has(node._ref)) {
        node._ref = refMap.get(node._ref);
    }

    for (const value of Object.values(node)) {
        remapAssetRefsInPlace(value, refMap);
    }
};

const sanitizeDocForWrite = (doc) => {
    const next = structuredClone(doc);
    delete next._rev;
    delete next._createdAt;
    delete next._updatedAt;
    return next;
};

const fetchAssetBinary = async (assetDoc) => {
    const response = await fetch(assetDoc.url);
    if (!response.ok) {
        throw new Error(`Failed to download asset ${assetDoc._id} (${response.status} ${response.statusText})`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
};

async function uploadMissingAssets(assetDocs, existingProdAssetIds) {
    const refMap = new Map();
    let uploadedCount = 0;
    let reusedCount = 0;

    for (const assetDoc of assetDocs) {
        const sourceAssetId = assetDoc._id;

        if (existingProdAssetIds.has(sourceAssetId)) {
            refMap.set(sourceAssetId, sourceAssetId);
            reusedCount += 1;
            continue;
        }

        if (isDryRun) {
            refMap.set(sourceAssetId, sourceAssetId);
            continue;
        }

        const file = await fetchAssetBinary(assetDoc);
        const uploadKind = sourceAssetId.startsWith("image-") ? "image" : "file";

        const uploaded = await prodClient.assets.upload(uploadKind, file, {
            filename: assetDoc.originalFilename || `${sourceAssetId}.${assetDoc.extension || "bin"}`,
            contentType: assetDoc.mimeType || undefined,
        });

        refMap.set(sourceAssetId, uploaded._id);
        uploadedCount += 1;

        if (uploaded._id === sourceAssetId) {
            reusedCount += 1;
        }
    }

    return { refMap, uploadedCount, reusedCount };
}

async function run() {
    console.log("Sync mockExamTask dev -> prod (assets first, tasks second)");
    console.log(`Project: ${projectId}`);
    console.log(`Source dataset: ${devDataset}`);
    console.log(`Target dataset: ${prodDataset}`);
    console.log(`Mode: ${isDryRun ? "DRY RUN" : "EXECUTE"}`);

    const taskQuery = `*[
        _type == "mockExamTask" &&
        !(_id in path("drafts.**")) &&
        (!defined($taskIds) || _id in $taskIds)
    ]`;

    const tasks = await devClient.fetch(taskQuery, {
        taskIds: taskIds.length ? taskIds : null,
    });

    if (!tasks.length) {
        console.log("No mockExamTask found in source dataset.");
        return;
    }

    console.log(`Tasks fetched: ${tasks.length}`);

    const assetRefs = new Set();
    for (const task of tasks) {
        collectAssetRefs(task, assetRefs);
    }

    const assetIds = Array.from(assetRefs);
    console.log(`Referenced assets in tasks: ${assetIds.length}`);

    const existingProdAssetIds = new Set(
        (await prodClient.fetch(`*[_id in $ids]{_id}`, { ids: assetIds })).map((doc) => doc._id),
    );

    const assetsToFetch = assetIds.filter((assetId) => !existingProdAssetIds.has(assetId));

    const assetDocs = assetsToFetch.length
        ? await devClient.fetch(
              `*[
                _id in $ids &&
                _type in ["sanity.imageAsset", "sanity.fileAsset"]
              ]{
                _id,
                _type,
                url,
                mimeType,
                originalFilename,
                extension
              }`,
              { ids: assetsToFetch },
          )
        : [];

    if (assetDocs.length !== assetsToFetch.length) {
        const found = new Set(assetDocs.map((doc) => doc._id));
        const missing = assetsToFetch.filter((id) => !found.has(id));
        throw new Error(`Missing source assets in dev dataset: ${missing.join(", ")}`);
    }

    const { refMap, uploadedCount, reusedCount } = await uploadMissingAssets(assetDocs, existingProdAssetIds);

    for (const existingId of existingProdAssetIds) {
        if (!refMap.has(existingId)) {
            refMap.set(existingId, existingId);
        }
    }

    const preparedTasks = tasks.map((task) => {
        const doc = sanitizeDocForWrite(task);
        remapAssetRefsInPlace(doc, refMap);
        return doc;
    });

    if (isDryRun) {
        console.log("Dry run finished. No write performed.");
        console.log(`Assets already present in prod: ${existingProdAssetIds.size}`);
        console.log(`Assets to upload: ${assetDocs.length}`);
        console.log(`Tasks to upsert: ${preparedTasks.length}`);
        return;
    }

    const tx = prodClient.transaction();
    for (const task of preparedTasks) {
        tx.createOrReplace(task);
    }
    await tx.commit();

    console.log("Sync finished.");
    console.log(`Assets uploaded: ${uploadedCount}`);
    console.log(`Assets reused (same id already in prod or dedup on upload): ${reusedCount}`);
    console.log(`Tasks upserted: ${preparedTasks.length}`);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
