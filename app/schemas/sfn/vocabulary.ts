import { defineField, defineType } from "sanity";

export default defineType({
    name: "vocabulary",
    title: "Vocabulaire",
    type: "document",
    fields: [
        defineField({
            title: "Thème",
            name: "theme",
            type: "string",
        }),
        defineField({
            title: "Lignes",
            name: "lines",
            type: "array",
            of: [
                {
                    title: "Line",
                    type: "object",
                    fields: [
                        {
                            title: "Français",
                            name: "french",
                            type: "string",
                        },
                        {
                            title: "Anglais",
                            name: "english",
                            type: "string",
                        },
                        {
                            title: "Son",
                            name: "sound",
                            type: "string",
                        },
                        {
                            title: "Note",
                            name: "note",
                            type: "string",
                        },
                    ],
                },
            ],
        }),
    ],
});
