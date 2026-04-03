#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const ROOT = process.cwd();
const REPLACE_FILE = "doc/webflow-class-audit/replace.json";
const OUTPUT_MAPPING_FILE = "doc/webflow-class-audit/replace-tailwind-mapping.json";
const WEBFLOW_CSS_FILES = ["app/styles/webflow.css", "app/styles/i-dont-speak-french.webflow.css"];
const SCAN_ROOTS = ["app", "components", "pages"];
const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".html", ".mdx"]);
const IGNORE_DIRS = new Set([".git", ".next", "node_modules", ".vercel"]);

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeArbitraryValue(value) {
    return value
        .trim()
        .replace(/\s+/g, "_")
        .replace(/,/g, "\\,");
}

function tokenWithVariants(base, variants) {
    if (!base) return null;
    return `${variants.join("")}${base}`;
}

function toArbitraryPropertyToken(property, value) {
    return `[${property}:${normalizeArbitraryValue(value)}]`;
}

function mapDisplay(value) {
    const map = {
        flex: "flex",
        grid: "grid",
        block: "block",
        none: "hidden",
        "inline-block": "inline-block",
        inline: "inline",
        "inline-flex": "inline-flex",
    };
    return map[value] || null;
}

function mapJustifyContent(value) {
    const map = {
        center: "justify-center",
        "flex-start": "justify-start",
        "flex-end": "justify-end",
        "space-between": "justify-between",
        "space-around": "justify-around",
        "space-evenly": "justify-evenly",
    };
    return map[value] || null;
}

function mapAlignItems(value) {
    const map = {
        center: "items-center",
        "flex-start": "items-start",
        "flex-end": "items-end",
        stretch: "items-stretch",
        baseline: "items-baseline",
    };
    return map[value] || null;
}

function mapTextAlign(value) {
    const map = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
    };
    return map[value] || null;
}

function mapFontWeight(value) {
    const map = {
        "100": "font-thin",
        "200": "font-extralight",
        "300": "font-light",
        "400": "font-normal",
        "500": "font-medium",
        "600": "font-semibold",
        "700": "font-bold",
        "800": "font-extrabold",
        "900": "font-black",
        normal: "font-normal",
        bold: "font-bold",
    };
    return map[value] || null;
}

function mapPosition(value) {
    const map = {
        static: "static",
        relative: "relative",
        absolute: "absolute",
        fixed: "fixed",
        sticky: "sticky",
    };
    return map[value] || null;
}

function mapOverflow(value) {
    const map = {
        visible: "overflow-visible",
        hidden: "overflow-hidden",
        auto: "overflow-auto",
        scroll: "overflow-scroll",
    };
    return map[value] || null;
}

function mapObjectFit(value) {
    const map = {
        cover: "object-cover",
        contain: "object-contain",
        fill: "object-fill",
        none: "object-none",
        "scale-down": "object-scale-down",
    };
    return map[value] || null;
}

function mapFlexWrap(value) {
    const map = {
        wrap: "flex-wrap",
        nowrap: "flex-nowrap",
        "wrap-reverse": "flex-wrap-reverse",
    };
    return map[value] || null;
}

function mapTextDecoration(value) {
    const map = {
        none: "no-underline",
        underline: "underline",
        "line-through": "line-through",
    };
    return map[value] || null;
}

function isZero(value) {
    return value === "0" || value === "0px" || value === "0rem" || value === "0em";
}

function mapLengthUtility(prefix, value) {
    if (isZero(value)) return `${prefix}-0`;
    if (value === "100%") return `${prefix}-full`;
    if (value === "auto") return `${prefix}-auto`;
    return `${prefix}-[${normalizeArbitraryValue(value)}]`;
}

function mapColorUtility(prefix, value) {
    return `${prefix}-[${normalizeArbitraryValue(value)}]`;
}

