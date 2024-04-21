import { NextRequest, NextResponse } from "next/server";
import { Block } from "@/app/types/sfn/blog";
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { JSDOM } from "jsdom";
import { v4 as uuidv4 } from "uuid";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

const defaultSchema = Schema.compile({
    name: "myStorySchema",
    types: [
        {
            type: "object",
            name: "storyContent",
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

const blockContentType = defaultSchema.get("storyContent").fields.find((field: any) => field.name === "body").type;

export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const newElement = await request.json();
        console.log(newElement);
        const { name, label: labelHTML } = newElement;
        const label = getBlocks(labelHTML);
        const patchObject = label ? { name, label } : { name };
        await client.patch(newElement._id).set(patchObject).commit();
        const { extracts, choices } = getAllExtractsAndChoices(newElement);
        console.log(extracts, choices);

        // Update all extracts
        for (const extract of extracts) {
            const { _id, content } = extract;
            await client.patch(_id).set({ content: content }).commit();
        }

        // Update all choices
        for (const choice of choices) {
            const { _id, label } = choice;
            const patchObject = label ? { label } : undefined;
            patchObject && (await client.patch(_id).set(patchObject).commit());
        }

        return NextResponse.json({ message: "Mis à jour avec succès." }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

const getBlocks = (htmlString: string): Block[] | undefined => {
    let html = htmlString?.trim();
    if (!html) return undefined;
    if (!html.startsWith("<")) {
        html = `<p>${html}</p>`;
    }
    const blocks = htmlToBlocks(html, blockContentType, {
        parseHtml: (html) => new JSDOM(html).window.document,
        rules: getRules(),
    });
    return blocks as Block[];
};

interface ExtractWithBlock {
    _id: string;
    content: Block[];
}

const getAllExtractsAndChoices = (element: any) => {
    console.log(element.extracts, element.choices);
    const extracts: ExtractWithBlock[] = (element.extracts || []).map((extract: any) => ({ _id: extract._id, content: getBlocks(extract.content) }));
    const choices = (element.choices || []).map((choice: any) => {
        extracts.push(...(choice.extracts || []).map((extract: any) => ({ _id: extract._id, content: getBlocks(extract.content) })));
        return { _id: choice._id, label: choice.label ? getBlocks(choice.label) : undefined };
    });

    return { extracts, choices };
};

const getRules = () => {
    return [
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
            deserialize(el: any, next: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() !== "trad") return undefined;

                const label: string | null = next(el.childNodes);
                const translation: string = (el as HTMLElement).getAttribute("translation") || getTextFromEl(el);

                return {
                    _type: "__annotation",
                    markDef: {
                        _type: "translation",
                        _key: uuidv4(),
                        translation,
                    },
                    children: label,
                };
            },
        },
        {
            deserialize(el: any, next: any) {
                if ((el as HTMLElement).tagName?.toLowerCase() !== "gender") return undefined;

                const label: string | null = next(el.childNodes);
                const female: Block[] | undefined = getBlocks((el as HTMLElement).getAttribute("female") || getTextFromEl(el));

                return {
                    _type: "__annotation",
                    markDef: {
                        _type: "gender",
                        _key: uuidv4(),
                        female,
                    },
                    children: label,
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
