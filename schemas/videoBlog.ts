import { defineField, defineType } from "sanity";

export default defineType({
    name: "videoBlog",
    title: "Vidéo blog",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Titre",
            type: "string",
        }),
        defineField({
            name: "s3Key",
            title: "s3Key",
            type: "string",
        }),
    ],
});
