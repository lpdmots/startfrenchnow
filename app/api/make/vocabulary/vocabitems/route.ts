import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerProd";
import { createSlug, getPossibleAnswers } from "@/app/lib/utils";
import { Theme, VocabItem, VocabItemNew } from "@/app/types/sfn/blog";
import vocabItemToSpeech from "@/app/lib/vocabItemToSpeech";
import { htmlToBlocks } from "@sanity/block-tools";
import { getRules } from "../../article/route";
import { JSDOM } from "jsdom";
import { Schema } from "@sanity/schema";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

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
        const { name, image, levels, courses, category, children: childrenIdsStr, vocabulary, tags } = await request.json();

        // creation du thème:
        const theme = await createTheme(name, image, levels, category, childrenIdsStr, tags);

        // creation des vocabItems:
        const vocabItemsRefs = await getVocabItemsRefs(vocabulary, theme);

        // ajout des vocabItems au thème:
        await client.patch(theme._id).set({ vocabItems: vocabItemsRefs }).commit();

        return NextResponse.json({ themeId: theme._id }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

const createTheme = async (name: string, imageUrl: string, levels: string, category: string, childrenIdsStr: string, tags: string) => {
    // check if theme exists
    const themeExists = await client.fetch(`*[_type == "theme" && name == "${name}"]`);
    if (themeExists.length > 0) return themeExists[0] as unknown as Theme;

    // Tags to object with key
    const tagsObj = JSON.parse(tags).map((tag: any) => ({ ...tag, _key: tag.name }));

    // Téléchargement de l'images
    const image = await loadImagesToSanity(imageUrl, name);
    const children = childrenIdsStr?.split(",").map((id) => ({ _type: "reference", _ref: id.trim(), _key: id.trim() }));

    const data = {
        _type: "theme",
        name,
        image,
        category,
        level: levels?.split(",").map((level: string) => level.trim())[0],
        children,
        tags: tagsObj,
    };
    const theme = await client.create(data);

    return theme as unknown as Theme;
};

async function loadImagesToSanity(image: string, name: string): Promise<{ _type: string; asset: { _type: "reference"; _ref: string } }> {
    const imageResponse = await fetch(image);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const slug = createSlug(name);

    // Redimensionner l'image avec Sharp
    const resizedImageBuffer = await sharp(Buffer.from(arrayBuffer))
        .resize(750, null, {
            // 750px de large, hauteur ajustée pour garder le ratio
            withoutEnlargement: true, // Empêche l'agrandissement si l'image est plus petite que 750px
        })
        .toBuffer();

    // Chargez l'image redimensionnée sur Sanity
    const uploadedImage = await client.assets.upload("image", resizedImageBuffer, {
        title: `${slug}-main-image`,
    });

    // Créez une référence à l'image chargée
    return {
        _type: "image",
        asset: {
            _type: "reference",
            _ref: uploadedImage._id,
        },
    };
}

const getVocabItemsRefs = async (vocabulary: string, theme: Theme) => {
    const vocabItems: VocabItemNew[] = JSON.parse(vocabulary);
    const refs = [];

    for (let vocabItem of vocabItems) {
        const { instruction } = vocabItem;

        if (instruction === "new") {
            refs.push(await createVocabItem(vocabItem, theme));
        } else if (instruction) {
            const vocabItemExists = await client.fetch(`*[_type == "vocabItem" && _id == "${instruction}"]`);
            if (vocabItemExists.length > 0) {
                refs.push({ _type: "reference", _ref: vocabItemExists[0]._id, _key: vocabItemExists[0]._id });
                await updateRelatedThemes(vocabItemExists, theme);
            }
        } else {
            const possibleNames = getPossibleAnswers(vocabItem);
            const vocabItemExists = await client.fetch(`*[_type == "vocabItem" && french in ["${possibleNames.join('","')}"]]`);
            if (vocabItemExists.length > 0) {
                refs.push({ _type: "reference", _ref: vocabItemExists[0]._id, _key: vocabItemExists[0]._id });
                await updateRelatedThemes(vocabItemExists, theme);
            } else refs.push(await createVocabItem(vocabItem, theme));
        }
    }
    return refs;
};

const updateRelatedThemes = async (vocabItemExists: VocabItem[], theme: Theme) => {
    const relatedThemes = vocabItemExists[0].relatedThemes;
    if (!relatedThemes.find((theme: any) => theme._ref === theme._id)) {
        relatedThemes.push({ _type: "reference", _ref: theme._id, _key: theme._id });
        await client.patch(vocabItemExists[0]._id).set({ relatedThemes }).commit();
    }
};

const createVocabItem = async (vocabItem: VocabItem, theme: Theme) => {
    const { soundFr, soundEn, soundExample } = await vocabItemToSpeech(vocabItem, theme);
    const { noteFr: noteFrHtml, noteEn: noteEnHtml } = vocabItem;

    const noteFr = htmlToBlocks((noteFrHtml || "") as unknown as string, blockContentType, {
        parseHtml: (html) => new JSDOM(html).window.document,
        rules: getRules([]),
    });
    const noteEn = htmlToBlocks((noteEnHtml || "") as unknown as string, blockContentType, {
        parseHtml: (html) => new JSDOM(html).window.document,
        rules: getRules([]),
    });

    const data = {
        ...vocabItem,
        relatedThemes: [{ _type: "reference", _ref: theme._id, _key: theme._id }],
        soundFr,
        soundEn,
        soundExample,
        noteFr,
        noteEn,
        status: vocabItem.status || "primary",
        _type: "vocabItem",
    };
    const vocabItemCreated = await client.create(data);
    return { _type: "reference", _ref: vocabItemCreated._id, _key: vocabItemCreated._id };
};
