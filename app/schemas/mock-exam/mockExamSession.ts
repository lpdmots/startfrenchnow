import { defineField, defineType } from "sanity";

const scoreSummaryFields = [
    defineField({
        name: "percentage",
        title: "Score (%)",
        type: "number",
        validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
        name: "feedback",
        title: "Feedback",
        type: "text",
        validation: (Rule) => Rule.required(),
    }),
];

const speakingAnswerFields = [
    defineField({
        name: "taskRef",
        title: "Task",
        type: "reference",
        to: [{ type: "mockExamTask" }],
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
        type: "number",
    }),
];

const readWriteAnswerFields = [
    defineField({
        name: "taskRef",
        title: "Task",
        type: "reference",
        to: [{ type: "mockExamTask" }],
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
        type: "number",
    }),
];

export default defineType({
    name: "mockExamSession",
    title: "Mock Exam Session",
    type: "document",
    fields: [
        defineField({
            name: "userRef",
            title: "User",
            type: "reference",
            to: [{ type: "user" }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "compilationRef",
            title: "Compilation",
            type: "reference",
            to: [{ type: "examCompilation" }],
            validation: (Rule) => Rule.required(),
        }),
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
            validation: (Rule) => Rule.required(),
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
            validation: (Rule) => Rule.required(),
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
            name: "speakA2CorrectionRetryCount",
            title: "Speak A2 Correction Retry Count",
            type: "number",
            initialValue: 0,
            validation: (Rule) => Rule.min(0),
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
            name: "listeningScenarioResults",
            title: "Listening Scenario Results",
            type: "array",
            of: [
                {
                    name: "listeningScenarioResult",
                    title: "Listening Scenario Result",
                    type: "object",
                    fields: [
                        defineField({
                            name: "examRef",
                            title: "Exam",
                            type: "reference",
                            to: [{ type: "fideExam" }],
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "score",
                            title: "Score",
                            type: "number",
                            validation: (Rule) => Rule.required().min(0).max(3),
                        }),
                        defineField({
                            name: "max",
                            title: "Max",
                            type: "number",
                            validation: (Rule) => Rule.required().min(1).max(3),
                            initialValue: 3,
                        }),
                        defineField({
                            name: "completedAt",
                            title: "Completed at",
                            type: "datetime",
                            validation: (Rule) => Rule.required(),
                        }),
                    ],
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
});
