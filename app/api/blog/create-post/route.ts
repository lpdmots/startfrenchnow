// app/api/blog/create-post/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerProd";
import { createSlug } from "@/app/lib/utils";
import { htmlToBlocks } from "@sanity/block-tools";
import Schema from "@sanity/schema";
import { JSDOM } from "jsdom";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";


export const runtime = "nodejs";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

const BLOGCATEGORIES = ["tips", "vocabulary", "grammar", "culture", "expressions", "fide"] as const;
const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;

type BlogCategory = (typeof BLOGCATEGORIES)[number];
type Level = (typeof LEVELS)[number];

type IncomingSlug = { current?: string; _type?: string } | string | undefined;

type CreatePostPayload = {
    title: string;
    title_en?: string;

    slug?: IncomingSlug;

    description?: string;
    description_en?: string;

    metaDescription?: string;
    metaDescription_en?: string;

    categories?: BlogCategory[];
    level?: Level[];

    body_HTML: string;
    body_en_HTML?: string;

    isReady?: boolean; // ignoré : forcé à false
};

const defaultSchema = Schema.compile({
    name: "myBlog",
    types: [
        {
            name: "link",
            title: "Link",
            type: "object",
            fields: [
                { name: "href", type: "url" },
                { name: "target", type: "boolean" },
                { name: "download", type: "boolean" },
                { name: "isSpan", type: "boolean" },
            ],
        },
        {
            name: "blockContent",
            title: "Block Content",
            type: "array",
            of: [
                {
                    type: "block",
                    styles: [
                        { title: "Normal", value: "normal" },
                        { title: "H2", value: "h2" },
                        { title: "H3", value: "h3" },
                        { title: "Quote", value: "blockquote" },
                        { title: "Exemple", value: "exemple" },
                        { title: "Lesson", value: "lesson" },
                        { title: "Extract", value: "extract" },
                        { title: "Fun fact", value: "funfact" },
                    ],
                    marks: {
                        decorators: [
                            { title: "Strong", value: "strong" },
                            { title: "Emphasis", value: "em" },
                            { title: "Underline", value: "underline" },
                            { title: "Highlight", value: "highlight" },
                        ],
                        annotations: [{ name: "link", type: "link" }],
                    },
                },
            ],
        },
        {
            type: "object",
            name: "blogPost",
            fields: [
                { title: "Title", type: "string", name: "title" },
                { title: "Body", name: "body", type: "blockContent" },
            ],
        },
    ],
});

const blockContentType = defaultSchema.get("blogPost").fields.find((field: any) => field.name === "body").type;

export async function POST(request: NextRequest) {
    if (!NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Server misconfigured (NEXTAUTH_SECRET missing)" }, { status: 500 });
    }

    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = (await request.json()) as CreatePostPayload;

        // ---- validations minimales ----
        if (!payload?.title?.trim()) throw new Error("Missing title");
        if (!payload?.body_HTML?.trim()) throw new Error("Missing body_HTML");

        const categories = normalizeCategories(payload.categories);
        const level = normalizeLevels(payload.level);

        // slug: supporte {current} OU {_type, current} OU string
        const slugCurrent = normalizeSlugCurrent(payload.slug, payload.title);

        (payload.slug, payload.title);
        const slug = { _type: "slug", current: slugCurrent };

        // Sécurité / propreté HTML (bloque les tags interdits)
        assertHTMLIsAllowed(payload.body_HTML);
        if (payload.body_en_HTML) assertHTMLIsAllowed(payload.body_en_HTML);

        // 1) Normalisation légère : <b> -> <strong>
        const bodyHTML_1 = normalizeHTML(payload.body_HTML);
        const bodyEnHTML_1 = payload.body_en_HTML ? normalizeHTML(payload.body_en_HTML) : "";

        // 2) Normalisation "portable text safe" : split des <p> autour des blocs <example>/<lesson>/...
        const bodyHTML = normalizePortableHtml(bodyHTML_1);
        const bodyEnHTML = bodyEnHTML_1 ? normalizePortableHtml(bodyEnHTML_1) : "";

        // ---- conversion HTML -> PortableText ----
        const blocksBody = htmlToBlocks(bodyHTML, blockContentType, {
            parseHtml: (html) => new JSDOM(html).window.document,
            rules: getRules(),
        });

        const blocksBodyEn = bodyEnHTML
            ? htmlToBlocks(bodyEnHTML, blockContentType, {
                  parseHtml: (html) => new JSDOM(html).window.document,
                  rules: getRules(),
              })
            : [];

        // ---- create post (minimal) ----
        const createdPost = await client.create({
            _type: "post",
            title: payload.title,
            title_en: payload.title_en || "",
            slug,
            publishedAt: new Date().toISOString(),

            description: payload.description || "",
            description_en: payload.description_en || "",

            metaDescription: payload.metaDescription || "",
            metaDescription_en: payload.metaDescription_en || "",

            categories,
            level,

            body: blocksBody,
            body_en: blocksBodyEn,

            isReady: false,
        });

        const link = NEXTAUTH_URL ? `${NEXTAUTH_URL}/blog/post/${slug.current}` : undefined;

        return NextResponse.json({ createdPost, link }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Bad request" }, { status: 400 });
    }
}

