import { defineField, defineType } from "sanity";

export default defineType({
    name: "adventure",
    title: "Aventure",
    type: "document",
    fields: [
        //images, variables, starter, gameSystem, heros, description, duration, name, typeOfStory,
        defineField({
            name: "name",
            title: "Nom de l'aventure",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "name",
                maxLength: 96,
            },
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "level",
            title: "Niveau",
            type: "string",
            options: {
                list: [
                    { value: "a1", title: "A1" },
                    { value: "a2", title: "A2" },
                    { value: "b1", title: "B1" },
                    { value: "b2", title: "B2" },
                ],
            },
            initialValue: "a1",
        }),
        defineField({
            name: "category",
            title: "Catégorie",
            type: "string",
            options: {
                list: [
                    // /!\  This list must be the same as in lib\constantes.ts
                    { value: "fantasy", title: "Fantasy" },
                    { value: "scienceFiction", title: "Science Fiction" },
                    { value: "historical", title: "Historique" },
                    { value: "adventure", title: "Aventure" },
                    { value: "culture", title: "Culture française" },
                    { value: "comedy", title: "Comédie" },
                    { value: "investigation", title: "Enquête" },
                    { value: "other", title: "Autre" },
                ],
            },
            initialValue: "adventure",
        }),
        defineField({
            name: "duration",
            title: "Durée",
            type: "number",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
            description: "Durée de l'aventure en minutes",
        }),
        defineField({
            name: "description",
            description: "Entrez un court résumé de l'aventure...",
            title: "Description",
            type: "storyContent",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "selectContent",
            title: "Texte de la sélection du héros",
            type: "storyContent",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "images",
            title: "Images",
            type: "object",
            fields: [
                {
                    name: "primary",
                    title: "Image principale",
                    type: "image",
                    options: {
                        hotspot: true,
                    },
                },
                {
                    name: "icon",
                    title: "Icone",
                    type: "image",
                    options: {
                        hotspot: true,
                    },
                },
                {
                    name: "secondary",
                    title: "Images secondaires",
                    type: "array",
                    of: [{ type: "image" }],
                },
            ],
        }),
        defineField({
            name: "variables",
            title: "Variables",
            type: "array",
            of: [{ type: "reference", to: { type: "variable" } }],
        }),
        defineField({
            name: "gameSystem",
            title: "Système de jeu",
            type: "object",
            fields: [
                {
                    name: "name",
                    title: "Nom du système de jeu",
                    type: "string",
                    validation: (Rule) => Rule.required().warning("Ce champ est requis"),
                },
                {
                    name: "attributes",
                    title: "Attributs",
                    type: "array",
                    of: [{ type: "string" }],
                    validation: (Rule) => Rule.required().warning("Ce champ est requis"),
                },
                {
                    name: "die",
                    title: "Dé",
                    type: "number",
                    validation: (Rule) => Rule.required().warning("Ce champ est requis"),
                },
                {
                    name: "DefaultDifficulty",
                    title: "Difficulté par défaut",
                    type: "number",
                    validation: (Rule) => Rule.required().warning("Ce champ est requis"),
                },
            ],
        }),
        defineField({
            name: "heros",
            title: "Héros",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "name",
                            title: "Nom du héros",
                            type: "string",
                            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
                        },
                        {
                            name: "sex",
                            title: "Sexe",
                            type: "string",
                            options: {
                                list: ["male", "female"],
                            },
                            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
                        },
                        {
                            name: "statistics",
                            title: "Statistiques",
                            type: "array",
                            of: [
                                {
                                    type: "object",
                                    fields: [
                                        { name: "name", title: "Nom de l'attribut", type: "string" },
                                        { name: "value", title: "Valeur de l'attribut", type: "number" },
                                    ],
                                },
                            ],
                        },

                        {
                            name: "description",
                            title: "Description",
                            type: "storyContent",
                        },
                        {
                            name: "images",
                            title: "Images",
                            type: "object",
                            fields: [
                                {
                                    name: "default",
                                    title: "Image par défaut",
                                    type: "image",
                                    options: {
                                        hotspot: true,
                                    },
                                },
                                {
                                    name: "happy",
                                    title: "Image quand le héros est heureux",
                                    type: "image",
                                    options: {
                                        hotspot: true,
                                    },
                                },
                                {
                                    name: "sad",
                                    title: "Image quand le héros est triste",
                                    type: "image",
                                    options: {
                                        hotspot: true,
                                    },
                                },
                                {
                                    name: "angry",
                                    title: "Image quand le héros est en colère",
                                    type: "image",
                                    options: {
                                        hotspot: true,
                                    },
                                },
                                {
                                    name: "scared",
                                    title: "Image quand le héros a peur",
                                    type: "image",
                                    options: {
                                        hotspot: true,
                                    },
                                },
                            ],
                        },
                        {
                            name: "variables",
                            title: "Variables",
                            type: "array",
                            of: [{ type: "reference", to: { type: "variable" } }],
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: "firstChapter",
            title: "Premier chapitre",
            type: "reference",
            to: [{ type: "element" }],
        }),
        defineField({
            name: "startTime",
            title: "Heure de début",
            type: "string",
            description: "Heure de début de l'aventure en minutes",
        }),
        defineField({
            name: "isReady",
            title: "Aventure prête",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "publishedAt",
            title: "Published at",
            type: "datetime",
            initialValue: new Date().toISOString(),
        }),
        defineField({
            name: "stats",
            title: "Statistiques",
            type: "object",
            fields: [
                {
                    name: "gamesStarted",
                    title: "Nombre de parties commencées",
                    type: "number",
                    initialValue: 0,
                },
                {
                    name: "games",
                    title: "Nombre de parties",
                    type: "number",
                },
                {
                    name: "userIds",
                    title: "Ids des utilisateurs",
                    type: "array",
                    of: [{ type: "string" }],
                },
                {
                    name: "scores",
                    title: "Scores",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            fields: [
                                {
                                    name: "title",
                                    title: "Titre",
                                    type: "string",
                                },
                                {
                                    name: "averageScore",
                                    title: "Score moyen",
                                    type: "number",
                                },
                                {
                                    name: "bestScore",
                                    title: "Meilleur score",
                                    type: "object",
                                    fields: [
                                        {
                                            name: "value",
                                            title: "Valeur",
                                            type: "number",
                                        },
                                        {
                                            name: "userId",
                                            title: "Id de l'utilisateur",
                                            type: "string",
                                        },
                                    ],
                                },
                                {
                                    name: "lowestScore",
                                    title: "Score le plus bas",
                                    type: "object",
                                    fields: [
                                        {
                                            name: "value",
                                            title: "Valeur",
                                            type: "number",
                                        },
                                        {
                                            name: "userId",
                                            title: "Id de l'utilisateur",
                                            type: "string",
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "success",
                    title: "Succès",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            fields: [
                                {
                                    name: "id",
                                    title: "Id",
                                    type: "string",
                                },
                                {
                                    name: "value",
                                    title: "Valeur",
                                    type: "number",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "averageSuccess",
                    title: "Succès moyens",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            fields: [
                                {
                                    name: "id",
                                    title: "Id",
                                    type: "string",
                                },
                                {
                                    name: "value",
                                    title: "Valeur",
                                    type: "number",
                                },
                            ],
                        },
                    ],
                },
            ],
        }),
    ],
    preview: {
        select: {
            name: "name",
            image: "images.primary.asset",
            id: "_id",
        },
        prepare(selection) {
            const { name, image, id } = selection;
            return {
                title: name,
                media: image,
                subtitle: `ID: ${id}`,
            };
        },
    },
});
