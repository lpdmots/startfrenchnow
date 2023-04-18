import { defineField, defineType } from "sanity";

export default defineType({
    name: "condition",
    title: "Condition",
    type: "object",
    fields: [
        //nature, component, reference, arguments, operateur, order
        defineField({
            name: "nature",
            title: "Nature",
            type: "string",
            options: {
                list: [
                    //variable, roll, hero, count, step
                    { title: "Variable", value: "variable" },
                    { title: "Jet de dés", value: "roll" },
                    { title: "Héros", value: "hero" },
                    { title: "Compte", value: "count" },
                    { title: "Avancée", value: "step" },
                ],
            },
        }),
        defineField({
            name: "component",
            title: "Composant",
            type: "reference",
            to: [{ type: "element" }, { type: "choice" }, { type: "variable" }, { type: "extract" }],
        }),
        defineField({
            name: "reference",
            title: "Référence",
            type: "string",
        }),
        defineField({
            name: "arguments",
            title: "Arguments",
            type: "string",
        }),
        defineField({
            name: "operator",
            title: "Opérateur",
            type: "string",
            options: {
                list: [
                    //equal, notEqual, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, contains, notContains
                    { title: "La variable existe", value: "isNotNull" },
                    { title: "La variable n'existe pas", value: "isNull" },
                    { title: "Égal", value: "=" },
                    { title: "Différent", value: "!=" },
                    { title: "Supérieur", value: ">" },
                    { title: "Supérieur ou égal", value: ">=" },
                    { title: "Inférieur", value: "<" },
                    { title: "Inférieur ou égal", value: "<=" },
                ],
            },
            initialValue: "isNotNull",
        }),
        defineField({
            name: "code",
            title: "Code",
            type: "string",
        }),
    ],
});