function mapDeclarationToUtilities(property, value) {
    const prop = property.trim().toLowerCase();
    const val = value.trim();
    const tokens = [];

    switch (prop) {
        case "display": {
            const token = mapDisplay(val);
            if (token) tokens.push(token);
            else tokens.push(toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "flex-direction": {
            const map = { row: "flex-row", column: "flex-col", "row-reverse": "flex-row-reverse", "column-reverse": "flex-col-reverse" };
            tokens.push(map[val] || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "justify-content": {
            tokens.push(mapJustifyContent(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "align-items": {
            tokens.push(mapAlignItems(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "align-self": {
            const map = { auto: "self-auto", center: "self-center", "flex-start": "self-start", "flex-end": "self-end", stretch: "self-stretch" };
            tokens.push(map[val] || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "text-align": {
            tokens.push(mapTextAlign(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "font-size": {
            tokens.push(`text-[${normalizeArbitraryValue(val)}]`);
            return tokens;
        }
        case "line-height": {
            tokens.push(`leading-[${normalizeArbitraryValue(val)}]`);
            return tokens;
        }
        case "font-weight": {
            tokens.push(mapFontWeight(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "color": {
            tokens.push(mapColorUtility("text", val));
            return tokens;
        }
        case "background-color": {
            tokens.push(mapColorUtility("bg", val));
            return tokens;
        }
        case "border-color": {
            tokens.push(mapColorUtility("border", val));
            return tokens;
        }
        case "border-width": {
            tokens.push(mapLengthUtility("border", val));
            return tokens;
        }
        case "border-style": {
            const map = { solid: "border-solid", dashed: "border-dashed", dotted: "border-dotted", none: "border-none" };
            tokens.push(map[val] || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "border-top-width": {
            tokens.push(mapLengthUtility("border-t", val));
            return tokens;
        }
        case "border-bottom-width": {
            tokens.push(mapLengthUtility("border-b", val));
            return tokens;
        }
        case "border-left-width": {
            tokens.push(mapLengthUtility("border-l", val));
            return tokens;
        }
        case "border-right-width": {
            tokens.push(mapLengthUtility("border-r", val));
            return tokens;
        }
        case "border-radius": {
            tokens.push(mapLengthUtility("rounded", val));
            return tokens;
        }
        case "margin": {
            tokens.push(mapLengthUtility("m", val));
            return tokens;
        }
        case "margin-top": {
            tokens.push(mapLengthUtility("mt", val));
            return tokens;
        }
        case "margin-bottom": {
            tokens.push(mapLengthUtility("mb", val));
            return tokens;
        }
        case "margin-left": {
            tokens.push(mapLengthUtility("ml", val));
            return tokens;
        }
        case "margin-right": {
            tokens.push(mapLengthUtility("mr", val));
            return tokens;
        }
        case "padding": {
            tokens.push(mapLengthUtility("p", val));
            return tokens;
        }
        case "padding-top": {
            tokens.push(mapLengthUtility("pt", val));
            return tokens;
        }
        case "padding-bottom": {
            tokens.push(mapLengthUtility("pb", val));
            return tokens;
        }
        case "padding-left": {
            tokens.push(mapLengthUtility("pl", val));
            return tokens;
        }
        case "padding-right": {
            tokens.push(mapLengthUtility("pr", val));
            return tokens;
        }
        case "width": {
            tokens.push(mapLengthUtility("w", val));
            return tokens;
        }
        case "height": {
            tokens.push(mapLengthUtility("h", val));
            return tokens;
        }
        case "max-width": {
            tokens.push(mapLengthUtility("max-w", val));
            return tokens;
        }
        case "min-width": {
            tokens.push(mapLengthUtility("min-w", val));
            return tokens;
        }
        case "max-height": {
            tokens.push(mapLengthUtility("max-h", val));
            return tokens;
        }
        case "min-height": {
            tokens.push(mapLengthUtility("min-h", val));
            return tokens;
        }
        case "position": {
            tokens.push(mapPosition(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "top": {
            tokens.push(mapLengthUtility("top", val));
            return tokens;
        }
        case "bottom": {
            tokens.push(mapLengthUtility("bottom", val));
            return tokens;
        }
        case "left": {
            tokens.push(mapLengthUtility("left", val));
            return tokens;
        }
        case "right": {
            tokens.push(mapLengthUtility("right", val));
            return tokens;
        }
        case "z-index": {
            tokens.push(`z-[${normalizeArbitraryValue(val)}]`);
            return tokens;
        }
        case "overflow": {
            tokens.push(mapOverflow(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "object-fit": {
            tokens.push(mapObjectFit(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "-o-object-fit": {
            return tokens;
        }
        case "flex-wrap": {
            tokens.push(mapFlexWrap(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "list-style-type": {
            if (val === "none") tokens.push("list-none");
            else tokens.push(toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "text-decoration": {
            tokens.push(mapTextDecoration(val) || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "grid-column-gap":
        case "column-gap": {
            tokens.push(mapLengthUtility("gap-x", val));
            return tokens;
        }
        case "grid-row-gap":
        case "row-gap": {
            tokens.push(mapLengthUtility("gap-y", val));
            return tokens;
        }
        case "gap": {
            tokens.push(mapLengthUtility("gap", val));
            return tokens;
        }
        case "box-shadow": {
            tokens.push(`shadow-[${normalizeArbitraryValue(val)}]`);
            return tokens;
        }
        case "cursor": {
            const map = { pointer: "cursor-pointer", default: "cursor-default", "not-allowed": "cursor-not-allowed" };
            tokens.push(map[val] || toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        case "transition":
        case "transition-property":
        case "transition-duration":
        case "transition-timing-function":
        case "transform":
        case "transform-style":
        case "grid-template-columns":
        case "grid-template-rows":
        case "flex":
        case "white-space": {
            tokens.push(toArbitraryPropertyToken(prop, val));
            return tokens;
        }
        default: {
            tokens.push(toArbitraryPropertyToken(prop, val));
            return tokens;
        }
    }
}

function parseMediaVariantPrefix(atruleParams) {
    const maxMatch = atruleParams.match(/max-width:\s*(\d+)px/);
    if (maxMatch) return `max-[${maxMatch[1]}px]:`;
    const minMatch = atruleParams.match(/min-width:\s*(\d+)px/);
    if (minMatch) return `min-[${minMatch[1]}px]:`;
    return null;
}

function buildVariantPrefixes(rule, selector) {
    const prefixes = [];

    const mediaPrefixes = [];
    let current = rule.parent;
    while (current) {
        if (current.type === "atrule" && current.name === "media") {
            const mediaPrefix = parseMediaVariantPrefix(current.params || "");
            if (mediaPrefix) mediaPrefixes.push(mediaPrefix);
        }
        current = current.parent;
    }
    mediaPrefixes.reverse();
    prefixes.push(...mediaPrefixes);

    if (/:hover\b/.test(selector)) prefixes.push("hover:");

    return prefixes;
}

function selectorContainsClass(selector, className) {
    const regex = new RegExp(`\\.${escapeRegex(className)}(?![A-Za-z0-9_-])`);
    return regex.test(selector);
}

async function collectReplaceClasses() {
    const content = await fs.readFile(path.join(ROOT, REPLACE_FILE), "utf8");
    const parsed = JSON.parse(content);
    return parsed.map((item) => String(item.className || "")).filter(Boolean);
}

async function collectRulesPerClass(classNames) {
    const mapping = new Map();
    for (const className of classNames) mapping.set(className, []);

    for (const cssFile of WEBFLOW_CSS_FILES) {
        const cssContent = await fs.readFile(path.join(ROOT, cssFile), "utf8");
        const root = postcss.parse(cssContent);

        root.walkRules((rule) => {
            const selectors = rule.selectors || [];
            if (selectors.length === 0) return;

            for (const selector of selectors) {
                for (const className of classNames) {
                    if (!selectorContainsClass(selector, className)) continue;
                    mapping.get(className).push({ rule, selector });
                }
            }
        });
    }

    return mapping;
}

function buildTailwindMapping(rulesPerClass) {
    const output = {};

    for (const [className, entries] of rulesPerClass.entries()) {
        const tokens = [];
        const seen = new Set();

        for (const entry of entries) {
            const { rule, selector } = entry;
            const prefixes = buildVariantPrefixes(rule, selector);
            for (const node of rule.nodes || []) {
                if (node.type !== "decl") continue;
                const declTokens = mapDeclarationToUtilities(node.prop, node.value);
                for (const declToken of declTokens) {
                    const token = tokenWithVariants(declToken, prefixes);
                    if (!token || seen.has(token)) continue;
                    seen.add(token);
                    tokens.push(token);
                }
            }
        }

        output[className] = tokens;
    }

    return output;
}

async function walkFiles(baseDir) {
    const files = [];
    async function walk(currentDir) {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith(".")) continue;
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

function replaceClassTokens(content, className, replacement) {
    const regex = new RegExp(`(^|[\\s"'\\\`{(])${escapeRegex(className)}(?=($|[\\s"'\\\`}):,]))`, "g");
    return content.replace(regex, `$1${replacement}`);
}

async function applyMappingToCode(mapping) {
    const files = [];
    for (const root of SCAN_ROOTS) {
        const absoluteRoot = path.join(ROOT, root);
        try {
            const stats = await fs.stat(absoluteRoot);
            if (!stats.isDirectory()) continue;
        } catch {
            continue;
        }
        files.push(...(await walkFiles(absoluteRoot)));
    }

    const sortedClasses = Object.keys(mapping).sort((a, b) => b.length - a.length);
    const changeSummary = [];

    for (const relativePath of files) {
        const ext = path.extname(relativePath);
        if (!CODE_EXTENSIONS.has(ext)) continue;

        const absolutePath = path.join(ROOT, relativePath);
        let original = await fs.readFile(absolutePath, "utf8");
        let next = original;
        let replacementCount = 0;

        for (const className of sortedClasses) {
            const tokens = mapping[className] || [];
            if (tokens.length === 0) continue;
            const replacement = tokens.join(" ");
            const before = next;
            next = replaceClassTokens(next, className, replacement);
            if (next !== before) {
                const escaped = escapeRegex(className);
                const countRegex = new RegExp(`(^|[\\s"'\\\`{(])${escaped}(?=($|[\\s"'\\\`}):,]))`, "g");
                const matches = before.match(countRegex);
                replacementCount += matches ? matches.length : 0;
            }
        }

        if (next !== original) {
            await fs.writeFile(absolutePath, next, "utf8");
            changeSummary.push({ file: relativePath, replacementCount });
        }
    }

    return changeSummary;
}

async function main() {
    const replaceClasses = await collectReplaceClasses();
    const rulesPerClass = await collectRulesPerClass(replaceClasses);
    const mapping = buildTailwindMapping(rulesPerClass);

    await fs.writeFile(path.join(ROOT, OUTPUT_MAPPING_FILE), `${JSON.stringify(mapping, null, 2)}\n`, "utf8");

    const changeSummary = await applyMappingToCode(mapping);

    const summary = {
        appliedAt: new Date().toISOString(),
        replaceClasses: replaceClasses.length,
        filesChanged: changeSummary.length,
        replacementsTotal: changeSummary.reduce((acc, item) => acc + item.replacementCount, 0),
        sampleChangedFiles: changeSummary.slice(0, 30),
        mappingFile: OUTPUT_MAPPING_FILE,
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
});
