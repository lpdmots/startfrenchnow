import { AUTOMATEDQUESTIONS, EXERCISETYPES } from "@/app/lib/constantes";
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
            title: "Filtre",
            name: "filters",
            type: "object",
            fields: [
                defineField({
                    title: "Status",
                    name: "status",
                    type: "string",
                    options: {
                        list: [
                            { title: "Tous", value: "all" },
                            { title: "Primaire", value: "primary" },
                            { title: "Secondaire", value: "secondary" },
                        ],
                    },
                    initialValue: "primary",
                }),
                defineField({
                    title: "Nature",
                    name: "nature",
                    type: "string",
                    options: {
                        list: [
                            { title: "Tous", value: "all" },
                            { title: "Les mots uniquement", value: "words" },
                            { title: "Les expressions uniquement", value: "expressions" },
                        ],
                    },
                    initialValue: "all",
                }),
                defineField({
                    title: "Tags",
                    name: "tags",
                    type: "array",
                    of: [{ type: "string" }],
                }),
            ],
        }),
        defineField({
            name: "automatedTypes",
            title: "Questions automatisées",
            type: "array",
            of: [
                {
                    type: "string",
                    options: {
                        list: [
                            { title: "Au choix", value: "levelChoice" },
                            { title: "Niveau 1", value: "level1" },
                            { title: "Niveau 2", value: "level2" },
                            { title: "Niveau 3", value: "level3" },
                            { title: "Traduction de FR à EN", value: "translateFrToEn" },
                            { title: "Traduction de EN à FR", value: "translateEnToFr" },
                            { title: "Traduction de EN à FR (input)", value: "translateEnToFrInput" },
                            { title: "Traduction de son en FR (input)", value: "translateSoundToFrInput" },
                            { title: "Écoute en FR et retrouve le mot FR", value: "soundFrToFr" },
                            { title: "Écoute en FR et retrouve le mot EN", value: "soundFrToEn" },
                            { title: "Lis en EN et retrouve le son FR", value: "enToSoundFr" },
                            { title: "Choisis la bonne orthographe", value: "chooseCorrectSpelling" },
                            { title: "Retrouver les paires", value: "pairedWords" },
                            { title: "Mettre les mots dans le bon ordre (avec son)", value: "orderWordsEasy" },
                            { title: "Mettre les mots dans le bon ordre", value: "orderWords" },
                            { title: "Devine le mot (bouttons)", value: "riddleButtons" },
                            { title: "Devine le mot (input)", value: "riddleInput" },
                            { title: "Image (bouttons)", value: "imageButtons" },
                            { title: "Image (input)", value: "imageInput" },
                        ],
                    },
                },
            ],
        }),
        defineField({
            name: "questionsPriority",
            title: "Priorité des questions",
            type: "string",
            options: {
                list: [
                    { title: "Équilibré", value: "mixed" },
                    { title: "Manuelles d'abord", value: "manual" },
                    { title: "Automatiques uniquement", value: "automated" },
                ],
            },
            initialValue: "mixed",
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
    preview: {
        select: {
            title: "name",
            media: "theme.image",
        },
        prepare(selection) {
            return { ...selection };
        },
    },
});
