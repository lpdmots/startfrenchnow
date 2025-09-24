import { CATEGORIES } from "@/app/lib/constantes";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
    name: "post",
    title: "Post",
    type: "document",
    fields: [
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
            type: "array",
            of: [{ type: "string", options: { list: ["a1", "a2", "b1", "b2", "c1", "c2"] } }],
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
            name: "categories",
            title: "Catégories",
            type: "array",
            of: [{ type: "string", options: { list: CATEGORIES } }],
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
            name: "help",
            title: "Help",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "isReady",
            title: "Prêt",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "internLink",
            title: "Lien interne",
            type: "string",
        }),
        defineField({
            name: "externLinks",
            title: "Liens externes",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "url", type: "string" },
                        { name: "title", type: "string" },
                    ],
                },
            ],
        }),
        defineField({
            name: "isPreview",
            title: "Preview libre (Pack)",
            type: "boolean",
            initialValue: false,
            description: "Si vrai ET que ce post est dans la catégorie pack_fide, la vidéo est accessible à tous.",
        }),
        defineField({
            name: "durationSec",
            title: "Durée (sec)",
            type: "number",
            description: "Durée de la vidéo en secondes.",
        }),
        defineField({
            name: "resources",
            title: "Ressources",
            type: "array",
            of: [
                defineArrayMember({
                    type: "object",
                    name: "resource",
                    fields: [
                        defineField({
                            name: "title",
                            title: "Titre",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "key",
                            title: "Clé de stockage (S3/CloudFront)",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                            description: "Ex: docs/a1/fiche-01.pdf",
                        }),
                    ],
                    preview: {
                        select: { title: "title", key: "key" },
                        prepare: ({ title, key }) => ({ title, subtitle: key }),
                    },
                }),
            ],
        }),
    ],

    preview: {
        select: {
            title: "title",
            media: "mainImage",
        },
        prepare(selection) {
            return { ...selection };
        },
    },
});
