import { defineField, defineType } from "sanity";

const scoreSummaryFields = [
    defineField({
        name: "score",
        title: "Score",
        type: "number",
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "max",
        title: "Max",
        type: "number",
        validation: (Rule) => Rule.required(),
    }),
];

const speakingAnswerFields = [
    defineField({
        name: "taskId",
        title: "Task ID",
        type: "string",
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "activityKey",
        title: "Activity Key",
        type: "string",
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "audioUrl",
        title: "Audio URL",
        type: "string",
    }),
    defineField({
        name: "transcriptFinal",
        title: "Transcript final",
        type: "text",
    }),
    defineField({
        name: "AiFeedback",
        title: "AI Feedback",
        type: "text",
    }),
    defineField({
        name: "AiScore",
        title: "AI Score",
        type: "object",
        fields: scoreSummaryFields,
    }),
];

const readWriteAnswerFields = [
    defineField({
        name: "taskId",
        title: "Task ID",
        type: "string",
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "activityKey",
        title: "Activity Key",
        type: "string",
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: "textAnswer",
        title: "Text Answer",
        type: "text",
    }),
    defineField({
        name: "AiFeedback",
        title: "AI Feedback",
        type: "text",
    }),
    defineField({
        name: "AiScore",
        title: "AI Score",
        type: "object",
        fields: scoreSummaryFields,
    }),
];

export default defineType({
    name: "examCompilation",
    title: "Exam Compilation",
    type: "document",
    fields: [
        defineField({
            name: "userId",
            title: "User ID",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: {
                hotspot: true,
            },
            description: "Image de couverture auto-générée depuis la première activité du parler A2.",
        }),
        defineField({
            name: "examConfig",
            title: "Exam Config",
            type: "object",
            fields: [
                defineField({
                    name: "speakA2TaskIds",
                    title: "Speaking A2 Tasks",
                    type: "array",
                    of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "speakBranchTaskIds",
                    title: "Speaking Branch Tasks",
                    type: "object",
                    fields: [
                        defineField({
                            name: "A1",
                            title: "A1",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                        }),
                        defineField({
                            name: "B1",
                            title: "B1",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                        }),
                    ],
                }),
                defineField({
                    name: "listeningPackIds",
                    title: "Listening Packs",
                    type: "object",
                    fields: [
                        defineField({
                            name: "A1",
                            title: "A1",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "fideExam" }] }],
                        }),
                        defineField({
                            name: "A2",
                            title: "A2",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "fideExam" }] }],
                        }),
                        defineField({
                            name: "B1",
                            title: "B1",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "fideExam" }] }],
                        }),
                    ],
                }),
                defineField({
                    name: "readWriteTaskIds",
                    title: "Read/Write Tasks",
                    type: "object",
                    fields: [
                        defineField({
                            name: "A1_A2",
                            title: "A1_A2",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                        }),
                        defineField({
                            name: "A2_B1",
                            title: "A2_B1",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                        }),
                    ],
                }),
            ],
        }),
        defineField({
            name: "oralBranch",
            title: "Oral Branch",
            type: "object",
            fields: [
                defineField({
                    name: "recommended",
                    title: "Recommended",
                    type: "string",
                    options: {
                        list: [
                            { title: "A1", value: "A1" },
                            { title: "B1", value: "B1" },
                        ],
                    },
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "chosen",
                    title: "Chosen",
                    type: "string",
                    options: {
                        list: [
                            { title: "A1", value: "A1" },
                            { title: "B1", value: "B1" },
                        ],
                    },
                }),
            ],
        }),
        defineField({
            name: "writtenCombo",
            title: "Written Combo",
            type: "object",
            fields: [
                defineField({
                    name: "recommended",
                    title: "Recommended",
                    type: "string",
                    options: {
                        list: [
                            { title: "A1_A2", value: "A1_A2" },
                            { title: "A2_B1", value: "A2_B1" },
                        ],
                    },
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "chosen",
                    title: "Chosen",
                    type: "string",
                    options: {
                        list: [
                            { title: "A1_A2", value: "A1_A2" },
                            { title: "A2_B1", value: "A2_B1" },
                        ],
                    },
                }),
            ],
        }),
        defineField({
            name: "session",
            title: "Sessions",
            type: "array",
            of: [
                {
                    name: "mockExamSession",
                    title: "Mock Exam Session",
                    type: "object",
                    fields: [
                        defineField({
                            name: "status",
                            title: "Status",
                            type: "string",
                            options: {
                                list: [
                                    { title: "In progress", value: "in_progress" },
                                    { title: "Completed", value: "completed" },
                                    { title: "Abandoned", value: "abandoned" },
                                ],
                                layout: "radio",
                            },
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "startedAt",
                            title: "Started at",
                            type: "datetime",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "resume",
                            title: "Resume",
                            type: "object",
                            fields: [
                                defineField({
                                    name: "state",
                                    title: "State",
                                    type: "string",
                                    validation: (Rule) => Rule.required(),
                                }),
                                defineField({
                                    name: "taskId",
                                    title: "Task ID",
                                    type: "string",
                                }),
                                defineField({
                                    name: "activityKey",
                                    title: "Activity Key",
                                    type: "string",
                                }),
                                defineField({
                                    name: "updatedAt",
                                    title: "Updated at",
                                    type: "datetime",
                                }),
                            ],
                        }),
                        defineField({
                            name: "speakA2Answers",
                            title: "Speak A2 Answers",
                            type: "array",
                            of: [
                                {
                                    name: "speakingAnswer",
                                    title: "Speaking Answer",
                                    type: "object",
                                    fields: speakingAnswerFields,
                                },
                            ],
                        }),
                        defineField({
                            name: "speakBranchAnswers",
                            title: "Speak Branch Answers",
                            type: "array",
                            of: [
                                {
                                    name: "speakingAnswer",
                                    title: "Speaking Answer",
                                    type: "object",
                                    fields: speakingAnswerFields,
                                },
                            ],
                        }),
                        defineField({
                            name: "readWriteAnswers",
                            title: "Read/Write Answers",
                            type: "array",
                            of: [
                                {
                                    name: "readWriteAnswer",
                                    title: "Read/Write Answer",
                                    type: "object",
                                    fields: readWriteAnswerFields,
                                },
                            ],
                        }),
                        defineField({
                            name: "overtimeTaskRefs",
                            title: "Overtime Task Refs",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                        }),
                        defineField({
                            name: "scores",
                            title: "Scores",
                            type: "object",
                            fields: [
                                defineField({
                                    name: "speakA2",
                                    title: "Speak A2",
                                    type: "object",
                                    fields: scoreSummaryFields,
                                }),
                                defineField({
                                    name: "speakBranch",
                                    title: "Speak Branch",
                                    type: "object",
                                    fields: scoreSummaryFields,
                                }),
                                defineField({
                                    name: "listening",
                                    title: "Listening",
                                    type: "object",
                                    fields: scoreSummaryFields,
                                }),
                                defineField({
                                    name: "readWrite",
                                    title: "Read/Write",
                                    type: "object",
                                    fields: scoreSummaryFields,
                                }),
                                defineField({
                                    name: "total",
                                    title: "Total",
                                    type: "object",
                                    fields: scoreSummaryFields,
                                }),
                            ],
                        }),
                    ],
                },
            ],
            validation: (Rule) => Rule.max(5),
        }),
    ],
    preview: {
        select: {
            userId: "userId",
            media: "image",
        },
        prepare({ userId, media }) {
            return {
                title: userId ? `Exam Compilation - ${userId}` : "Exam Compilation",
                media,
            };
        },
    },
});
