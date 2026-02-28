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
    name: "examReview",
    title: "Exam Review",
    type: "document",
    fields: [
        defineField({
            name: "userId",
            title: "User ID",
            type: "string",
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
            name: "sessionKey",
            title: "Session Key",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "status",
            title: "Status",
            type: "string",
            options: {
                list: [
                    { title: "Requested", value: "requested" },
                    { title: "Scheduled", value: "scheduled" },
                    { title: "Completed", value: "completed" },
                    { title: "Cancelled", value: "cancelled" },
                ],
                layout: "radio",
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "scheduledAt",
            title: "Scheduled at",
            type: "datetime",
        }),
        defineField({
            name: "path",
            title: "Path",
            type: "object",
            fields: [
                defineField({
                    name: "oralBranch",
                    title: "Oral Branch",
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
                    name: "writtenCombo",
                    title: "Written Combo",
                    type: "string",
                    options: {
                        list: [
                            { title: "A1_A2", value: "A1_A2" },
                            { title: "A2_B1", value: "A2_B1" },
                        ],
                    },
                    validation: (Rule) => Rule.required(),
                }),
            ],
        }),
        defineField({
            name: "taskRefs",
            title: "Task Refs",
            type: "object",
            fields: [
                defineField({
                    name: "speakA2",
                    title: "Speak A2",
                    type: "array",
                    of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                }),
                defineField({
                    name: "speakBranch",
                    title: "Speak Branch",
                    type: "array",
                    of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                }),
                defineField({
                    name: "listening",
                    title: "Listening",
                    type: "array",
                    of: [{ type: "reference", to: [{ type: "fideExam" }] }],
                }),
                defineField({
                    name: "readWrite",
                    title: "Read/Write",
                    type: "array",
                    of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                }),
            ],
        }),
        defineField({
            name: "answers",
            title: "Answers",
            type: "object",
            fields: [
                defineField({
                    name: "speakA2",
                    title: "Speak A2",
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
                    name: "speakBranch",
                    title: "Speak Branch",
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
                    name: "readWrite",
                    title: "Read/Write",
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
        defineField({
            name: "meeting",
            title: "Meeting",
            type: "object",
            fields: [
                defineField({
                    name: "provider",
                    title: "Provider",
                    type: "string",
                    options: {
                        list: [{ title: "Zoom", value: "zoom" }],
                    },
                }),
                defineField({
                    name: "joinUrl",
                    title: "Join URL",
                    type: "string",
                }),
                defineField({
                    name: "startAt",
                    title: "Start at",
                    type: "datetime",
                }),
                defineField({
                    name: "timezone",
                    title: "Timezone",
                    type: "string",
                }),
            ],
        }),
        defineField({
            name: "userNote",
            title: "User Note",
            type: "text",
        }),
        defineField({
            name: "teacherFeedback",
            title: "Teacher Feedback",
            type: "object",
            fields: [
                defineField({
                    name: "text",
                    title: "Text",
                    type: "blockContent",
                }),
                defineField({
                    name: "deliveredAt",
                    title: "Delivered at",
                    type: "datetime",
                }),
            ],
        }),
    ],
    preview: {
        select: {
            userId: "userId",
            status: "status",
        },
        prepare({ userId, status }) {
            return {
                title: userId ? `Exam Review - ${userId}` : "Exam Review",
                subtitle: status || undefined,
            };
        },
    },
});
