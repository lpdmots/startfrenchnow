import { defineField, defineType } from "sanity";

export default defineType({
    name: "feedback",
    title: "Feedback",
    type: "document",
    fields: [
        defineField({
            name: "starRating",
            title: "StarRating",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "title",
                            title: "Title",
                            type: "string",
                        }),
                        defineField({
                            name: "totalStars",
                            title: "Nombre total d'étoiles",
                            type: "number",
                        }),
                        defineField({
                            name: "vote",
                            title: "Votes",
                            type: "number",
                        }),
                    ],
                },
            ],
        }),
        defineField({
            name: "comment",
            title: "Commentaire",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "userId",
                            title: "Identifiant de l'utilisateur",
                            type: "string",
                        }),
                        defineField({
                            name: "comment",
                            title: "Commentaire",
                            type: "text",
                        }),
                    ],
                },
            ],
        }),
        defineField({
            name: "features",
            title: "Features",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "title",
                            title: "Title",
                            type: "string",
                        }),
                        defineField({
                            name: "totalChecked",
                            title: "Nombre total de cases cochées",
                            type: "number",
                        }),
                        defineField({
                            name: "vote",
                            title: "Votes",
                            type: "number",
                        }),
                    ],
                },
            ],
        }),
        defineField({
            name: "userIds",
            title: "Identifiants des utilisateurs",
            type: "array",
            of: [
                {
                    type: "string",
                },
            ],
        }),
    ],
});
