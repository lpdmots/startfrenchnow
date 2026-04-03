#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const ROOT = process.cwd();

const WEBFLOW_CSS_FILES = ["app/styles/webflow.css", "app/styles/i-dont-speak-french.webflow.css"];
const SCAN_ROOTS = ["app", "components", "pages"];
const OUTPUT_DIR = "doc/webflow-class-audit";

const KEEP_PATTERNS = [
    /^btn(?:-|$)/,
    /^badge(?:-|$)/,
    /^roundButton$/,
    /^input(?:-|$)/,
    /^icon-/,
];
const ALWAYS_KEEP_PATTERNS = [/^w-/];
const KEEP_USAGE_THRESHOLD = Number(process.env.WEBFLOW_KEEP_THRESHOLD || 10);

const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".html", ".mdx"]);
const CSS_EXTENSIONS = new Set([".css"]);
const IGNORE_DIRS = new Set([".git", ".next", "node_modules", ".vercel"]);

const CLASS_NAME_REGEX = /^[A-Za-z_-][A-Za-z0-9_-]*$/;

function tokenizePotentialClasses(text) {
    return text
        .split(/[\s,]+/)
        .map((item) => item.trim())
        .map((item) => item.replace(/^[.#]+/, ""))
        .map((item) => item.replace(/^[`"'({[\s]+|[`"')}\];:\s]+$/g, ""))
        .filter(Boolean);
}

function extractCssClasses(content) {
    const classes = new Set();
    const root = postcss.parse(content);
    root.walkRules((rule) => {
        const selectors = rule.selectors || [];
        for (const selector of selectors) {
            const regex = /\.([A-Za-z_-][A-Za-z0-9_-]*)/g;
            let match = null;
            while ((match = regex.exec(selector)) !== null) {
                classes.add(match[1]);
            }
        }
    });
    return classes;
}

function stripTemplateExpressions(value) {
    return value.replace(/\$\{[^}]*\}/g, " ");
}

function extractStringLiterals(content) {
    const literals = [];
    const regex = /(["'`])((?:\\.|(?!\1)[\s\S])*)\1/g;
    let match = null;
    while ((match = regex.exec(content)) !== null) {
        const quote = match[1];
        let value = match[2];
        if (quote === "`") value = stripTemplateExpressions(value);
        literals.push(value);
    }
    return literals;
}

function shouldAlwaysKeep(className) {
    return ALWAYS_KEEP_PATTERNS.some((pattern) => pattern.test(className));
}

function shouldKeepByUsageOrPattern(className, usageCount) {
    if (KEEP_PATTERNS.some((pattern) => pattern.test(className))) return true;
    if (usageCount >= KEEP_USAGE_THRESHOLD) return true;
    return false;
}

function buildKeepDecision(className, usageCount) {
    if (shouldAlwaysKeep(className)) return true;
    if (usageCount === 0) return false;
    return shouldKeepByUsageOrPattern(className, usageCount);
}

function isLikelyClassName(value) {
    if (!CLASS_NAME_REGEX.test(value)) return false;
    if (value === "css") return false;
    if (value === "svg") return false;
    if (value === "woff") return false;
    if (value === "woff2") return false;
    if (value === "ttf") return false;
    if (value === "otf") return false;
    if (value === "eot") return false;
    if (value === "jpg" || value === "jpeg" || value === "png" || value === "webp" || value === "gif") return false;
    return true;
}

function extractClassNamesFromCode(content, knownClasses) {
    const tokens = [];

    const classAttrRegex = /\b(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g;
    let classAttrMatch = null;
    while ((classAttrMatch = classAttrRegex.exec(content)) !== null) {
        const raw = classAttrMatch[1] ?? classAttrMatch[2] ?? classAttrMatch[3] ?? "";
        const normalized = stripTemplateExpressions(raw);
        for (const token of tokenizePotentialClasses(normalized)) {
            if (isLikelyClassName(token) && knownClasses.has(token)) tokens.push(token);
        }
    }

    for (const literal of extractStringLiterals(content)) {
        for (const token of tokenizePotentialClasses(literal)) {
            if (isLikelyClassName(token) && knownClasses.has(token)) tokens.push(token);
        }
    }
    return tokens;
}

async function walkFiles(baseDir) {
    const files = [];
    async function walk(currentDir) {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith(".")) {
                if (entry.name !== ".env.local" && entry.name !== ".env") continue;
            }
            const absolutePath = path.join(currentDir, entry.name);
            const relativePath = path.relative(ROOT, absolutePath).split(path.sep).join("/");

            if (entry.isDirectory()) {
                if (IGNORE_DIRS.has(entry.name)) continue;
                await walk(absolutePath);
                continue;
            }
            files.push(relativePath);
        }
    }
    await walk(baseDir);
    return files;
}


async function main() {
    const webflowClassToSource = new Map();

    for (const cssFile of WEBFLOW_CSS_FILES) {
        const absolutePath = path.join(ROOT, cssFile);
        const content = await fs.readFile(absolutePath, "utf8");
        const classes = extractCssClasses(content);
        for (const className of classes) {
            if (!webflowClassToSource.has(className)) webflowClassToSource.set(className, new Set());
            webflowClassToSource.get(className).add(cssFile);
        }
    }

    const webflowClasses = new Set(webflowClassToSource.keys());
    const usage = new Map();

    for (const scanRoot of SCAN_ROOTS) {
        const absoluteRoot = path.join(ROOT, scanRoot);
        let rootStats = null;
        try {
            rootStats = await fs.stat(absoluteRoot);
        } catch {
            continue;
        }
        if (!rootStats.isDirectory()) continue;

        const files = await walkFiles(absoluteRoot);
        for (const relativePath of files) {
            if (WEBFLOW_CSS_FILES.includes(relativePath)) continue;

            const extension = path.extname(relativePath);
            if (!CODE_EXTENSIONS.has(extension) && !CSS_EXTENSIONS.has(extension)) continue;

            const content = await fs.readFile(path.join(ROOT, relativePath), "utf8");
            let usedTokens = [];

            if (CSS_EXTENSIONS.has(extension)) {
                usedTokens = Array.from(extractCssClasses(content)).filter((token) => webflowClasses.has(token));
            } else {
                usedTokens = extractClassNamesFromCode(content, webflowClasses);
            }

            if (usedTokens.length === 0) continue;

            const perFileCounter = new Map();
            for (const token of usedTokens) {
                perFileCounter.set(token, (perFileCounter.get(token) || 0) + 1);
            }

            for (const [token, count] of perFileCounter.entries()) {
                if (!usage.has(token)) {
                    usage.set(token, {
                        mentions: 0,
                        files: new Map(),
                    });
                }
                const entry = usage.get(token);
                entry.mentions += count;
                entry.files.set(relativePath, (entry.files.get(relativePath) || 0) + count);
            }
        }
    }

    const keep = [];
    const replace = [];
    const dropCandidates = [];

    const sortedClassNames = Array.from(webflowClasses).sort((a, b) => a.localeCompare(b));

    for (const className of sortedClassNames) {
        const usageEntry = usage.get(className);
        const mentions = usageEntry?.mentions || 0;
        const files =
            usageEntry?.files
                ? Array.from(usageEntry.files.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([file, count]) => ({ file, count }))
                : [];
        const sources = Array.from(webflowClassToSource.get(className) || []).sort();

        const item = {
            className,
            mentions,
            sources,
            files,
        };

        if (buildKeepDecision(className, mentions)) {
            keep.push(item);
        } else if (mentions === 0) {
            dropCandidates.push(item);
        } else {
            replace.push(item);
        }
    }

    const summary = {
        generatedAt: new Date().toISOString(),
        scannedWebflowFiles: WEBFLOW_CSS_FILES,
        scannedRoots: SCAN_ROOTS,
        keepUsageThreshold: KEEP_USAGE_THRESHOLD,
        totals: {
            webflowClasses: sortedClassNames.length,
            keep: keep.length,
            replace: replace.length,
            dropCandidates: dropCandidates.length,
        },
    };

    const outputAbsoluteDir = path.join(ROOT, OUTPUT_DIR);
    await fs.mkdir(outputAbsoluteDir, { recursive: true });

    await fs.writeFile(path.join(outputAbsoluteDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    await fs.writeFile(path.join(outputAbsoluteDir, "keep.json"), `${JSON.stringify(keep, null, 2)}\n`, "utf8");
    await fs.writeFile(path.join(outputAbsoluteDir, "replace.json"), `${JSON.stringify(replace, null, 2)}\n`, "utf8");
    await fs.writeFile(path.join(outputAbsoluteDir, "drop-candidates.json"), `${JSON.stringify(dropCandidates, null, 2)}\n`, "utf8");

    const reportLines = [
        "# Webflow Class Audit",
        "",
        `Generated: ${summary.generatedAt}`,
        "",
        `- Total classes found in Webflow CSS: ${summary.totals.webflowClasses}`,
        `- keep: ${summary.totals.keep}`,
        `- replace: ${summary.totals.replace}`,
        `- drop-candidates: ${summary.totals.dropCandidates}`,
        "",
        "## Files",
        "",
        "- `summary.json`",
        "- `keep.json`",
        "- `replace.json`",
        "- `drop-candidates.json`",
        "",
        "## Notes",
        "",
        "- `drop-candidates` means no usage found in scanned roots, not guaranteed dead in runtime/CMS.",
        "- `keep` includes explicit patterns (`w-*`, `btn-*`, `badge-*`, `roundButton`, `input-*`) plus heavily used classes.",
    ];
    await fs.writeFile(path.join(outputAbsoluteDir, "README.md"), `${reportLines.join("\n")}\n`, "utf8");

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
});
