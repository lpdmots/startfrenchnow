import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerProd";
import { createSlug, getPossibleAnswers } from "@/app/lib/utils";
import { Category, VocabItem } from "@/app/types/sfn/blog";
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

type CATEGORIESKeys = keyof typeof CATEGORIES;

const CATEGORIES = {
    Conseils: "tips",
    Vidéo: "video",
    Grammaire: "grammar",
    Vocabulaire: "vocabulary",
    Culture: "culture",
    Expressions: "expressions",
    Orthographe: "orthography",
    Exercice: "exercise",
    Téléchargement: "toLoad",
    Fide: "fide",
};

const defaultSchema = Schema.compile({
    name: "myBlog",
    types: [
        {
            type: "object",
            name: "blogPost",
            fields: [
                {
                    title: "Title",
                    type: "string",
                    name: "title",
                },
                {
                    title: "Body",
                    name: "body",
                    type: "array",
                    of: [{ type: "block" }],
                },
            ],
        },
    ],
});

const blockContentType = defaultSchema.get("blogPost").fields.find((field: any) => field.name === "body").type;

export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const { categories: makeCategories, body, body_en, images, lien_interne, liens_externes, ...postData } = await request.json();

        const categories = makeCategories?.map((category: any) => CATEGORIES[category as CATEGORIESKeys]) as Category[];
        const slug = { _type: "slug", current: createSlug(postData.title) };
        const link = NEXTAUTH_URL + "/blog/post/" + slug.current;

        // Téléchargement des images
        const { mainImage, imagesIds } = await loadImagesToSanity(images, slug.current);

        // Convertir le corps en blocs
        const blocksBody = htmlToBlocks(body, blockContentType, {
            parseHtml: (html) => new JSDOM(html).window.document,
            rules: getRules(imagesIds),
        });
        const blocksBody_en = htmlToBlocks(body_en, blockContentType, {
            parseHtml: (html) => new JSDOM(html).window.document,
            rules: getRules(imagesIds),
        });

        const externLinks = JSON.parse(liens_externes)?.map((link: any) => ({ ...link, _key: uuidv4() }));

        // Créer le post
        const createdPost = await client.create({
            ...postData,
            slug,
            _type: "post",
            body: blocksBody,
            body_en: blocksBody_en,
            mainImage,
            externLinks,
            categories,
            internLink: lien_interne,
        });
        return NextResponse.json({ createdPost, link }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

async function loadImagesToSanity(images: string[], slug: string): Promise<{ mainImage: any; imagesIds: string[] }> {
    const imagesIds: string[] = [];
    if (!images?.length) return { mainImage: undefined, imagesIds };
    for (let index = 0; index < images.length; index++) {
        const image = images[index];
        const imageResponse = await fetch(image);
        const arrayBuffer = await imageResponse.arrayBuffer();

        // Redimensionner l'image avec Sharp
        const resizedImageBuffer = await sharp(Buffer.from(arrayBuffer))
            .resize(750, null, {
                // 750px de large, hauteur ajustée pour garder le ratio
                withoutEnlargement: true, // Empêche l'agrandissement si l'image est plus petite que 750px
            })
            .toBuffer();

        // Chargez l'image redimensionnée sur Sanity
        const uploadedImage = await client.assets.upload("image", resizedImageBuffer, {
            title: `${slug}-${index}`,
        });
        imagesIds.push(uploadedImage._id); // Assurez-vous que le type de uploadedImage._id correspond à votre attente
    }

    // Créez une référence à l'image chargée
    const mainImage = {
        _type: "image",
        asset: {
            _type: "reference",
            _ref: imagesIds[0],
        },
    };

    return { mainImage, imagesIds };
}

export const getRules = (imagesIds: string[]) => {
    return [
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() != "img") {
                    return undefined;
                }
                const index: string | null = (el as HTMLElement).getAttribute("index");

                return block({
                    _type: "image",
                    asset: {
                        _type: "reference",
                        _ref: imagesIds[parseInt(index || "0")], // Ajustez ceci en fonction de la manière dont les images sont référencées dans Sanity
                    },
                });
            },
        },
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() != "tabelvoc") {
                    return undefined;
                }
                const tag = (el as HTMLElement).getAttribute("tag");
                const category = (el as HTMLElement).getAttribute("category");
                const themeId = (el as HTMLElement).getAttribute("themeId");
                const isArticle = "isArticle" in el.attributes ? true : false;
                const isOnlyFrench = "isOnlyFrench" in el.attributes ? true : false;

                return block({
                    _type: "tabelVoc",
                    filters: {
                        status: "primary",
                        nature: "all",
                        tags: tag ? [tag] : undefined,
                    },
                    category: category || "vocabulary",
                    themes: [
                        {
                            _key: uuidv4(),
                            _type: "reference",
                            _ref: themeId,
                        },
                    ],
                    isArticle,
                    isOnlyFrench,
                });
            },
        },
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() != "flashcards") {
                    return undefined;
                }

                const tag = (el as HTMLElement).getAttribute("tag");
                const category = (el as HTMLElement).getAttribute("category");
                const themeId = (el as HTMLElement).getAttribute("themeId");

                return block({
                    _type: "flashcards",
                    filters: {
                        status: "primary",
                        nature: "all",
                        tags: tag ? [tag] : undefined,
                    },
                    category: category || "vocabulary",
                    themes: [
                        {
                            _key: uuidv4(),
                            _type: "reference",
                            _ref: themeId,
                        },
                    ],
                });
            },
        },
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() != "exercise") {
                    return undefined;
                }

                const exerciseId = (el as HTMLElement).getAttribute("exerciseId");

                return block({
                    _type: "exercise",
                    _ref: exerciseId,
                });
            },
        },
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "highlight") {
                    let text = "";
                    el.childNodes.forEach((node: any) => {
                        text += node.textContent;
                    });

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
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "u") {
                    let text = "";
                    el.childNodes.forEach((node: any) => {
                        text += node.textContent;
                    });

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
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "help") {
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: next(el.childNodes),
                        markDefs: [],
                        style: "help",
                    });
                }
                return undefined;
            },
        },
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
        {
            deserialize(el: any, next: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() !== "translation") return undefined;

                const label: string | null = next(el.childNodes);
                const french: string = (el as HTMLElement).getAttribute("french") || getTextFromEl(el);
                const english: string = (el as HTMLElement).getAttribute("english") || "";
                const id: string | null = (el as HTMLElement).getAttribute("id");

                if (!english && !id) return undefined;
                const reference = id ? { _type: "reference", _ref: id } : undefined;

                return {
                    _type: "__annotation",
                    markDef: {
                        _type: "translationPopover",
                        _key: uuidv4(),
                        french,
                        english,
                        vocabItemId: reference,
                    },
                    children: label,
                };
            },
        },
        {
            deserialize(el: any, next: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() !== "sound") return undefined;
                const label: string | null = next(el.childNodes);
                const vocabItemId: string = (el as HTMLElement).getAttribute("vocabitemid") || getTextFromEl(el);
                const phonetic: string = (el as HTMLElement).getAttribute("phonetic") || "";

                const reference = vocabItemId ? { _type: "reference", _ref: vocabItemId } : undefined;

                return {
                    _type: "__annotation",
                    markDef: {
                        _type: "sound",
                        _key: uuidv4(),
                        phonetic,
                        vocabItem: reference,
                    },
                    children: label,
                };
            },
        },
        {
            deserialize(el: any, next: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() !== "lien") return undefined;
                const children: string | null = next(el.childNodes);
                const href: string | null = (el as HTMLElement).getAttribute("href") || "https://www.startfrenchnow.com/";
                const target: boolean = "target" in el.attributes ? true : false;
                const download: boolean = "download" in el.attributes ? true : false;
                const isSpan: boolean = "span" in el.attributes ? true : false;

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

const getTextFromEl = (el: any) => {
    let text = "";
    el.childNodes.forEach((node: any) => {
        text += node.textContent;
    });
    return text;
};
