import { defineField, defineType } from "sanity";

const READ_WRITE_TASK_TYPES = new Set(["READ_WRITE_M1", "READ_WRITE_M2", "READ_WRITE_M3_M4", "READ_WRITE_M5", "READ_WRITE_M6"]);
const CHOICE_QUESTION_TYPES = new Set(["single_choice", "multiple_choice"]);

const isReadWriteTaskType = (taskType: unknown) => typeof taskType === "string" && READ_WRITE_TASK_TYPES.has(taskType);

const questionFields = [
    defineField({
        name: "questionType",
        title: "Type de question",
        type: "string",
        options: {
            list: [
                { title: "Choix unique", value: "single_choice" },
                { title: "Choix multiple", value: "multiple_choice" },
                { title: "Texte court", value: "short_text" },
                { title: "Texte long", value: "long_text" },
                { title: "Compléter", value: "fill_blank" },
            ],
            layout: "dropdown",
        },
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "instructionText",
        title: "Consigne",
        type: "blockContent",
    }),
    defineField({
        name: "questionText",
        title: "Question",
        type: "blockContent",
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "image",
        title: "Image",
        type: "image",
        options: {
            hotspot: true,
        },
    }),
    defineField({
        name: "imageAlternativeText",
        title: "Texte alternatif image (mobile)",
        type: "blockContent",
    }),
    defineField({
        name: "answerOptions",
        title: "Propositions de réponse",
        type: "array",
        of: [{ type: "string" }],
        validation: (Rule) =>
            Rule.custom((value, context) => {
                const questionType = String((context.parent as { questionType?: string } | undefined)?.questionType || "");
                if (!CHOICE_QUESTION_TYPES.has(questionType)) return true;
                if (!Array.isArray(value) || value.length < 2) {
                    return "Ajoute au moins 2 propositions pour une question à choix.";
                }
                return true;
            }),
    }),
    defineField({
        name: "aiCorrectionContext",
        title: "Contexte correction IA (question)",
        type: "text",
        rows: 4,
    }),
    defineField({
        name: "maxPoints",
        title: "Points max",
        type: "number",
        initialValue: 1,
        validation: (Rule) => Rule.required().min(0).max(20),
    }),
];

const activityFields = [
    defineField({
        name: "image",
        title: "Image",
        type: "image",
        options: {
            hotspot: true,
        },
    }),
    defineField({
        name: "audioUrl",
        title: "Audio URL",
        type: "string",
    }),
    defineField({
        name: "promptText",
        title: "Texte (prompt / situation)",
        type: "blockContent",
    }),
    defineField({
        name: "imageAlternativeText",
        title: "Texte alternatif image (mobile)",
        type: "blockContent",
        hidden: ({ document }) => !isReadWriteTaskType(document?.taskType),
    }),
    defineField({
        name: "aiContext",
        title: "Contexte IA",
        type: "text",
    }),
    defineField({
        name: "aiCorrectionContext",
        title: "Contexte correction IA (activité)",
        type: "text",
        rows: 4,
    }),
    defineField({
        name: "aiVoiceGender",
        title: "Voix IA",
        type: "string",
        options: {
            list: [
                { title: "Homme", value: "male" },
                { title: "Femme", value: "female" },
            ],
            layout: "radio",
            direction: "horizontal",
        },
        initialValue: "male",
    }),
    defineField({
        name: "questions",
        title: "Questions",
        type: "array",
        hidden: ({ document }) => !isReadWriteTaskType(document?.taskType),
        of: [
            {
                name: "question",
                title: "Question",
                type: "object",
                fields: questionFields,
            },
        ],
        validation: (Rule) =>
            Rule.custom((value, context) => {
                if (!isReadWriteTaskType(context.document?.taskType)) return true;
                if (!Array.isArray(value) || value.length < 1) {
                    return "Ajoute au moins une question pour cette activité de Lire/Écrire.";
                }
                return true;
            }),
    }),
];

export default defineType({
    name: "mockExamTask",
    title: "Mock Exam Task",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Titre",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "taskType",
            title: "Task Type",
            type: "string",
            options: {
                list: [
                    { title: "IMAGE_DESCRIPTION_A2", value: "IMAGE_DESCRIPTION_A2" },
                    { title: "PHONE_CONVERSATION_A2", value: "PHONE_CONVERSATION_A2" },
                    { title: "DISCUSSION_A2", value: "DISCUSSION_A2" },
                    { title: "IMAGE_DESCRIPTION_A1_T1", value: "IMAGE_DESCRIPTION_A1_T1" },
                    { title: "IMAGE_DESCRIPTION_A1_T2", value: "IMAGE_DESCRIPTION_A1_T2" },
                    { title: "DISCUSSION_B1", value: "DISCUSSION_B1" },
                    { title: "READ_WRITE_M1", value: "READ_WRITE_M1" },
                    { title: "READ_WRITE_M2", value: "READ_WRITE_M2" },
                    { title: "READ_WRITE_M3_M4", value: "READ_WRITE_M3_M4" },
                    { title: "READ_WRITE_M5", value: "READ_WRITE_M5" },
                    { title: "READ_WRITE_M6", value: "READ_WRITE_M6" },
                ],
                layout: "dropdown",
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "activities",
            title: "Activities",
            type: "array",
            of: [
                {
                    name: "activity",
                    title: "Activity",
                    type: "object",
                    fields: activityFields,
                },
            ],
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    if (!Array.isArray(value) || value.length < 1) {
                        return "Ajoute au moins une activité.";
                    }
                    if (isReadWriteTaskType(context.document?.taskType) && value.length !== 2) {
                        return "Les tâches Lire/Écrire doivent contenir exactement 2 activités.";
                    }
                    return true;
                }),
        }),
    ],
    preview: {
        select: {
            taskType: "taskType",
            title: "title",
        },
        prepare({ taskType, title }) {
            return {
                title: title,
                subtitle: taskType,
            };
        },
    },
});
