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
                list: ["addition", "replace", "multiplication", "access", "step"],
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
            description:
                "Si besoin de variable, le préciser avec les prefixes evalStr ou evalInt, puis ajouter le nom des variables ${name}. Exemple: 'evalStr ${name} ${lastname}' ou encore 'evalInt ${age} + 30'",
        }),
        defineField({
            name: "code",
            title: "Code",
            type: "string",
            initialValue: "1",
        }),
        defineField({
            name: "information",
            title: "Information",
            type: "string",
        }),
    ],
});
