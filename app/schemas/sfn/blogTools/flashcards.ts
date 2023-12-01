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
            title: "Thèmes",
            name: "themes",
            type: "array",
            of: [{ type: "reference", to: [{ type: "theme" }] }],
        }),
    ],
});
