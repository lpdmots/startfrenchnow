import { defineField, defineType } from "sanity";

export default defineType({
    name: "tabelVoc",
    title: "Tableau de vocabulaire",
    type: "object",
    fields: [
        defineField({
            title: "Catégorie",
            name: "category",
            type: "string",
            options: {
                list: [
                    { title: "Conseil", value: "tips" },
                    { title: "Grammaire", value: "grammar" },
                    { title: "Vocabulaire", value: "vocabulary" },
                    { title: "Culture", value: "culture" },
                    { title: "Expressions", value: "expressions" },
                    { title: "Orthographe", value: "orthography" },
                ],
            },
            initialValue: "Conseil",
            description: "Utilisé pour les couleurs",
        }),
        defineField({
            title: "Thèmes",
            name: "themes",
            type: "array",
            of: [{ type: "reference", to: [{ type: "theme" }] }],
        }),
    ],
});
