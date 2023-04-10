import { ADVENTUREID } from "@/lib/constantes";
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
            name: "validation",
            title: "Validation",
            type: "reference",
            to: [{ type: "validation" }],
        }),
        defineField({
            name: "label",
            title: "Libellé",
            type: "string",
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
            name: "modifiers",
            title: "Modificateurs libres",
            type: "array",
            of: [
                {
                    type: "modifier",
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
            return {
                title: label && code ? label + "(" + code + ")" : label ? label : name && code ? name + "(" + code + ")" : name,
                subtitle: aventure,
                media: image,
            };
        },
    },
});
