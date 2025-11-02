import { COMMENTRESOURCES } from "@/app/lib/constantes";
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
                list: [...COMMENTRESOURCES],
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
            name: "replyToRef",
            title: "Reply to",
            type: "reference",
            to: [{ type: "comment" }],
            description: "Le commentaire ciblé (réponse directe). Optionnel.",
        }),
        defineField({ name: "body", title: "Message", type: "text", rows: 6, validation: (Rule) => Rule.required().min(1).max(1000) }),
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
            name: "isEdited",
            title: "Édité",
            type: "boolean",
            initialValue: false,
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
        defineField({
            name: "isSeen",
            title: "Vu/Traité",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "assignedTo",
            title: "Assigné à",
            type: "string",
            options: { list: ["Nico", "Yoh"] },
        }),
        defineField({
            name: "isAnswered",
            title: "Répondu (par un admin)",
            type: "boolean",
            initialValue: false,
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