// -------------------- helpers --------------------

function normalizeCategories(input?: BlogCategory[]) {
    if (!input) return [];
    if (!Array.isArray(input)) throw new Error("categories must be an array");
    const invalid = input.filter((c) => !BLOGCATEGORIES.includes(c));
    if (invalid.length) throw new Error(`Invalid categories: ${invalid.join(", ")}`);
    // unique
    return [...new Set(input)];
}

function normalizeLevels(input?: Level[]) {
    if (!input) return [];
    if (!Array.isArray(input)) throw new Error("level must be an array");
    const invalid = input.filter((l) => !LEVELS.includes(l));
    if (invalid.length) throw new Error(`Invalid level: ${invalid.join(", ")}`);
    return [...new Set(input)];
}

function RzSlugCandidate(slug: IncomingSlug): string | undefined {
    if (!slug) return undefined;
    if (typeof slug === "string") return slug;
    if (typeof slug === "object" && typeof slug.current === "string") return slug.current;
    return undefined;
}

function RzSlugCurrent(slug: IncomingSlug, title: string): string {
    const candidate = (RzSlugCandidate(slug) || "").trim();
    const base = candidate || createSlug(title);

    // max 96 chars (comme ton schema)
    const trimmed = base.length > 96 ? base.slice(0, 96) : base;
    return trimmed.replace(/^-+|-+$/g, "");
}

function normalizeHTML(html: string): string {
    return html.replace(/<\s*b\s*>/gi, "<strong>").replace(/<\s*\/\s*b\s*>/gi, "</strong>");
}

function assertHTMLIsAllowed(html: string) {
    // interdits stricts
    const forbidden = [
        "ul",
        "ol",
        "li",
        "img",
        "figure",
        "script",
        "style",
        "iframe",
        "table",
        "thead",
        "tbody",
        "tr",
        "td",
        "th",
        "a", // on force <lien>
    ];

    for (const tag of forbidden) {
        const re = new RegExp(`<\\s*${tag}\\b`, "i");
        if (re.test(html)) throw new Error(`Forbidden tag detected: <${tag}>`);
    }
}

function getTextFromEl(el: any) {
    let text = "";
    el.childNodes.forEach((node: any) => {
        text += node.textContent;
    });
    return text;
}

const getRules = () => {
    return [
        // <highlight> => span avec mark "highlight"
        {
            deserialize(el: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "highlight") {
                    const text = getTextFromEl(el);
                    return {
                        _key: uuidv4(),
                        _type: "span",
                        marks: ["highlight"],
                        text,
                    };
                }
                return undefined;
            },
        },

        // <u> => underline
        {
            deserialize(el: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "u") {
                    const text = getTextFromEl(el);
                    return {
                        _key: uuidv4(),
                        _type: "span",
                        marks: ["underline"],
                        text,
                    };
                }
                return undefined;
            },
        },

        // <example> => block style "exemple"
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "example") {
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: next(el.childNodes),
                        markDefs: [],
                        style: "exemple",
                    });
                }
                return undefined;
            },
        },

        // <lesson> => block style "lesson"
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "lesson") {
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: next(el.childNodes),
                        markDefs: [],
                        style: "lesson",
                    });
                }
                return undefined;
            },
        },

        // <extract> => block style "extract"
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "extract") {
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: next(el.childNodes),
                        markDefs: [],
                        style: "extract",
                    });
                }
                return undefined;
            },
        },

        // <funfact> => block style "funfact"
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "funfact") {
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: next(el.childNodes),
                        markDefs: [],
                        style: "funfact",
                    });
                }
                return undefined;
            },
        },

        // <lien ...> => annotation link (markDef)
        {
            deserialize(el: any, next: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() !== "lien") return undefined;

                const children = next(el.childNodes);
                const href = (el as HTMLElement).getAttribute("href") || "https://www.startfrenchnow.com/";
                const target = "target" in (el as HTMLElement).attributes;
                const download = "download" in (el as HTMLElement).attributes;
                const isSpan = "span" in (el as HTMLElement).attributes;

                return {
                    _type: "__annotation",
                    markDef: {
                        _type: "link",
                        _key: uuidv4(),
                        href,
                        target,
                        download,
                        isSpan,
                    },
                    children,
                };
            },
        },
    ] as any;
};

