import { Reference } from "@/app/types/sfn/blog";
import { Base } from "@/app/types/stories/adventure";
import { Validation } from "@/app/types/stories/effect";
import { ADVENTUREID } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "effect",
    title: "Effet",
    type: "document",
    fields: [
        defineField({
            name: "adventure",
            title: "Aventure",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "adventure" }],
                },
            ],
            initialValue: [{ _ref: ADVENTUREID }],
        }),
        defineField({
            name: "name",
            title: "Nom de l'effet",
            type: "string",
        }),
        defineField({
            name: "validation",
            title: "Validation",
            type: "reference",
            to: [{ type: "validation" }],
        }),
        defineField({
            name: "modifiers",
            title: "Modificateurs",
            type: "array",
            of: [
                {
                    type: "modifier",
                },
            ],
        }),
        defineField({
            name: "modifierOptions",
            title: "Options des modificateurs",
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
            name: "antagonistes",
            title: "Antagonistes",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "effect" }],
                },
            ],
        }),
        defineField({
            name: "code",
            title: "Code",
            type: "string",
            initialValue: "1",
        }),
        defineField({
            name: "priority",
            title: "Prioritaire",
            type: "boolean",
            description: "Si coché, l'effet sera prioritaire et traité avant les extraits libres ou éléments",
        }),
        defineField({
            name: "duration",
            title: "Durée",
            type: "string",
            description: "Durée de l'élément. Ex: 5 -> 5 minutes, 5,8,10 --> 5, 8 ou 10 minutes (aleatoire), 5/10 --> entre 5 et 10 minutes (aleatoire)",
        }),
    ],
});
