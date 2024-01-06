import { defineField, defineType } from "sanity";

export default defineType({
    name: "theme",
    title: "Theme",
    type: "document",
    fields: [
        defineField({
            title: "Nom",
            name: "name",
            type: "string",
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
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
            initialValue: "vocabulary",
            description: "Utilisé pour les couleurs",
        }),
        defineField({
            name: "level",
            title: "Niveau",
            type: "string",
            options: {
                list: ["none", "a1", "a2", "b1", "b2"],
            },
        }),
        defineField({
            name: "children",
            title: "Thèmes enfants",
            type: "array",
            of: [{ type: "reference", to: [{ type: "theme" }] }],
        }),
        defineField({
            title: "Élément de vocabulaire",
            name: "vocabItems",
            type: "array",
            of: [{ type: "reference", to: [{ type: "vocabItem" }] }],
        }),
        defineField({
            name: "questions",
            title: "Questions",
            type: "array",
            of: [{ type: "question" }],
        }),
        defineField({
            name: "tags",
            title: "Tags",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "name", type: "array", of: [{ type: "string" }] },
                        { name: "french", type: "string" },
                        { name: "english", type: "string" },
                    ],
                },
            ],
        }),
    ],
});
