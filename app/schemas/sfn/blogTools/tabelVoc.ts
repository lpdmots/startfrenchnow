import { defineField, defineType } from "sanity";

export default defineType({
    name: "tabelVoc",
    title: "Tableau de vocabulaire",
    type: "object",
    fields: [
        defineField({
            title: "Couleur",
            name: "color",
            type: "string",
            options: {
                list: [
                    { value: "yellow", title: "Jaune" },
                    { value: "blue", title: "Bleu" },
                    { value: "red", title: "Rouge" },
                    { value: "purple", title: "Violet" },
                    { value: "green", title: "Vert" },
                ],
            },
            initialValue: "blue",
            description: "La couleur de fond de l'en-tête.",
        }),
        defineField({
            title: "Vocabulaire",
            name: "vocabulary",
            type: "reference",
            to: [{ type: "vocabulary" }],
        }),
    ],
});
