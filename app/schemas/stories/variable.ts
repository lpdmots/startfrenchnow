import { ADVENTUREID } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "variable",
    title: "Variable",
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
            title: "Nom de la variable",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "nature",
            title: "Nature de la variable",
            type: "string",
            options: {
                list: ["static", "skill", "object", "dynamic"],
            },
        }),
        defineField({
            name: "defaultValue",
            title: "Valeur par défaut",
            type: "string",
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
        {
            name: "onMountEffects",
            title: "Effets à la création",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "effect" }],
                },
            ],
        },
        defineField({
            name: "unMountEffects",
            title: "Effets à la suppression",
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
                {
                    name: "name",
                    title: "Nom de l'affichage",
                    type: "string",
                },
                {
                    name: "image",
                    title: "Image",
                    type: "image",
                },
                {
                    name: "order",
                    title: "Ordre",
                    type: "number",
                    description: "Ordre d'affichage",
                },
                {
                    name: "description",
                    title: "Description",
                    type: "text",
                },
                {
                    name: "conditions",
                    title: "Conditions d'affichage",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            fields: [
                                //nature, component, reference, arguments, operateur, order
                                {
                                    name: "nature",
                                    title: "Nature de la condition",
                                    type: "string",
                                    options: {
                                        list: ["variable", "roll", "hero", "count", "step"],
                                    },
                                },
                                {
                                    name: "component",
                                    title: "Composant",
                                    type: "reference",
                                    to: [{ type: "variable" }, { type: "element" }],
                                },
                                {
                                    name: "reference",
                                    title: "Référence",
                                    type: "string",
                                },
                                {
                                    name: "arguments",
                                    title: "Arguments",
                                    type: "string",
                                },
                                {
                                    name: "operator",
                                    title: "Opérateur",
                                    type: "string",
                                    options: {
                                        list: ["==", "!=", ">", "<", ">=", "<="],
                                    },
                                },
                                {
                                    name: "order",
                                    title: "Ordre",
                                    type: "number",
                                },
                            ],
                        },
                    ],
                },
            ],
        }),
    ],
    preview: {
        select: {
            name: "name",
            adventure: "adventure",
            nature: "nature",
            image: "display.image.asset",
        },
        prepare(selection) {
            const { name, nature, adventure, image } = selection;
            return {
                title: nature + ": " + name,
                subtitle: adventure.length + " aventure(s)",
                media: image,
            };
        },
    },
});
