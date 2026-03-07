import { defineField, defineType } from "sanity";

export default defineType({
    name: "examCompilation",
    title: "Exam Compilation (Template)",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "isActive",
            title: "Active",
            type: "boolean",
            initialValue: true,
        }),
        defineField({
            name: "order",
            title: "Order",
            type: "number",
            initialValue: 0,
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
            name: "examConfig",
            title: "Exam Config",
            type: "object",
            validation: (Rule) => Rule.required(),
            fields: [
                defineField({
                    name: "speakA2TaskIds",
                    title: "Speaking A2 Tasks",
                    type: "array",
                    of: [{ type: "reference", to: [{ type: "mockExamTask" }] }],
                    validation: (Rule) => Rule.required().min(1),
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
    ],
    preview: {
        select: {
            title: "name",
            media: "image",
            isActive: "isActive",
            order: "order",
        },
        prepare({ title, media, isActive, order }) {
            const status = isActive ? "active" : "inactive";
            return {
                title: title || "Untitled compilation",
                subtitle: `#${order ?? 0} - ${status}`,
                media,
            };
        },
    },
});
