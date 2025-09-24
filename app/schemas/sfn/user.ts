import { CREDITS, LESSONS, PROGRESSION_TYPES } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "user",
    title: "Utilisateur",
    type: "document",
    fields: [
        defineField({
            name: "email",
            title: "Email",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "password",
            title: "Password",
            type: "string",
        }),
        defineField({
            name: "isActive",
            title: "Actif",
            type: "boolean",
            description: "Le compte est actif quand l'adresse mail est validé. Un subscribe n'active pas le compte.",
            initialValue: false,
        }),
        defineField({
            name: "name",
            title: "Nom d'utilisateur",
            type: "string",
        }),
        defineField({
            name: "firstName",
            title: "Prénom",
            type: "string",
        }),
        defineField({
            name: "lastName",
            title: "Nom",
            type: "string",
        }),
        defineField({
            name: "isAdmin",
            title: "Admin",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "isPremium",
            title: "Premium",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "activateToken",
            title: "Token d'activation",
            type: "string",
        }),
        defineField({
            name: "tokenExpiration",
            title: "Expiration du token",
            type: "datetime",
        }),
        defineField({
            name: "resetPasswordToken",
            title: "Token de réinitialisation du mot de passe",
            type: "string",
        }),
        defineField({
            name: "resetPasswordExpiration",
            title: "Expiration du token de réinitialisation du mot de passe",
            type: "datetime",
        }),
        defineField({
            name: "oAuth",
            title: "Connection OAuth",
            type: "string",
        }),
        defineField({
            name: "stories",
            title: "Stories",
            type: "array",
            of: [
                {
                    title: "storyUserStats",
                    type: "object",
                    fields: [
                        {
                            title: "Story",
                            name: "story",
                            type: "reference",
                            to: [{ type: "adventure" }],
                        },
                        {
                            title: "Date de la dernière partie débutée",
                            name: "lastGameDate",
                            type: "number",
                        },
                        {
                            title: "Feedback",
                            name: "feedback",
                            type: "string",
                            options: {
                                list: [
                                    { value: "done", title: "Fait" },
                                    { value: "no", title: "Refusé" },
                                    { value: "open", title: "Attente" },
                                ],
                            },
                        },
                        {
                            title: "Games commencées",
                            name: "gamesStarted",
                            type: "number",
                            initialValue: 0,
                        },
                        {
                            title: "Games",
                            name: "games",
                            type: "number",
                        },
                        {
                            title: "Scores",
                            name: "scores",
                            type: "array",
                            of: [
                                {
                                    title: "Score",
                                    type: "object",
                                    fields: [
                                        {
                                            title: "Titre",
                                            name: "title",
                                            type: "string",
                                        },
                                        {
                                            title: "Meilleur score",
                                            name: "bestScore",
                                            type: "number",
                                        },
                                        {
                                            title: "Score le plus bas",
                                            name: "lowestScore",
                                            type: "number",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            title: "Success",
                            name: "success",
                            type: "array",
                            of: [{ type: "string" }],
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: "lessons",
            title: "Les leçons",
            type: "array",
            of: [
                {
                    name: "lesson",
                    type: "object",
                    fields: [
                        {
                            name: "eventType",
                            title: "Type de leçon",
                            type: "string",
                            options: {
                                list: LESSONS,
                            },
                        },
                        {
                            name: "totalPurchasedMinutes",
                            title: "Total des minutes achetées",
                            type: "number",
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: "credits",
            title: "Les crédits",
            type: "array",
            of: [
                {
                    name: "credit",
                    type: "object",
                    fields: [
                        {
                            name: "referenceKey",
                            title: "Clé de référence",
                            type: "string",
                            options: {
                                list: CREDITS,
                            },
                        },
                        {
                            name: "totalCredits",
                            title: "Crédits totaux",
                            type: "number",
                        },
                        {
                            name: "remainingCredits",
                            title: "Crédits restants",
                            type: "number",
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: "permissions",
            title: "Permissions",
            type: "array",
            of: [
                {
                    name: "permission",
                    type: "object",
                    fields: [
                        {
                            name: "referenceKey",
                            title: "Clé de référence",
                            type: "string",
                        },
                        {
                            name: "grantedAt",
                            title: "Accordé le",
                            type: "datetime",
                        },
                        {
                            name: "expiresAt",
                            title: "Expire le",
                            type: "datetime",
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: "alias",
            title: "Alias",
            type: "array",
            of: [
                {
                    name: "alias",
                    type: "string",
                },
            ],
        }),
        defineField({
            name: "stripeCustomerId",
            title: "Stripe Customer ID",
            type: "string",
        }),
        defineField({
            name: "learningProgress",
            title: "Progression d'apprentissage",
            type: "array",
            of: [
                {
                    name: "progress",
                    type: "object",
                    title: "Progression",
                    fields: [
                        // Ex. "pack_fide" pour les vidéos et exam du pack
                        defineField({
                            name: "type",
                            title: "Type de progression",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                            options: {
                                list: PROGRESSION_TYPES,
                                layout: "radio",
                                direction: "horizontal",
                            },
                        }),

                        defineField({
                            name: "current",
                            title: "En cours (unique)",
                            type: "object",
                            fields: [
                                defineField({
                                    name: "post",
                                    title: "Vidéo en cours",
                                    type: "reference",
                                    to: [{ type: "post" }],
                                }),
                                defineField({
                                    name: "updatedAt",
                                    title: "Dernière mise à jour",
                                    type: "datetime",
                                    initialValue: () => new Date().toISOString(),
                                    validation: (Rule) => Rule.required(),
                                }),
                            ],
                        }),

                        // -------------------------
                        // Logs vidéo
                        // -------------------------
                        defineField({
                            name: "videoLogs",
                            title: "Vidéos (logs)",
                            type: "array",
                            of: [
                                {
                                    name: "videoLog",
                                    type: "object",
                                    title: "Log vidéo",
                                    fields: [
                                        defineField({
                                            name: "post",
                                            title: "Leçon (Post)",
                                            type: "reference",
                                            to: [{ type: "post" }],
                                            validation: (Rule) => Rule.required(),
                                        }),
                                        defineField({
                                            name: "status",
                                            title: "Statut",
                                            type: "string",
                                            options: {
                                                list: [
                                                    { title: "Non vu", value: "unwatched" },
                                                    { title: "En cours", value: "in-progress" },
                                                    { title: "Vu", value: "watched" },
                                                ],
                                                layout: "radio",
                                                direction: "horizontal",
                                            },
                                            validation: (Rule) => Rule.required(),
                                        }),
                                        defineField({
                                            name: "lastSeenAt",
                                            title: "Dernier visionnage",
                                            type: "datetime",
                                        }),
                                        defineField({
                                            name: "lastCompletedAt",
                                            title: "Date de complétion",
                                            type: "datetime",
                                        }),
                                        defineField({
                                            name: "updatedAt",
                                            title: "Dernière mise à jour",
                                            type: "datetime",
                                            initialValue: () => new Date().toISOString(),
                                            validation: (Rule) => Rule.required(),
                                        }),
                                        defineField({
                                            name: "progress",
                                            title: "Progression (0..1)",
                                            type: "number",
                                            description: "Part unique de la vidéo vue (sans double comptage).",
                                            validation: (Rule) => Rule.min(0).max(1),
                                        }),
                                        // (NOUVEAU) dernier palier franchi pour éviter les ré-écritures
                                        defineField({
                                            name: "lastMilestone",
                                            title: "Dernier palier atteint",
                                            type: "number",
                                            options: {
                                                list: [
                                                    { title: "20%", value: 0.2 },
                                                    { title: "40%", value: 0.4 },
                                                    { title: "60%", value: 0.6 },
                                                    { title: "80%", value: 0.8 },
                                                    { title: "100%", value: 1 },
                                                ],
                                                layout: "radio",
                                                direction: "horizontal",
                                            },
                                        }),
                                    ],
                                    preview: {
                                        select: {
                                            title: "post.title",
                                            status: "status",
                                            lastSeenAt: "lastSeenAt",
                                            progress: "progress",
                                        },
                                        prepare: ({ title, status, lastSeenAt, progress }) => ({
                                            title: title || "Leçon",
                                            subtitle: `${status || "unwatched"}${progress != null ? ` • ${Math.round((progress || 0) * 100)}%` : ""}${lastSeenAt ? " • " + lastSeenAt : ""}`,
                                        }),
                                    },
                                },
                            ],
                        }),

                        // -------------------------
                        // Logs examens
                        // -------------------------
                        defineField({
                            name: "examLogs",
                            title: "Examens (logs)",
                            type: "array",
                            of: [
                                {
                                    name: "examLog",
                                    type: "object",
                                    title: "Log examen",
                                    fields: [
                                        defineField({
                                            name: "exam",
                                            title: "Examen",
                                            type: "reference",
                                            to: [{ type: "fideExam" }],
                                            validation: (Rule) => Rule.required(),
                                        }),
                                        defineField({
                                            name: "bestScore",
                                            title: "Meilleur score",
                                            type: "number",
                                            validation: (Rule) => Rule.required().min(0).max(3),
                                        }),
                                        defineField({
                                            name: "scores",
                                            title: "Historique des scores",
                                            type: "array",
                                            of: [{ type: "number" }],
                                        }),
                                        defineField({
                                            name: "bestScoreAt",
                                            title: "Date du meilleur score",
                                            type: "datetime",
                                        }),
                                        defineField({
                                            name: "lastCompletedAt",
                                            title: "Dernière tentative complétée",
                                            type: "datetime",
                                        }),
                                        defineField({
                                            name: "updatedAt",
                                            title: "Dernière mise à jour",
                                            type: "datetime",
                                            initialValue: () => new Date().toISOString(),
                                            validation: (Rule) => Rule.required(),
                                        }),
                                    ],
                                    preview: {
                                        select: {
                                            title: "exam.title",
                                            best: "bestScore",
                                            bestAt: "bestScoreAt",
                                        },
                                        prepare: ({ title, best, bestAt }) => ({
                                            title: title || "Examen",
                                            subtitle: `Best: ${best ?? "-"}${bestAt ? " • " + bestAt : ""}`,
                                        }),
                                    },
                                },
                            ],
                        }),
                    ],
                    preview: {
                        select: {
                            type: "type",
                            vCount: "videoLogs.length",
                            eCount: "examLogs.length",
                        },
                        prepare: ({ type, vCount = 0, eCount = 0 }) => ({
                            title: type || "Progression",
                            subtitle: `Vidéos: ${vCount} • Examens: ${eCount}`,
                        }),
                    },
                },
            ],
        }),
    ],
});
