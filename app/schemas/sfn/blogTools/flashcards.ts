import { defineField, defineType } from "sanity";

export default defineType({
    name: "flashcards",
    title: "Flashcards",
    type: "object",
    fields: [
        defineField({
            name: "title",
            title: "Titre en français",
            type: "string",
        }),
        defineField({
            name: "title_en",
            title: "Titre en anglais",
            type: "string",
        }),
        defineField({
            name: "instruction",
            title: "Instruction en français",
            type: "blockContent",
        }),
        defineField({
            name: "instruction_en",
            title: "Instruction en anglais",
            type: "blockContent",
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
    ],
});
