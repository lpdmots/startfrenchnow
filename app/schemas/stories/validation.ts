import { ADVENTUREID } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "validation",
    title: "Validation",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Nom",
            type: "string",
        }),
        defineField({
            name: "adventure",
            title: "Aventure",
            type: "reference",
            to: [{ type: "adventure" }],
            initialValue: { _ref: ADVENTUREID },
        }),
        defineField({
            name: "initialAccess",
            title: "Accès initial",
            type: "boolean",
            initialValue: true,
        }),
        defineField({
            name: "maxCount",
            title: "Compte maximum",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "conditions",
            title: "Conditions",
            type: "array",
            of: [
                {
                    type: "condition",
                },
            ],
        }),
        defineField({
            name: "operator",
            title: "Opérateur",
            type: "string",
            options: {
                list: [
                    { title: "ET", value: "and" },
                    { title: "OU", value: "or" },
                ],
            },
            initialValue: "and",
        }),
    ],
    preview: {
        select: {
            title: "name",
        },
    },
});
