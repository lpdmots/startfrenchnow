import { defineField, defineType } from "sanity";

export default defineType({
    name: "fideExam",
    title: "FIDE Exam",
    type: "document",
    fields: [
        defineField({
            name: "description",
            title: "Description",
            type: "string",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
        }),
        defineField({
            name: "image",
            title: "Main image",
            type: "image",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: "competence",
            title: "Competence",
            type: "string",
            options: {
                list: ["Parler", "Comprendre", "Lire & Écrire"],
                layout: "dropdown",
            },
        }),
        defineField({
            name: "isPreview",
            title: "En preview ?",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "levels",
            title: "Levels",
            type: "array",
            of: [
                {
                    type: "string",
                    options: {
                        list: ["A1", "A2", "B1", "A1+", "A2+", "all"],
                    },
                },
            ],
        }),
        defineField({
            name: "tracks",
            title: "Tracks",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "title", type: "string", title: "Titre" },
                        { name: "src", type: "string", title: "MP3" },
                        { name: "text", type: "text", title: "Texte" },
                    ],
                },
            ],
        }),
        defineField({
            name: "responses",
            title: "Responses",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "image", type: "image", title: "Image" },
                        { name: "isCorrect", type: "boolean", title: "Is Correct?" },
                    ],
                },
            ],
        }),
        defineField({
            name: "responsesB1",
            title: "Responses B1",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "modelAnswer", type: "string", title: "Réponse type" },
                        { name: "correctIf", type: "string", title: "Réponse juste si" },
                        { name: "partialIf", type: "string", title: "Réponse approximative si" },
                        { name: "incorrectIf", type: "string", title: "Réponse fausse si" },
                    ],
                },
            ],
        }),
        defineField({
            name: "pdf",
            title: "PDF",
            type: "string",
            description: 'Lien vers le PDF de des examens de type "Lire & Écrire"',
        }),
    ],

    preview: {
        select: {
            title: "title",
            description: "description",
            levels: "levels",
            media: "image",
        },
        prepare({ title, levels, media, description }) {
            return {
                title: `${levels.join(", ")} - ${title}`,
                media,
                subtitle: description,
            };
        },
    },
});
