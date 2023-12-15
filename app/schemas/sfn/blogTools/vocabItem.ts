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
            title: "Thèmes liés",
            name: "relatedThemes",
            type: "array",
            of: [{ type: "reference", to: [{ type: "theme" }] }],
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
            title: "Note en français",
            name: "noteFr",
            type: "blockContent",
        }),
        defineField({
            title: "Note en anglais",
            name: "noteEn",
            type: "blockContent",
        }),
        defineField({
            title: "Exemple",
            name: "example",
            type: "string",
        }),
        defineField({
            title: "Son de l'exemple",
            name: "soundExample",
            type: "string",
        }),
        defineField({
            title: "Nature",
            name: "nature",
            type: "string",
            options: {
                list: [
                    { title: "Nom masculin", value: "nounM" },
                    { title: "Nom féminin", value: "nounF" },
                    { title: "Verbe", value: "verb" },
                    { title: "Adjectif", value: "adjective" },
                    { title: "Adverbe", value: "adverb" },
                    { title: "Pronom", value: "pronoun" },
                    { title: "Préposition", value: "preposition" },
                    { title: "Conjonction", value: "conjunction" },
                    { title: "Interjection", value: "interjection" },
                    { title: "Article", value: "article" },
                    { title: "Expression", value: "expression" },
                    { title: "Autre", value: "other" },
                ],
            },
        }),
        defineField({
            title: "Tags",
            name: "tags",
            type: "array",
            of: [{ type: "string" }],
        }),
        defineField({
            title: "Status du mots",
            name: "status",
            type: "string",
            options: {
                list: [
                    { title: "Principal (détaillé dans l'article)", value: "primary" },
                    { title: "Secondaire (uniquement dans le tableau)", value: "secondary" },
                    { title: "Traduction uniquement", value: "translationOnly" },
                ],
            },
            initialValue: "primary",
        }),
        defineField({
            title: "Image pour l'article",
            name: "image",
            type: "image",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            title: "Data pour les exercices",
            name: "exerciseData",
            type: "object",
            fields: [
                defineField({
                    title: "Choisis la bonne orthographe",
                    name: "chooseCorrectSpelling",
                    type: "array",
                    of: [{ type: "string" }],
                }),
                defineField({
                    title: "Devinette",
                    name: "riddle",
                    type: "string",
                }),
                defineField({
                    title: "Résponses valides dans les inputs",
                    name: "inputAnswers",
                    type: "array",
                    of: [{ type: "string" }],
                }),
            ],
        }),
    ],
});