function normalizeSlugCandidate(slug: IncomingSlug): string | undefined {
    if (!slug) return undefined;
    if (typeof slug === "string") return slug;
    if (typeof slug === "object" && typeof slug.current === "string") return slug.current;
    return undefined;
}

function normalizeSlugCurrent(slug: IncomingSlug, title: string): string {
    const candidate = (normalizeSlugCandidate(slug) || "").trim();
    const base = candidate || createSlug(title);

    // max 96 chars (comme ton schema Sanity)
    const trimmed = base.length > 96 ? base.slice(0, 96) : base;
    return trimmed.replace(/^-+|-+$/g, "");
}

const CUSTOM_BLOCK_TAGS = new Set(["example", "lesson", "funfact", "extract", "blockquote"]);

/**
 * Rend l'HTML "safe" pour htmlToBlocks :
 * - si <p> contient un tag bloc custom (example/lesson/...), on split le <p> en plusieurs <p> + le bloc au milieu
 * - si example/lesson/... contient des <p>, on les "flatten" en texte + <br />
 */
function normalizePortableHtml(html: string): string {
    const dom = new JSDOM(`<body>${html}</body>`);
    const document = dom.window.document;

    // 1) Split des <p> qui contiennent des custom blocks en children directs
    const paragraphs = Array.from(document.querySelectorAll("p"));
    for (const p of paragraphs) {
        const childNodes = Array.from(p.childNodes);

        const hasDirectCustomBlock = childNodes.some((n) => n.nodeType === 1 && CUSTOM_BLOCK_TAGS.has((n as Element).tagName.toLowerCase()));

        if (!hasDirectCustomBlock) continue;

        const parent = p.parentNode;
        if (!parent) continue;

        let buffer: Node[] = [];

        const flush = () => {
            if (!buffer.length) return;
            const newP = document.createElement("p");
            for (const n of buffer) newP.appendChild(n);
            buffer = [];

            // skip paragraphe vide / whitespace
            if (!newP.innerHTML.trim()) return;

            parent.insertBefore(newP, p);
        };

        for (const node of childNodes) {
            if (node.nodeType === 1 && CUSTOM_BLOCK_TAGS.has((node as Element).tagName.toLowerCase())) {
                flush();
                parent.insertBefore(node, p); // move node before original p
            } else {
                buffer.push(node);
            }
        }
        flush();
        parent.removeChild(p);
    }

    // 2) Flatten des <p> à l'intérieur des custom blocks (ex: <lesson><p>..</p></lesson>)
    const customBlocks = Array.from(document.querySelectorAll("example, lesson, funfact, extract, blockquote"));

    for (const blockEl of customBlocks) {
        // on ne traite que les <p> ENFANTS directs (pas les <p> plus profonds)
        const directPs = Array.from(blockEl.querySelectorAll(":scope > p"));
        if (!directPs.length) continue;

        directPs.forEach((pEl, idx) => {
            // move children of <p> into blockEl before pEl
            while (pEl.firstChild) blockEl.insertBefore(pEl.firstChild, pEl);
            // add <br /> between former paragraphs
            if (idx < directPs.length - 1) blockEl.insertBefore(document.createElement("br"), pEl);
            pEl.remove();
        });
    }

    return document.body.innerHTML;
}
