import { CREDITS, LESSONS } from "@/app/lib/constantes";
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
                            name: "expiration",
                            title: "Expiration",
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
                        {
                            name: "type",
                            title: "Type de progression",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "logs",
                            title: "Données de progression",
                            type: "array",
                            of: [
                                {
                                    name: "log",
                                    type: "object",
                                    fields: [
                                        {
                                            name: "exam",
                                            title: "Référence de l'examen",
                                            type: "reference",
                                            to: [{ type: "fideExam" }],
                                        },
                                        {
                                            name: "score",
                                            title: "Score obtenu",
                                            type: "number",
                                        },
                                        {
                                            name: "date",
                                            title: "Date de l'exercice",
                                            type: "datetime",
                                            initialValue: () => new Date().toISOString(),
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }),
    ],
});
