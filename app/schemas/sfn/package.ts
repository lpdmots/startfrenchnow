// /schemas/package.ts
import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
    name: "productPackage",
    title: "Package",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Titre (FR)",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "title_en",
            title: "Titre (EN)",
            type: "string",
        }),
        defineField({
            name: "referenceKey",
            title: "Clé de référence",
            type: "string",
        }),
        defineField({
            name: "modules",
            title: "Modules",
            type: "array",
            of: [
                defineArrayMember({
                    name: "module",
                    title: "Module",
                    type: "object",
                    fields: [
                        defineField({
                            name: "title",
                            title: "Titre du module (FR)",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "title_en",
                            title: "Titre du module (EN)",
                            type: "string",
                        }),
                        defineField({
                            name: "subtitle",
                            title: "Sous-titre (FR)",
                            type: "string",
                        }),
                        defineField({
                            name: "subtitle_en",
                            title: "Sous-titre (EN)",
                            type: "string",
                        }),
                        defineField({
                            name: "level",
                            title: "Niveau",
                            type: "array",
                            of: [{ type: "string", options: { list: ["a1", "a2", "b1", "b2", "c1", "c2"] } }],
                        }),
                        defineField({
                            name: "posts",
                            title: "Leçons (Posts)",
                            description: "Référence les posts (blog/leçons). L’ordre de cette liste définit l’ordre dans le sommaire.",
                            type: "array",
                            of: [
                                defineArrayMember({
                                    type: "reference",
                                    to: [{ type: "post" }],
                                }),
                            ],
                            validation: (Rule) => Rule.min(1),
                        }),
                    ],
                    preview: {
                        select: {
                            title: "title",
                            subtitle: "subtitle",
                            levels: "levels",
                            posts: "posts", // on récupère directement le tableau
                        },
                        prepare({ title, subtitle, levels, posts }) {
                            const count = Array.isArray(posts) ? posts.length : 0;
                            const lv = Array.isArray(levels) && levels.length ? ` • ${levels.join(", ")}` : "";
                            const sub = subtitle ? ` — ${subtitle}` : "";
                            return {
                                title: title || "Module",
                                subtitle: `${count} leçon(s)${lv}${sub}`,
                            };
                        },
                    },
                }),
            ],
            validation: (Rule) => Rule.min(1),
        }),
    ],
    preview: {
        select: {
            title: "title",
            modules: "modules", // on récupère le tableau entier
        },
        prepare({ title, modules }) {
            const count = Array.isArray(modules) ? modules.length : 0;
            return {
                title: title || "Package",
                subtitle: `${count} module(s)`,
            };
        },
    },
});
