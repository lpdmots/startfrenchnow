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
    ],
});
