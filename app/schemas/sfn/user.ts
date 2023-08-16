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
    ],
});
