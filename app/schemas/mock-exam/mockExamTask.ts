import { defineField, defineType } from "sanity";

const taskMediaBlockFields = [
    defineField({
        name: "text",
        title: "Texte",
        type: "blockContent",
    }),
    defineField({
        name: "videoUrl",
        title: "Video URL",
        type: "string",
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
        name: "layout",
        title: "Layout",
        type: "string",
        options: {
            list: [
                { title: "Vertical", value: "vertical" },
                { title: "Horizontal", value: "horizontal" },
            ],
            layout: "radio",
            direction: "horizontal",
        },
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
        title: "Texte (prompt)",
        type: "blockContent",
    }),
    defineField({
        name: "aiContext",
        title: "Contexte IA",
        type: "string",
    }),
    defineField({
        name: "maxPoints",
        title: "Points max",
        type: "number",
        validation: (Rule) => Rule.required(),
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
            name: "introBlocks",
            title: "Intro Blocks",
            type: "array",
            of: [
                {
                    name: "taskMediaBlock",
                    title: "Task Media Block",
                    type: "object",
                    fields: taskMediaBlockFields,
                },
            ],
            initialValue: [],
        }),
        defineField({
            name: "aiTaskContext",
            title: "Contexte IA (tâche)",
            type: "string",
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
            validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
            name: "correctionBlocks",
            title: "Correction Blocks",
            type: "array",
            of: [
                {
                    name: "taskMediaBlock",
                    title: "Task Media Block",
                    type: "object",
                    fields: taskMediaBlockFields,
                },
            ],
            initialValue: [],
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
