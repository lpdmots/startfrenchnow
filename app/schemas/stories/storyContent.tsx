import { defineType, defineArrayMember } from "sanity";
import { MdTranslate } from "react-icons/md";
import { BsGenderAmbiguous } from "react-icons/bs";
import { TbNumbers, TbSwitch2 } from "react-icons/tb";
import { ImInfo } from "react-icons/im";
import { AiOutlineFunction } from "react-icons/ai";

export default defineType({
    title: "Story Content",
    name: "storyContent",
    type: "array",
    of: [
        defineArrayMember({
            title: "Block",
            type: "block",
            // Styles let you set what your user can mark up blocks with. These
            // correspond with HTML tags, but you can set any title or value
            // you want and decide how you want to deal with it where you want to
            // use your content.
            styles: [
                { title: "Normal", value: "normal" },
                { title: "Title", value: "title" },
            ],
            lists: [{ title: "Bullet", value: "bullet" }],
            // Marks let you mark up inline text in the block editor.
            marks: {
                // Decorators usually describe a single property – e.g. a typographic
                // preference or highlighting by editors.
                decorators: [
                    { title: "Strong", value: "strong" },
                    { title: "Emphasis", value: "em" },
                ],
                annotations: [
                    {
                        title: "Traduction",
                        name: "translation",
                        type: "object",
                        icon: () => <MdTranslate />,
                        fields: [
                            {
                                title: "Traduction",
                                name: "translation",
                                type: "string",
                            },
                        ],
                    },
                    {
                        title: "Genre",
                        name: "gender",
                        type: "object",
                        icon: () => <BsGenderAmbiguous />,
                        fields: [
                            {
                                title: "Féminin",
                                name: "female",
                                type: "storyContent",
                            },
                        ],
                    },
                    {
                        title: "Fonction",
                        name: "withFunction",
                        type: "object",
                        icon: () => <AiOutlineFunction />,
                        fields: [
                            {
                                title: "Variable",
                                name: "variableComponent",
                                type: "reference",
                                to: [{ type: "variable" }],
                            },
                            {
                                title: "Nom de la variable",
                                name: "variableName",
                                type: "string",
                            },
                            {
                                title: "Nom de la fonction",
                                name: "functionName",
                                type: "string",
                                options: {
                                    list: [{ title: "String to bullet list", value: "toBulletList" }],
                                },
                            },
                        ],
                    },
                    {
                        title: "Conditions",
                        name: "withConditions",
                        type: "object",
                        icon: () => <TbSwitch2 />,
                        fields: [
                            {
                                title: "Liste des Conditions",
                                name: "conditionsBlock",
                                type: "array",
                                description: "Penser à prendre en compte le fait que les modifiers/accès/count ont déjà été appliqués",
                                of: [
                                    {
                                        type: "object",
                                        fields: [
                                            {
                                                title: "Code",
                                                name: "code",
                                                type: "string",
                                            },
                                            {
                                                title: "Conditions",
                                                name: "conditions",
                                                type: "array",
                                                of: [
                                                    {
                                                        type: "condition",
                                                    },
                                                ],
                                            },
                                            {
                                                title: "content",
                                                name: "content",
                                                type: "storyContent",
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                title: "Défaut",
                                name: "default",
                                type: "storyContent",
                            },
                            {
                                title: "Options",
                                name: "options",
                                type: "string",
                                options: {
                                    list: [
                                        { title: "Afficher toutes les conditions valide", value: "all" },
                                        { title: "Afficher la première condition valide", value: "first" },
                                        { title: "Afficher la dernière condition valide", value: "last" },
                                        { title: "Afficher une condition valide random", value: "random" },
                                    ],
                                },
                                initialValue: "first",
                            },
                        ],
                    },
                    {
                        title: "Count",
                        name: "count",
                        type: "object",
                        icon: () => <TbNumbers />,
                        fields: [
                            {
                                name: "component",
                                title: "Composant de référence",
                                type: "reference",
                                description:
                                    "Si aucun composant n'est sélectionné, c'est celui d'actualElementId qui est utilisé (avec un -1 car le count a déjà été incrémenté lors du traitement), si un composant est choisi, on considère que le count est juste.",
                                to: [{ type: "element" }, { type: "choice" }, { type: "extract" }],
                            },
                            {
                                title: "Contents",
                                name: "contents",
                                type: "array",
                                description: "Si plusieurs contents so valide, le choix se fait aléatoirement",
                                of: [
                                    {
                                        type: "object",
                                        fields: [
                                            {
                                                title: "Count",
                                                name: "count",
                                                type: "string",
                                                description: 'Plusieurs possibilités: "2", "2/5", "2,3,4,5", "3+"',
                                            },
                                            {
                                                title: "Content",
                                                name: "storyContent",
                                                type: "storyContent",
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        title: "Information",
                        name: "varInformation",
                        type: "object",
                        icon: () => <ImInfo />,
                        fields: [
                            {
                                title: "Variable",
                                name: "variable",
                                type: "reference",
                                to: [{ type: "variable" }],
                                validation: (Rule) => Rule.required(),
                            },
                        ],
                    },
                ],
            },
        }),
    ],
});
