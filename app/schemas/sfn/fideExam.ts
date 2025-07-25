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
            name: "level",
            title: "Level",
            type: "string",
            options: {
                list: ["A1", "A2", "B1"],
                layout: "dropdown",
            },
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
            type: "object",
            fields: [
                {
                    name: "response1",
                    title: "Réponse type 1",
                    type: "string",
                },
                {
                    name: "response2",
                    title: "Réponse type 2",
                    type: "string",
                },
                {
                    name: "response3",
                    title: "Réponse type 3",
                    type: "string",
                },
            ],
        }),
    ],

    preview: {
        select: {
            title: "title",
            description: "description",
            level: "level",
            media: "image",
        },
        prepare({ title, level, media, description }) {
            return {
                title: `${level} - ${title}`,
                media,
                subtitle: description,
            };
        },
    },
});
