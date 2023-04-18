import { ADVENTUREID } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "element",
    title: "Élément",
    type: "document",
    fields: [
        defineField({
            name: "adventure",
            title: "Aventure",
            type: "reference",
            to: [{ type: "adventure" }],
            initialValue: { _ref: ADVENTUREID },
        }),
        defineField({
            name: "code",
            title: "Code de l'élément",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "validation",
            title: "Validation",
            type: "reference",
            to: [{ type: "validation" }],
        }),
        defineField({
            name: "name",
            title: "Nom de l'élément",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "label",
            title: "Libellé",
            type: "storyContent",
        }),
        defineField({
            name: "nature",
            title: "Nature de l'élément",
            type: "string",
            options: {
                list: [
                    { title: "Interaction", value: "interaction" },
                    { title: "Accès", value: "access" },
                ],
            },
            initialValue: "interaction",
        }),
        defineField({
            name: "rolls",
            title: "Jets de dés",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "attribute",
                            title: "Attribut",
                            type: "string",
                        }),
                        defineField({
                            name: "difficulty",
                            title: "Difficulté",
                            type: "number",
                        }),
                        defineField({
                            name: "reference",
                            title: "Référence",
                            type: "string",
                        }),
                        defineField({
                            name: "variables",
                            title: "Variables",
                            type: "array",
                            of: [
                                {
                                    type: "reference",
                                    to: [{ type: "variable" }],
                                },
                            ],
                        }),
                    ],
                },
            ],
        }),
        defineField({
            name: "extracts",
            title: "Extraits",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "extract" }],
                },
            ],
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: "effects",
            title: "Effets",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "effect" }],
                },
            ],
        }),
        defineField({
            name: "choices",
            title: "Choix",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "choice" }],
                },
            ],
        }),
        defineField({
            name: "antagonistes",
            title: "Antagonistes",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "element" }],
                },
            ],
        }),
        defineField({
            name: "effectOptions",
            title: "Options d'effets",
            type: "object",
            fields: [
                defineField({
                    name: "limit",
                    title: "Nombre maximum d'effets",
                    type: "number",
                }),
                defineField({
                    name: "pickRule",
                    title: "Règle de sélection",
                    type: "string",
                    options: {
                        list: [
                            { title: "Aléatoire", value: "random" },
                            { title: "Depuis le début", value: "start" },
                            { title: "Depuis la fin", value: "end" },
                        ],
                    },
                }),
                defineField({
                    name: "distribution",
                    title: "Distribution",
                    type: "array",
                    of: [
                        {
                            type: "number",
                        },
                    ],
                }),
            ],
        }),
        defineField({
            name: "choiceOptions",
            title: "Options de choix",
            type: "object",
            fields: [
                // interaction, access, inherit
                defineField({
                    name: "interaction",
                    title: "Interaction",
                    type: "boolean",
                    initialValue: false,
                }),
                defineField({
                    name: "access",
                    title: "Accès",
                    type: "boolean",
                    initialValue: false,
                }),
                defineField({
                    name: "inherit",
                    title: "Héritage",
                    type: "reference",
                    to: [{ type: "element" }],
                }),
            ],
        }),
    ],
    preview: {
        select: {
            adventure: "adventure.name",
            name: "name",
            code: "code",
            image: "image.asset",
        },
        prepare(selection) {
            const { name, adventure, code, image } = selection;
            return {
                title: code + ": " + name,
                subtitle: adventure,
                media: image,
            };
        },
    },
});
