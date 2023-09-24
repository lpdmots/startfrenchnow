import { CATEGORIES } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "exerciseTheme",
    title: "Thème d'exercice",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Nom",
            type: "string",
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
        }),
        defineField({
            name: "categories",
            title: "Catégories",
            type: "array",
            of: [{ type: "string", options: { list: CATEGORIES } }],
        }),
        defineField({
            name: "level",
            title: "Niveau",
            type: "string",
            options: {
                list: ["none", "a1", "a2", "b1", "b2"],
            },
        }),
        defineField({
            name: "children",
            title: "Thèmes enfants",
            type: "array",
            of: [{ type: "reference", to: [{ type: "exerciseTheme" }] }],
        }),
        defineField({
            name: "questions",
            title: "Questions",
            type: "array",
            of: [{ type: "simpleQuestion" }],
        }),
    ],
});
