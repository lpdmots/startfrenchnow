#!/usr/bin/env node
import "dotenv/config";
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
    console.error("Missing Sanity env vars. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN");
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
});

const toTaskRef = (taskId) => ({
    _type: "reference",
    _ref: taskId,
});

const normalizeAnswer = (answer) => {
    if (!answer || typeof answer !== "object") return { answer, changed: false };

    let changed = false;
    const next = { ...answer };

    if (!next.taskRef?._ref && typeof next.taskId === "string" && next.taskId.trim()) {
        next.taskRef = toTaskRef(next.taskId.trim());
        changed = true;
    }

    if (next.AiScore === null) {
        delete next.AiScore;
        changed = true;
    }

    return { answer: next, changed };
};

const normalizeAnswerArray = (items) => {
    if (!Array.isArray(items)) return { items, changed: false };
    let changed = false;
    const next = items.map((item) => {
        const normalized = normalizeAnswer(item);
        if (normalized.changed) changed = true;
        return normalized.answer;
    });
    return { items: next, changed };
};

async function migrateExamCompilation() {
    const docs = await client.fetch(`*[_type == "examCompilation"]{ _id, session }`);
    let updated = 0;

    for (const doc of docs) {
        if (!Array.isArray(doc.session)) continue;
        let changedDoc = false;

        const nextSession = doc.session.map((entry) => {
            let changedSession = false;
            const nextEntry = { ...entry };

            const speakA2 = normalizeAnswerArray(entry?.speakA2Answers);
            if (speakA2.changed) {
                nextEntry.speakA2Answers = speakA2.items;
                changedSession = true;
            }

            const speakBranch = normalizeAnswerArray(entry?.speakBranchAnswers);
            if (speakBranch.changed) {
                nextEntry.speakBranchAnswers = speakBranch.items;
                changedSession = true;
            }

            const readWrite = normalizeAnswerArray(entry?.readWriteAnswers);
            if (readWrite.changed) {
                nextEntry.readWriteAnswers = readWrite.items;
                changedSession = true;
            }

            if (changedSession) changedDoc = true;
            return nextEntry;
        });

        if (!changedDoc) continue;

        await client.patch(doc._id).set({ session: nextSession }).commit({ autoGenerateArrayKeys: true });
        updated += 1;
    }

    return { total: docs.length, updated };
}

async function migrateExamReview() {
    const docs = await client.fetch(`*[_type == "examReview"]{ _id, answers }`);
    let updated = 0;

    for (const doc of docs) {
        if (!doc.answers || typeof doc.answers !== "object") continue;
        let changed = false;
        const nextAnswers = { ...doc.answers };

        const speakA2 = normalizeAnswerArray(doc.answers?.speakA2);
        if (speakA2.changed) {
            nextAnswers.speakA2 = speakA2.items;
            changed = true;
        }

        const speakBranch = normalizeAnswerArray(doc.answers?.speakBranch);
        if (speakBranch.changed) {
            nextAnswers.speakBranch = speakBranch.items;
            changed = true;
        }

        const readWrite = normalizeAnswerArray(doc.answers?.readWrite);
        if (readWrite.changed) {
            nextAnswers.readWrite = readWrite.items;
            changed = true;
        }

        if (!changed) continue;

        await client.patch(doc._id).set({ answers: nextAnswers }).commit({ autoGenerateArrayKeys: true });
        updated += 1;
    }

    return { total: docs.length, updated };
}

async function run() {
    console.log("Migrating mock exam answers: taskId -> taskRef, and cleaning AiScore: null ...");
    const [compilation, review] = await Promise.all([migrateExamCompilation(), migrateExamReview()]);
    console.log(`examCompilation: ${compilation.updated}/${compilation.total} documents updated`);
    console.log(`examReview: ${review.updated}/${review.total} documents updated`);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
