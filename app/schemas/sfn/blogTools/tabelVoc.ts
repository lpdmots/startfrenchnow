import { defineField, defineType } from "sanity";

export default defineType({
    name: "tabelVoc",
    title: "Tableau de vocabulaire",
    type: "object",
    fields: [
        defineField({
            title: "Format article",
            name: "isArticle",
            type: "boolean",
            initialValue: false,
        }),
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
            title: "Filtre",
            name: "filters",
            type: "object",
            fields: [
                defineField({
                    title: "Status",
                    name: "status",
                    type: "string",
                    options: {
                        list: [
                            { title: "Tous", value: "all" },
                            { title: "Primaire", value: "primary" },
                            { title: "Secondaire", value: "secondary" },
                        ],
                    },
                    initialValue: "primary",
                }),
                defineField({
                    title: "Nature",
                    name: "nature",
                    type: "string",
                    options: {
                        list: [
                            { title: "Tous", value: "all" },
                            { title: "Les mots uniquement", value: "words" },
                            { title: "Les expressions uniquement", value: "expressions" },
                        ],
                    },
                    initialValue: "all",
                }),
                defineField({
                    title: "Tags",
                    name: "tags",
                    type: "array",
                    of: [{ type: "string" }],
                }),
            ],
        }),
        defineField({
            title: "Thèmes",
            name: "themes",
            type: "array",
            of: [{ type: "reference", to: [{ type: "theme" }] }],
        }),
        defineField({
            title: "Seulement la colonne FR",
            name: "isOnlyFrench",
            type: "boolean",
            initialValue: false,
        }),
    ],
});
