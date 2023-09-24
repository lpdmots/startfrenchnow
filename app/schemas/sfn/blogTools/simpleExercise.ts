import { EXERCISETYPES } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "simpleExercise",
    title: "Exercice classique",
    type: "object",
    fields: [
        defineField({
            name: "name",
            title: "Nom",
            type: "string",
        }),
        defineField({
            title: "Couleur",
            name: "color",
            type: "string",
            options: {
                list: [
                    { value: "yellow", title: "Jaune" },
                    { value: "blue", title: "Bleu" },
                    { value: "red", title: "Rouge" },
                    { value: "purple", title: "Violet" },
                    { value: "green", title: "Vert" },
                ],
            },
            initialValue: "blue",
        }),
        defineField({
            name: "title",
            title: "Titre en français",
            type: "string",
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
            of: [{ type: "reference", to: [{ type: "exerciseTheme" }] }],
        }),
        defineField({
            name: "exerciseTypes",
            title: "Types d'exercices",
            type: "array",
            of: [{ type: "string", options: { list: EXERCISETYPES } }],
        }),
        defineField({
            name: "nbOfQuestions",
            title: "Nombre de questions",
            type: "number",
            initialValue: 10,
        }),
    ],
});
