import { defineField, defineType } from "sanity";

export default defineType({
    name: "vocabItem",
    title: "Élément de vocabulaire",
    type: "document",
    fields: [
        defineField({
            title: "Français",
            name: "french",
            type: "string",
        }),
        defineField({
            title: "Anglais",
            name: "english",
            type: "string",
        }),
        defineField({
            title: "Son en français",
            name: "soundFr",
            type: "string",
        }),
        defineField({
            title: "Son en anglais",
            name: "soundEn",
            type: "string",
        }),
        defineField({
            title: "Note",
            name: "note",
            type: "string",
        }),
        defineField({
            title: "Exemple",
            name: "example",
            type: "string",
        }),
        defineField({
            title: "Nature",
            name: "nature",
            type: "string",
        }),
        defineField({
            title: "Traduction uniquement",
            name: "translationOnly",
            type: "boolean",
        }),
        defineField({
            title: "Data pour les exercices",
            name: "exerciseData",
            type: "string",
        }),
    ],
});
