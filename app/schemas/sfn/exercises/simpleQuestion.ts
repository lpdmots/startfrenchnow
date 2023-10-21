import { EXERCISETYPES, RESPONSESLAYOUTS } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "simpleQuestion",
    title: "Question",
    type: "object",
    fields: [
        defineField({
            name: "exerciseTypes",
            title: "Types d'exercices",
            type: "array",
            of: [{ type: "string", options: { list: EXERCISETYPES } }],
        }),
        defineField({
            name: "defaultLayout",
            title: "Layout par défaut",
            type: "string",
            options: { list: RESPONSESLAYOUTS },
        }),
        defineField({
            name: "prompt",
            title: "Prompt",
            type: "object",
            fields: [
                defineField({
                    name: "text",
                    title: "Texte",
                    type: "string",
                }),
                defineField({
                    name: "images",
                    title: "Images",
                    type: "array",
                    of: [{ type: "image" }],
                }),
                defineField({
                    name: "sounds",
                    title: "Sons",
                    type: "array",
                    of: [{ type: "string" }],
                }),
            ],
        }),
        defineField({
            name: "options",
            title: "Options",
            type: "object",
            fields: [
                defineField({
                    name: "responsesMonitoring",
                    title: "Suivi des réponses",
                    type: "string",
                    options: { list: ["all", "oneByOne", "hidde"] },
                    description: "important pour les exercices de type 'imgMap'",
                    initialValue: "all",
                }),
                defineField({
                    name: "scoreCalculation",
                    title: "Calcul du score",
                    type: "number",
                    initialValue: 1,
                }),
            ],
        }),
        defineField({
            name: "responses",
            title: "Réponses",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "text",
                            title: "Texte",
                            type: "string",
                        }),
                        defineField({
                            name: "isCorrect",
                            title: "Correcte",
                            type: "string",
                            description: "null = incorrecte, 1 = correcte pour la réponses 1, 2 = correcte pour la réponse 2, 1,2 = correcte pour les réponses 1 et 2",
                        }),
                        defineField({
                            name: "image",
                            title: "Image",
                            type: "image",
                        }),
                        defineField({
                            name: "sound",
                            title: "Son",
                            type: "string",
                        }),
                        defineField({
                            name: "onlyTypes",
                            title: "seulement pour les types",
                            type: "array",
                            of: [{ type: "string", options: { list: EXERCISETYPES } }],
                        }),
                    ],
                },
            ],
        }),
    ],
    preview: {
        select: {
            exerciseTypes: "exerciseTypes",
            prompt: "prompt.text",
            image: "prompt.images.0.asset",
        },
        prepare(selection) {
            const { exerciseTypes, prompt, image } = selection;

            // Vérification si exerciseTypes et exerciseTypes[0] existent
            const exerciseTypesString = exerciseTypes.length && exerciseTypes ? exerciseTypes.join(", ") : "";

            return {
                title: exerciseTypesString,
                subtitle: prompt,
                media: image,
            };
        },
    },
});
