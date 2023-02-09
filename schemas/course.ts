import { defineField, defineType } from "sanity";

export default defineType({
    name: "course",
    title: "Cours",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Titre",
            type: "string",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
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
        }),
        defineField({
            name: "categories",
            title: "Catégories",
            type: "array",
            of: [{ type: "reference", to: { type: "category" } }],
        }),
        defineField({
            name: "duration",
            title: "Durée",
            type: "number",
            description: "En minutes",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "display",
            title: "Affichage",
            type: "string",
            options: {
                list: [
                    { value: "primary", title: "Prioritaire" },
                    { value: "secondary", title: "Secondaire" },
                    { value: "hidden", title: "Aucun" },
                ],
            },
            initialValue: "secondary",
            description:
                "Un cours prioritaire sera mise en avant, par exemple il figurera sur la page d'accueil. Un cours secondaire apparaîtra seulement dans la liste des cours mis à disposition dans la page concernée. Les cours cachés ne seront pas visibles dans les listes, ce sont par exemple les vidéos de blog ou les vidéos offertes lors d'une souscription à la newsletter.",
        }),
        defineField({
            name: "videos",
            title: "Vidéos contenues",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "video" }],
                },
            ],
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
        defineField({
            name: "price",
            title: "Prix",
            type: "number",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
            description: "Le prix sans réduction.",
        }),
        defineField({
            name: "reduction",
            title: "Le prix réduit",
            type: "number",
            description: "Le prix avec la réduction. Si le champ reste nul, il n'y a pas de réduction.",
        }),
    ],
});
