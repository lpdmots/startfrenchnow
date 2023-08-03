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
            name: "duration",
            title: "Durée",
            type: "string",
            description: "Durée de l'élément. Ex: 5 -> 5 minutes, 5,8,10 --> 5, 8 ou 10 minutes (aleatoire), 5/10 --> entre 5 et 10 minutes (aleatoire)",
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
        defineField({
            name: "reviews",
            title: "Reviews",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        // title, order, color, scores, success
                        defineField({
                            name: "title",
                            title: "Titre",
                            type: "string",
                        }),
                        defineField({
                            name: "order",
                            title: "Ordre",
                            type: "number",
                        }),
                        defineField({
                            name: "color",
                            title: "Couleur",
                            type: "string",
                            options: {
                                list: [
                                    //primary, secondary-1, secondary-2, secondary-3, secondary-4, secondary-5,
                                    { title: "Primaire", value: "primary" },
                                    { title: "Secondaire 1", value: "secondary-1" },
                                    { title: "Secondaire 2", value: "secondary-2" },
                                    { title: "Secondaire 3", value: "secondary-3" },
                                    { title: "Secondaire 4", value: "secondary-4" },
                                    { title: "Secondaire 5", value: "secondary-5" },
                                ],
                            },
                            initialValue: "secondary-2",
                        }),
                        defineField({
                            name: "scores",
                            title: "Scores",
                            type: "array",
                            of: [
                                {
                                    type: "object",
                                    fields: [
                                        // variable (reference), title, text (storyContent), min, max, order
                                        defineField({
                                            name: "variable",
                                            title: "Variable",
                                            type: "reference",
                                            to: [{ type: "variable" }],
                                        }),
                                        defineField({
                                            name: "reference",
                                            title: "Référence",
                                            type: "string",
                                        }),
                                        defineField({
                                            name: "title",
                                            title: "Titre",
                                            type: "string",
                                        }),
                                        defineField({
                                            name: "text",
                                            title: "Texte",
                                            type: "storyContent",
                                        }),
                                        defineField({
                                            name: "min",
                                            title: "Minimum",
                                            type: "number",
                                        }),
                                        defineField({
                                            name: "max",
                                            title: "Maximum",
                                            type: "number",
                                        }),
                                        defineField({
                                            name: "order",
                                            title: "Ordre",
                                            type: "number",
                                        }),
                                        defineField({
                                            name: "color",
                                            title: "Couleur",
                                            type: "string",
                                            options: {
                                                list: [
                                                    //primary, secondary-1, secondary-2, secondary-3, secondary-4, secondary-5,
                                                    { title: "Primaire", value: "primary" },
                                                    { title: "Secondaire 1", value: "secondary-1" },
                                                    { title: "Secondaire 2", value: "secondary-2" },
                                                    { title: "Secondaire 3", value: "secondary-3" },
                                                    { title: "Secondaire 4", value: "secondary-4" },
                                                    { title: "Secondaire 5", value: "secondary-5" },
                                                ],
                                            },
                                        }),
                                    ],
                                },
                            ],
                        }),
                        defineField({
                            name: "success",
                            title: "Succès",
                            type: "array",
                            of: [
                                {
                                    type: "reference",
                                    to: [{ type: "success" }],
                                },
                            ],
                        }),
                        defineField({
                            name: "filter",
                            title: "Filtre",
                            type: "string",
                            options: {
                                list: [
                                    //primary, secondary-1, secondary-2, secondary-3, secondary-4, secondary-5,
                                    { title: "Filtre, tous par défaut", value: "filterAll" },
                                    { title: "Filtre, déverrouillés par défaut", value: "filterUnlocked" },
                                    { title: "Pas de filtre, tout afficher", value: "noFilterAll" },
                                    { title: "Pas de filtre, déverrouillés seulement", value: "noFilterUnlocked" },
                                ],
                            },
                            initialValue: "filterAll",
                        }),
                        defineField({
                            name: "orderOption",
                            title: "Option d'ordre",
                            type: "string",
                            options: {
                                list: [
                                    { title: "Suivre l'ordre", value: "keepOrder" },
                                    { title: "Déverrouillés en premier", value: "unlockedFirst" },
                                    { title: "Verrouillés en premier", value: "lockedFirst" },
                                ],
                            },
                            initialValue: "unlockedFirst",
                        }),
                    ],
                },
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
