import { defineField, defineType } from "sanity";

export default defineType({
    name: "success",
    title: "Succès",
    type: "object",
    fields: [
        // image, title, text, order, color, validations
        defineField({
            name: "image",
            title: "Image",
            type: "image",
        }),
        defineField({
            name: "title",
            title: "Titre",
            type: "string",
        }),
        defineField({
            name: "text",
            title: "Texte",
            type: "storyContent",
        }),
        defineField({
            name: "order",
            title: "Ordre",
            type: "number",
        }),
        defineField({
            name: "color",
            title: "Couleur",
            type: "string",
            options: {
                list: [
                    //primary, secondary-1, secondary-2, secondary-3, secondary-4, secondary-5,
                    { title: "Primaire", value: "primary" },
                    { title: "Secondaire 1", value: "secondary-1" },
                    { title: "Secondaire 2", value: "secondary-2" },
                    { title: "Secondaire 3", value: "secondary-3" },
                    { title: "Secondaire 4", value: "secondary-4" },
                    { title: "Secondaire 5", value: "secondary-5" },
                ],
            },
        }),
        defineField({
            name: "validations",
            title: "Validations",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "validation" }],
                },
            ],
        }),
        defineField({
            name: "antagonistes",
            title: "Antagonistes",
            type: "array",
            of: [
                {
                    type: "success",
                },
            ],
        }),
        defineField({
            name: "showLocked",
            title: "Afficher si verrouillé",
            type: "boolean",
            initialValue: true,
        }),
    ],
});
