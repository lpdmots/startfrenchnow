import { ADVENTUREID } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "choice",
    title: "Choix",
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
            name: "element",
            title: "Élément",
            type: "reference",
            to: [{ type: "element" }],
        }),
        defineField({
            name: "nature",
            title: "Nature de l'élément",
            type: "string",
            description: "À préciser si aucun élément n'est lié.",
            options: {
                list: [
                    { title: "Interaction", value: "interaction" },
                    { title: "Accès", value: "access" },
                ],
            },
        }),
        defineField({
            name: "validation",
            title: "Validation",
            type: "reference",
            to: [{ type: "validation" }],
        }),
        defineField({
            name: "label",
            title: "Libellé",
            type: "storyContent",
        }),
        defineField({
            name: "antagonistes",
            title: "Antagonistes",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "choice" }],
                },
            ],
        }),
        defineField({
            name: "effects",
            title: "Effets libres",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "effect" }],
                },
            ],
        }),
        defineField({
            name: "extracts",
            title: "Extraits libres",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "extract" }],
                },
            ],
        }),
    ],
    preview: {
        select: {
            label: "label",
            name: "element.name",
            aventure: "adventure.name",
            code: "code",
            image: "element.image.asset",
        },
        prepare(selection) {
            const { label, name, aventure, code, image } = selection;
            console.log({ label });
            return {
                title: label && code ? label[0].children[0].text + "(" + code + ")" : label ? label[0].children[0].text : name && code ? name + "(" + code + ")" : name,
                subtitle: aventure,
                media: image,
            };
        },
    },
});
