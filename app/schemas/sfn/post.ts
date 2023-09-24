import { defineField, defineType } from "sanity";

export default defineType({
    name: "post",
    title: "Post",
    type: "document",
    fields: [
        defineField({
            name: "langage",
            title: "Langue",
            type: "string",
            options: {
                list: [
                    { value: "en", title: "Anglais" },
                    { value: "fr", title: "Français" },
                    { value: "both", title: "Les deux" },
                ],
            },
            initialValue: "both",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
        }),
        defineField({
            name: "title_en",
            title: "Title ENGLISH",
            type: "string",
        }),
        defineField({
            name: "description",
            description: "Enter a short snippet for the blog...",
            title: "Description",
            type: "string",
        }),
        defineField({
            name: "description_en",
            description: "Enter a short snippet for the blog...",
            title: "Description ENGLISH",
            type: "string",
        }),
        defineField({
            name: "metaDescription",
            title: "Meta-description",
            type: "string",
        }),
        defineField({
            name: "metaDescription_en",
            title: "Meta-description ENGLISH",
            type: "string",
        }),
        defineField({
            name: "level",
            title: "Niveau",
            type: "string",
            options: {
                list: [
                    { value: "none", title: "Aucun" },
                    { value: "a1", title: "A1" },
                    { value: "a2", title: "A2" },
                    { value: "b1", title: "B1" },
                    { value: "b2", title: "B2" },
                ],
            },
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
            name: "categorie",
            title: "Catégorie",
            type: "string",
            options: {
                list: [
                    { value: "tip", title: "Conseil" },
                    { value: "grammar", title: "Grammaire" },
                    { value: "vocabulary", title: "Vocabulaire" },
                    { value: "culture", title: "Culture" },
                    { value: "expression", title: "Expression" },
                ],
            },
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
        defineField({
            name: "body_en",
            title: "Body ENGLISH",
            type: "blockContent",
        }),
        defineField({
            name: "translation",
            title: "Translation",
            type: "boolean",
            initialValue: true,
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
