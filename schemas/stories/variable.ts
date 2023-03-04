import { defineField, defineType } from "sanity";

export default defineType({
    name: "variable",
    title: "Variable",
    type: "document",
    fields: [
        // name, keyName, initialValue, valueType, minimum, maximum, effects, display
        defineField({
            name: "name",
            title: "Nom de la variable",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "keyName",
            title: "Nom de la variable (clé)",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "initialValue",
            title: "Valeur initiale",
            type: "string",
        }),
        defineField({
            name: "valueType",
            title: "Type de valeur",
            type: "array",
            of: [
                {
                    type: "string",
                    options: {
                        list: ["number", "string", "boolean"],
                    },
                },
            ],
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "minimum",
            title: "Valeur minimale",
            type: "number",
        }),
        defineField({
            name: "maximum",
            title: "Valeur maximale",
            type: "number",
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
            name: "display",
            title: "Affichage",
            type: "object",
            fields: [
                // icon, order, description, placement
                {
                    name: "name",
                    title: "Nom de l'affichage",
                    type: "string",
                },
                {
                    name: "icon",
                    title: "Icône",
                    type: "image",
                },
                {
                    name: "order",
                    title: "Ordre",
                    type: "number",
                    description: "Ordre d'affichage dans la liste des variables",
                },
                {
                    name: "description",
                    title: "Description",
                    type: "text",
                },
                {
                    name: "placement",
                    title: "Emplacement",
                    type: "string",
                    options: {
                        list: ["primary", "secondary"],
                    },
                },
            ],
        }),
    ],
});
