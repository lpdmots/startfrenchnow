import { defineField, defineType } from "sanity";

const READ_WRITE_TASK_TYPES = new Set(["READ_WRITE_M1", "READ_WRITE_M2", "READ_WRITE_M3_M4", "READ_WRITE_M5", "READ_WRITE_M6"]);

const isReadWriteTaskType = (taskType: unknown) => typeof taskType === "string" && READ_WRITE_TASK_TYPES.has(taskType);

const itemFields = [
    defineField({
        name: "itemType",
        title: "Type d'élément",
        type: "string",
        options: {
            list: [
                { title: "Consigne", value: "instruction" },
                { title: "Choix (réponse unique)", value: "single_choice" },
                { title: "Compléter selon numéro (image)", value: "numbered_fill" },
                { title: "Retrouver passage dans le texte", value: "text_extract" },
                { title: "Texte long", value: "long_text" },
            ],
            layout: "dropdown",
        },
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "contentText",
        title: "Texte (consigne / contenu)",
        type: "blockContent",
        validation: (Rule) =>
            Rule.custom((value, context) => {
                const itemType = String((context.parent as { itemType?: string } | undefined)?.itemType || "");
                if (itemType !== "instruction") return true;
                if (!Array.isArray(value) || value.length < 1) {
                    return "Ajoute le texte de consigne pour l'élément de type consigne.";
                }
                return true;
            }),
    }),
    defineField({
        name: "question",
        title: "Question",
        type: "string",
        description: "Pour le type numbered_fill: indiquer un ou plusieurs numéros séparés par des virgules (ex: 1 ou 1,2,3,4).",
        validation: (Rule) =>
            Rule.custom((value, context) => {
                const itemType = String((context.parent as { itemType?: string } | undefined)?.itemType || "");
                const question = String(value || "").trim();
                if (itemType === "instruction") return true;
                if (itemType === "single_choice") return true; // question facultative pour ce type
                if (itemType === "text_extract") return true; // question facultative pour ce type
                if (itemType === "long_text") return true; // question facultative pour ce type
                if (!question) return "Ce type nécessite une question.";
                if (itemType === "numbered_fill" && !/^\d+(\s*,\s*\d+)*$/.test(question)) {
                    return "Pour ce type, renseigne un ou plusieurs numéros séparés par des virgules (ex: 1 ou 1,2,3).";
                }
                return true;
            }),
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
        of: [
            {
                name: "answerOption",
                title: "Option",
                type: "object",
                fields: [
                    defineField({
                        name: "label",
                        title: "Texte",
                        type: "string",
                        validation: (Rule) => Rule.required().min(1),
                    }),
                    defineField({
                        name: "isCorrect",
                        title: "Bonne réponse",
                        type: "boolean",
                        initialValue: false,
                    }),
                ],
                preview: {
                    select: {
                        title: "label",
                        isCorrect: "isCorrect",
                    },
                    prepare({ title, isCorrect }) {
                        return {
                            title: title || "(Sans texte)",
                            subtitle: isCorrect ? "Bonne réponse" : "Mauvaise réponse",
                        };
                    },
                },
            },
        ],
        validation: (Rule) =>
            Rule.custom((value, context) => {
                const itemType = String((context.parent as { itemType?: string } | undefined)?.itemType || "");
                if (itemType !== "single_choice") return true;
                if (!Array.isArray(value) || value.length < 2) {
                    return "Ajoute au moins 2 propositions pour une question à choix.";
                }
                const options = value as Array<{ label?: string; isCorrect?: boolean }>;
                const validLabels = options.filter((option) => String(option?.label || "").trim().length > 0);
                if (validLabels.length < 2) {
                    return "Ajoute au moins 2 propositions avec un texte.";
                }
                const correctCount = options.filter((option) => Boolean(option?.isCorrect)).length;
                if (correctCount !== 1) {
                    return "Sélectionne exactement 1 bonne réponse.";
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
        validation: (Rule) =>
            Rule.custom((value, context) => {
                const itemType = String((context.parent as { itemType?: string } | undefined)?.itemType || "");
                if (itemType === "instruction") return true;
                const parsed = Number(value);
                if (!Number.isFinite(parsed)) return "Renseigne les points max.";
                if (parsed < 0 || parsed > 20) return "Les points max doivent être entre 0 et 20.";
                return true;
            }),
    }),
];

const activityFields = [
    defineField({
        name: "title",
        title: "Titre de la tâche",
        type: "string",
        hidden: ({ document }) => !isReadWriteTaskType(document?.taskType),
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
        name: "items",
        title: "Éléments (consigne + questions)",
        type: "array",
        hidden: ({ document }) => !isReadWriteTaskType(document?.taskType),
        of: [
            {
                name: "item",
                title: "Élément",
                type: "object",
                fields: itemFields,
            },
        ],
        validation: (Rule) =>
            Rule.custom((value, context) => {
                if (!isReadWriteTaskType(context.document?.taskType)) return true;
                if (!Array.isArray(value) || value.length < 1) {
                    return "Ajoute au moins une question.";
                }
                const items = value as Array<{ itemType?: string; _key?: string }>;
                const instructionCount = items.filter((item) => String(item?.itemType || "") === "instruction").length;
                if (instructionCount > 1) return "Chaque activité peut contenir au maximum 1 élément de type consigne.";
                const questionCount = items.filter((item) => String(item?.itemType || "") !== "instruction").length;
                if (questionCount < 1) return "Ajoute au moins une question.";
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
            name: "supportPdfUrl",
            title: "Lien PDF support (module)",
            type: "string",
            hidden: ({ document }) => !isReadWriteTaskType(document?.taskType),
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
