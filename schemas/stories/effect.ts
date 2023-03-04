import { defineField, defineType } from "sanity";

export default defineType({
    name: "effect",
    title: "Effet",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Nom de l'effet",
            type: "string",
            validation: (Rule) => Rule.required().warning("Ce champ est requis"),
        }),
    ],
});
