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
            name: "subscriber",
            title: "Subscriber",
            type: "boolean",
            description: "Si cet utilisateur a souscrit à la newsletter.",
            initialValue: false,
        }),
        defineField({
            name: "username",
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
            name: "country",
            title: "Pays",
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
            name: "videosAccess",
            title: "Vidéos accessibles",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "video" }],
                },
            ],
        }),
        defineField({
            name: "coursesAccess",
            title: "Cours accessibles",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "course" }],
                },
            ],
        }),
    ],
});
