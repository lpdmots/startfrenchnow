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
        defineField({
            name: "duration",
            title: "Durée",
            type: "string",
            description: "Durée de l'élément. Ex: 5 -> 5 minutes, 5,8,10 --> 5, 8 ou 10 minutes (aleatoire), 5/10 --> entre 5 et 10 minutes (aleatoire)",
        }),
        defineField({
            name: "disableNotValid",
            title: "Disable si non accessible",
            type: "boolean",
            description: "Si le choix n'est pas accessible et qu'il n'y a pas d'antagoniste, il est apparant mais disabled.",
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
