import { defineField, defineType } from "sanity";

export default defineType({
    name: "tabelVoc",
    title: "Vocabulaire",
    type: "document",
    fields: [
        defineField({
            title: "Titres",
            name: "titles",
            type: "string",
            description: "Les deux titres des colonnes séparés du symbole | ",
        }),
        defineField({
            title: "Couleur",
            name: "color",
            type: "string",
            options: {
                list: [
                    { value: "yellow", title: "Jaune" },
                    { value: "blue", title: "Bleu" },
                    { value: "red", title: "Rouge" },
                    { value: "purple", title: "Violet" },
                    { value: "green", title: "Vert" },
                ],
            },
            initialValue: "blue",
            description: "La couleur de fond de l'en-tête.",
        }),
        defineField({
            title: "Colonne 1",
            name: "column1",
            type: "string",
            description: "Les mots de la première colonne, séparés du symbole | ",
        }),
        defineField({
            title: "Colonne 2",
            name: "column2",
            type: "string",
            description: "Les mots de la seconde colonne, séparés du symbole | ",
        }),
    ],
});
