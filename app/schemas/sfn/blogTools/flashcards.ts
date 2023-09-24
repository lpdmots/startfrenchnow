import { defineField, defineType } from "sanity";

export default defineType({
    name: "flashcards",
    title: "Flashcards",
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
            title: "Vocabulaire",
            name: "vocabulary",
            type: "reference",
            to: [{ type: "vocabulary" }],
        }),
    ],
});
