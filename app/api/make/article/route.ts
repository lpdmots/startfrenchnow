import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServer";
import { createSlug } from "@/app/lib/utils";
import { Category } from "@/app/types/sfn/blog";
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { HEADINGSPANCOLORS, HIGHLIGHTCOLORS } from "@/app/lib/constantes";
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

        const categories = makeCategories.map((category: any) => CATEGORIES[category as CATEGORIESKeys]) as Category[];
        const slug = { _type: "slug", current: createSlug(postData.title) };
        const link = NEXTAUTH_URL + "/blog/post/" + slug.current;

        // Téléchargement des images
        const { mainImage, imagesIds } = await loadImagesToSanity(images, slug.current);

        // Convertir le corps en blocs
        const blocksBody = htmlToBlocks(body, blockContentType, {
            parseHtml: (html) => new JSDOM(html).window.document,
            rules: getRules(imagesIds, categories[0]),
        });
        const blocksBody_en = htmlToBlocks(body_en, blockContentType, {
            parseHtml: (html) => new JSDOM(html).window.document,
            rules: getRules(imagesIds, categories[0]),
        });

        const externLinks = JSON.parse(liens_externes)?.map((link: any) => ({ ...link, _key: uuidv4() }));

        // Créer le post
        const createdPost = await client.create({
            ...postData,
            slug,
            _type: "post",
            body: blocksBody,
            body_en: blocksBody_en,
            categories,
            mainImage,
            langage: "both",
            externLinks,
            internLink: lien_interne,
        });
        return NextResponse.json({ createdPost, link }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

async function loadImagesToSanity(images: string[], slug: string): Promise<{ mainImage: any; imagesIds: string[] }> {
    const imagesIds: string[] = [];
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
/* async function loadImagesToSanity(images: string[], slug: string) {
    const imagesIds = [];
    for (let index = 0; index < images.length; index++) {
        const image = images[index];
        const imageResponse = await fetch(image);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        // Chargez l'image sur Sanity
        const uploadedImage = await client.assets.upload("image", imageBuffer, {
            title: slug + "-" + index,
        });
        imagesIds.push(uploadedImage._id);
    }

    // Créez une référence à l'image chargée pour l'attribut mainImage de votre post
    const mainImage = {
        _type: "image",
        asset: {
            _type: "reference",
            _ref: imagesIds[0],
        },
    };

    return { mainImage, imagesIds };
} */

const getRules = (imagesIds: string[], category: keyof typeof HEADINGSPANCOLORS) => {
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
                if ((el as HTMLElement).tagName?.toLowerCase() === "exemple") {
                    let text = "";
                    el.childNodes.forEach((node: any) => {
                        text += node.textContent;
                    });
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: [
                            {
                                _key: uuidv4(),
                                _type: "span",
                                marks: [],
                                text,
                            },
                        ],
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
                    let text = "";
                    el.childNodes.forEach((node: any) => {
                        text += node.textContent;
                    });
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: [
                            {
                                _key: uuidv4(),
                                _type: "span",
                                marks: [],
                                text,
                            },
                        ],
                        markDefs: [],
                        style: "funfact",
                    });
                }
                return undefined;
            },
        },
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "translation") {
                    let text = "";
                    el.childNodes.forEach((node: any) => {
                        text += node.textContent;
                    });
                    const translation: string | null = (el as HTMLElement).getAttribute("english");

                    return {
                        _key: uuidv4(),
                        _type: "span",
                        marks: ["translation"],
                        text,
                        value: { translation },
                    };
                }
                return undefined;
            },
        },
        {
            deserialize(el: any, next: any, block: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() === "help") {
                    let text = "";
                    el.childNodes.forEach((node: any) => {
                        text += node.textContent;
                    });
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: [
                            {
                                _key: uuidv4(),
                                _type: "span",
                                marks: [],
                                text,
                            },
                        ],
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
                    let text = "";
                    el.childNodes.forEach((node: any) => {
                        text += node.textContent;
                    });
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: [
                            {
                                _key: uuidv4(),
                                _type: "span",
                                marks: [],
                                text,
                            },
                        ],
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
                    let text = "";
                    el.childNodes.forEach((node: any) => {
                        text += node.textContent;
                    });
                    return block({
                        _key: uuidv4(),
                        _type: "block",
                        children: [
                            {
                                _key: uuidv4(),
                                _type: "span",
                                marks: [],
                                text,
                            },
                        ],
                        markDefs: [],
                        style: "extract",
                    });
                }
                return undefined;
            },
        },
    ] as any;
};
