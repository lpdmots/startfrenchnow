import { defineField, defineType } from "sanity";

export default defineType({
    name: "modifier",
    title: "Modificateur",
    type: "object",
    fields: [
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
        defineField({
            name: "references",
            title: "Références",
            type: "array",
            of: [
                {
                    type: "string",
                },
            ],
        }),
        defineField({
            name: "operator",
            title: "Opérateur",
            type: "string",
            options: {
                list: ["addition", "replace", "multiplication", "access", "step", "addObject", "deleteObject"],
            },
        }),
        defineField({
            name: "access",
            title: "Access",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "element" }, { type: "choice" }, { type: "extract" }, { type: "effect" }],
                },
            ],
        }),
        defineField({
            name: "arguments",
            title: "Arguments",
            type: "string",
        }),
        defineField({
            name: "code",
            title: "Code",
            type: "string",
            initialValue: "1",
        }),
    ],
});
