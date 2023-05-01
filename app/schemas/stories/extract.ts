import { ADVENTUREID } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "extract",
    title: "Extrait",
    type: "document",
    fields: [
        defineField({
            name: "adventure",
            title: "Aventure",
            type: "reference",
            to: [{ type: "adventure" }],
            initialValue: { _ref: ADVENTUREID },
        }),
        defineField({
            name: "validation",
            title: "Validation",
            type: "reference",
            to: [{ type: "validation" }],
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: "imageInheritance",
            title: "Héritage d'image",
            type: "reference",
            to: [{ type: "element" }],
        }),
        defineField({
            name: "content",
            title: "Contenu",
            type: "storyContent",
        }),
        defineField({
            name: "textOnly",
            title: "Text only",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "code",
            title: "Code",
            type: "string",
            initialValue: "1",
        }),
        defineField({
            name: "antagonistes",
            title: "Antagonistes",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "extract" }],
                },
            ],
        }),
        defineField({
            name: "timer",
            title: "Minuteur",
            type: "object",
            fields: [
                defineField({
                    name: "duration",
                    title: "Durée",
                    type: "number",
                }),
                defineField({
                    name: "defaultChoice",
                    title: "Choix par défaut",
                    type: "reference",
                    to: [{ type: "choice" }],
                }),
            ],
        }),
        defineField({
            name: "title",
            title: "Titre",
            type: "string",
        }),
    ],
    preview: {
        select: {
            content: "content",
            adventure: "adventure.name",
            title: "title",
            code: "code",
            image: "image.asset",
        },
        prepare(selection) {
            const { title, content, adventure, code, image } = selection;
            return {
                title: title
                    ? title
                    : content?.[0].children[0].text.length > 50
                    ? content?.[0].children[0].text.slice(0, 50)
                    : content?.[0].children[0].text.length > 0
                    ? content?.[0].children[0].text
                    : "Sans titre",
                subtitle: code ? code + ", " + adventure : adventure,
                media: image,
            };
        },
    },
});
