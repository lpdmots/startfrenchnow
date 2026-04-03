#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const ROOT = process.cwd();
const DROP_FILE = "doc/webflow-class-audit/drop-candidates.json";
const WEBFLOW_CSS_FILES = ["app/styles/webflow.css", "app/styles/i-dont-speak-french.webflow.css"];

const CLASS_REGEX = /\.([A-Za-z_-][A-Za-z0-9_-]*)/g;

function extractClassesFromSelector(selector) {
    const classes = new Set();
    let match = null;
    while ((match = CLASS_REGEX.exec(selector)) !== null) {
        classes.add(match[1]);
    }
    return classes;
}

async function readDropCandidates() {
    const absolutePath = path.join(ROOT, DROP_FILE);
    const raw = await fs.readFile(absolutePath, "utf8");
    const parsed = JSON.parse(raw);
    return new Set(parsed.map((item) => String(item.className || "")).filter(Boolean));
}

async function processFile(relativePath, dropSet) {
    const absolutePath = path.join(ROOT, relativePath);
    const original = await fs.readFile(absolutePath, "utf8");
    const root = postcss.parse(original, { from: absolutePath });

    let removedSelectors = 0;
    let removedRules = 0;

    root.walkRules((rule) => {
        if (!rule.selectors || rule.selectors.length === 0) return;

        const keptSelectors = [];
        for (const selector of rule.selectors) {
            const selectorClasses = extractClassesFromSelector(selector);
            const shouldDropSelector = Array.from(selectorClasses).some((className) => dropSet.has(className));
            if (shouldDropSelector) {
                removedSelectors += 1;
                continue;
            }
            keptSelectors.push(selector);
        }

        if (keptSelectors.length === 0) {
            rule.remove();
            removedRules += 1;
            return;
        }

        if (keptSelectors.length !== rule.selectors.length) {
            rule.selectors = keptSelectors;
        }
    });

    const next = root.toString();
    const changed = next !== original;
    if (changed) {
        await fs.writeFile(absolutePath, next, "utf8");
    }

    return {
        file: relativePath,
        changed,
        removedSelectors,
        removedRules,
    };
}

async function main() {
    const dropSet = await readDropCandidates();
    const results = [];

    for (const cssFile of WEBFLOW_CSS_FILES) {
        results.push(await processFile(cssFile, dropSet));
    }

    const summary = {
        appliedAt: new Date().toISOString(),
        dropCandidatesCount: dropSet.size,
        results,
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
});
