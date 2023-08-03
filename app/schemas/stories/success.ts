import { ADVENTUREID } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "success",
    title: "Succès",
    type: "document",
    fields: [
        // image, title, text, order, color, validations
        defineField({
            name: "adventure",
            title: "Aventure",
            type: "reference",
            to: [{ type: "adventure" }],
            initialValue: { _ref: ADVENTUREID },
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
        }),
        defineField({
            name: "title",
            title: "Titre",
            type: "string",
        }),
        defineField({
            name: "text",
            title: "Texte",
            type: "storyContent",
        }),
        defineField({
            name: "order",
            title: "Ordre",
            type: "number",
        }),
        defineField({
            name: "alignment",
            title: "Alignement",
            type: "string",
            options: {
                list: [
                    { title: "Très mauvais", value: "veryBad" },
                    { title: "Mauvais", value: "bad" },
                    { title: "Neutre", value: "neutral" },
                    { title: "Bon", value: "good" },
                    { title: "Très bon", value: "veryGood" },
                ],
            },
            initialValue: "neutral",
        }),
        defineField({
            name: "validation",
            title: "Validation",
            type: "reference",
            to: [{ type: "validation" }],
        }),
        defineField({
            name: "antagonistes",
            title: "Antagonistes",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "success" }],
                },
            ],
        }),
        defineField({
            name: "showLocked",
            title: "Afficher si verrouillé",
            type: "boolean",
            initialValue: true,
        }),
        defineField({
            name: "antagDisplayIfValid",
            title: "Afficher les antagonistes même si validé",
            type: "boolean",
            initialValue: true,
        }),
    ],
});
