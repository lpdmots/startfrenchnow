import { EXERCISETYPES } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "exercise",
    title: "Exercice",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Nom",
            type: "string",
        }),
        defineField({
            name: "title",
            title: "Titre en français",
            type: "string",
        }),
        defineField({
            title: "Catégorie",
            name: "category",
            type: "string",
            options: {
                list: [
                    { title: "Conseil", value: "tips" },
                    { title: "Grammaire", value: "grammar" },
                    { title: "Vocabulaire", value: "vocabulary" },
                    { title: "Culture", value: "culture" },
                    { title: "Expressions", value: "expressions" },
                    { title: "Orthographe", value: "orthography" },
                ],
            },
            initialValue: "vocabulary",
            description: "Utilisé pour les couleurs",
        }),
        defineField({
            name: "title_en",
            title: "Titre en anglais",
            type: "string",
        }),
        defineField({
            name: "instruction",
            title: "Instruction en français",
            type: "blockContent",
        }),
        defineField({
            name: "instruction_en",
            title: "Instruction en anglais",
            type: "blockContent",
        }),
        defineField({
            name: "time",
            title: "Temps",
            type: "number",
        }),
        defineField({
            name: "themes",
            title: "Thèmes",
            type: "array",
            of: [{ type: "reference", to: [{ type: "theme" }] }],
        }),
        defineField({
            name: "exerciseTypes",
            title: "Types d'exercices",
            type: "array",
            of: [{ type: "string", options: { list: EXERCISETYPES } }],
        }),
        defineField({
            name: "questions",
            title: "Questions",
            type: "array",
            of: [{ type: "question" }],
        }),
        defineField({
            name: "nbOfQuestions",
            title: "Nombre de questions",
            type: "number",
            initialValue: 10,
        }),
    ],
});
