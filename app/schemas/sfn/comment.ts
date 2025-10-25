import { defineType, defineField } from "sanity";

export default defineType({
    name: "comment",
    title: "Comments",
    type: "document",
    fields: [
        defineField({
            name: "resourceType",
            title: "Resource type",
            type: "string",
            validation: (Rule) => Rule.required(),
            options: {
                list: [
                    { title: "Post (blog/vidéo)", value: "post" },
                    { title: "User (dashboard)", value: "user" },
                ],
                layout: "radio",
                direction: "horizontal",
            },
        }),
        defineField({
            name: "resourceRef",
            title: "Linked resource",
            type: "reference",
            to: [{ type: "post" }, { type: "user" }],
            validation: (Rule) => Rule.required(),
            description: "Post (blog/vidéo) ou User (pour le dashboard).",
        }),
        defineField({
            name: "parentRef",
            title: "Parent comment",
            type: "reference",
            to: [{ type: "comment" }],
        }),
        defineField({
            name: "body",
            title: "Message (Rich JSON)",
            type: "text", // on stocke JSON.stringify(slate)
            readOnly: true,
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "createdBy",
            title: "Created by (user ref)",
            type: "reference",
            to: [{ type: "user" }],
            description: "Présent si l’auteur est connecté.",
        }),
        defineField({
            name: "guestName",
            title: "Guest name",
            type: "string",
            description: "Nom affiché si invité.",
        }),
        defineField({
            name: "guestEmail",
            title: "Guest email",
            type: "string",
            validation: (Rule) => Rule.email(),
            description: "Optionnel (invité).",
        }),
        // Upvotes réservés aux comptes connectés
        defineField({
            name: "upvoters",
            title: "Upvoters",
            type: "array",
            of: [{ type: "reference", to: [{ type: "user" }] }],
            description: "Réservé aux comptes connectés (unicité gérée côté app).",
        }),
        defineField({
            name: "voteCount",
            title: "Vote count",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "status",
            title: "Status",
            type: "string",
            initialValue: "active",
            options: {
                list: [
                    { title: "Active", value: "active" },
                    { title: "Hidden", value: "hidden" },
                ],
                layout: "radio",
                direction: "horizontal",
            },
        }),
    ],
    preview: {
        select: {
            body: "body",
            isPrivate: "isPrivate",
            resType: "resourceType",
            createdAt: "_createdAt",
        },
        prepare({ body, isPrivate, resType }) {
            const title = (body || "")?.slice(0, 80) || "—";
            const subtitle = `${resType || "?"}${isPrivate ? " • privé" : ""}`;
            return { title, subtitle };
        },
    },
    orderings: [
        {
            title: "Newest first",
            name: "createdAtDesc",
            by: [{ field: "_createdAt", direction: "desc" }],
        },
        {
            title: "Oldest first",
            name: "createdAtAsc",
            by: [{ field: "_createdAt", direction: "asc" }],
        },
    ],
});
