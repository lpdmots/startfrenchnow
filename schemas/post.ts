import { defineField, defineType } from "sanity";

export default defineType({
    name: "post",
    title: "Post",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "description",
            description: "Enter a short snippet for the blog...",
            title: "Description",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "level",
            title: "Niveau",
            type: "string",
            options: {
                list: [
                    { value: "a1", title: "A1" },
                    { value: "a2", title: "A2" },
                    { value: "b1", title: "B1" },
                    { value: "b2", title: "B2" },
                ],
            },
            initialValue: "a1",
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "title",
                maxLength: 96,
            },
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "mainImage",
            title: "Main image",
            type: "image",
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.required().warning("Une image est requise"),
        }),
        defineField({
            name: "mainVideo",
            title: "Main vidéo",
            type: "videoBlog",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: "categories",
            title: "Categories",
            type: "array",
            of: [{ type: "reference", to: { type: "category" } }],
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "publishedAt",
            title: "Published at",
            type: "datetime",
            initialValue: new Date().toISOString(),
        }),
        defineField({
            name: "body",
            title: "Body",
            type: "blockContent",
        }),
    ],

    preview: {
        select: {
            title: "title",
            author: "author.name",
            media: "mainImage",
        },
        prepare(selection) {
            const { author } = selection;
            return { ...selection, subtitle: author && `by ${author}` };
        },
    },
});
