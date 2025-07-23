import { LESSONS_CREDITS_PERMISSIONS } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "product",
    title: "Produit",
    type: "document",
    fields: [
        defineField({
            name: "referenceKey",
            title: "Clé de référence",
            type: "string",
            options: { list: LESSONS_CREDITS_PERMISSIONS },
        }),
        defineField({
            name: "title",
            title: "Titre",
            type: "object",
            fields: [
                defineField({
                    name: "fr",
                    title: "Français",
                    type: "string",
                }),
                defineField({
                    name: "en",
                    title: "Anglais",
                    type: "string",
                }),
                defineField({
                    name: "es",
                    title: "Espagnol",
                    type: "string",
                }),
                defineField({
                    name: "pt",
                    title: "Portugais",
                    type: "string",
                }),
                defineField({
                    name: "tr",
                    title: "Turc",
                    type: "string",
                }),
            ],
            description: "2-3 mots dans l'idéal pour la mise en page.",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "object",
            fields: [
                defineField({
                    name: "fr",
                    title: "Français",
                    type: "string",
                }),
                defineField({
                    name: "en",
                    title: "Anglais",
                    type: "string",
                }),
                defineField({
                    name: "es",
                    title: "Espagnol",
                    type: "string",
                }),
                defineField({
                    name: "pt",
                    title: "Portugais",
                    type: "string",
                }),
                defineField({
                    name: "tr",
                    title: "Turc",
                    type: "string",
                }),
            ],
        }),
        defineField({
            name: "defaultLangage",
            title: "Langue par défaut",
            type: "string",
            options: {
                list: [
                    { value: "fr", title: "Français" },
                    { value: "en", title: "Anglais" },
                    { value: "es", title: "Espagnol" },
                    { value: "pt", title: "Portugais" },
                    { value: "tr", title: "Turc" },
                ],
            },
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "referenceKey",
                maxLength: 96,
            },
        }),
        defineField({
            name: "onSuccessUrl",
            title: "URL du bouton booking",
            type: "string",
        }),
        defineField({
            name: "maxQuantity",
            title: "Quantité maximale",
            type: "number",
            initialValue: 1,
        }),
        defineField({
            name: "minQuantity",
            title: "Quantité minimale",
            type: "number",
            initialValue: 1,
        }),
        defineField({
            name: "pricingDetails",
            title: "Détails de tarification",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "originalPrice",
                            title: "Prix d'origine",
                            type: "number",
                        }),
                        defineField({
                            name: "currency",
                            title: "Devise",
                            type: "string",
                            options: {
                                list: [
                                    { value: "EUR", title: "Euro (€)" },
                                    { value: "USD", title: "Dollar ($)" },
                                    { value: "CHF", title: "Franc suisse (CHF)" },
                                ],
                            },
                            initialValue: "CHF",
                        }),
                        defineField({
                            name: "plans",
                            title: "Plans",
                            type: "array",
                            of: [
                                {
                                    type: "object",
                                    fields: [
                                        defineField({
                                            name: "name",
                                            title: "Nom du plan",
                                            type: "string",
                                        }),
                                        defineField({
                                            name: "minimumQuantity",
                                            title: "Quantité minimale",
                                            type: "number",
                                            initialValue: 1,
                                        }),
                                        defineField({
                                            name: "maximumQuantity",
                                            title: "Quantité maximale",
                                            type: "number",
                                        }),
                                        defineField({
                                            name: "isCountingPreviousPurchases",
                                            title: "Compter les achats précédents",
                                            type: "boolean",
                                            initialValue: true,
                                        }),
                                        defineField({
                                            name: "discount",
                                            title: "Réduction",
                                            type: "object",
                                            fields: [
                                                defineField({
                                                    name: "discountValue",
                                                    title: "Valeur de la réduction",
                                                    type: "number",
                                                }),
                                                defineField({
                                                    name: "discountType",
                                                    title: "Type de réduction",
                                                    type: "string",
                                                    options: {
                                                        list: [
                                                            { value: "percentage", title: "Réduction en Pourcentage" },
                                                            { value: "flatDiscount", title: "Remise à montant fixe" },
                                                            { value: "newPrice", title: "Nouveau Montant" },
                                                        ],
                                                    },
                                                }),
                                                defineField({
                                                    name: "rounding",
                                                    title: "Arrondi",
                                                    type: "string",
                                                    options: {
                                                        list: [
                                                            { value: "round", title: "Arrondi à l'entier" },
                                                            { value: "none", title: "Aucun arrondi" },
                                                            { value: "decimal", title: "Arrondi au dixième" },
                                                        ],
                                                    },
                                                }),
                                            ],
                                        }),
                                    ],
                                },
                            ],
                        }),
                    ],
                },
            ],
        }),
        defineField({
            name: "paymentMode",
            title: "Mode de paiement",
            type: "string",
            options: {
                list: [
                    { value: "unique", title: "Paiement unique" },
                    { value: "subscription", title: "Abonnement" },
                ],
            },
            initialValue: "unique",
        }),
        defineField({
            name: "benefits",
            title: "Avantages",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "benefitType",
                            title: "Type d'avantage",
                            type: "string",
                            options: {
                                list: [
                                    { value: "lessons", title: "Leçons" },
                                    { value: "credits", title: "Crédits" },
                                    { value: "permission", title: "Accès" },
                                ],
                            },
                            description:
                                "Les crédits permettent de réserver des heures de cours privés ou d'accéder ponctuellement à un contenu du site. Une permission permet de débloquer des fonctionnalités de façon permanente.",
                        }),
                        defineField({
                            name: "referenceKey",
                            title: "Clé de référence",
                            type: "string",
                            options: { list: LESSONS_CREDITS_PERMISSIONS },
                            description: "La clé permet de spécifier l'achat concerné.",
                        }),
                        defineField({
                            name: "creditAmount",
                            title: "Crédit",
                            type: "number",
                            description: "La valeur s'il s'agit d'un crédit. Pour des leçons indiquer des minutes",
                        }),
                        defineField({
                            name: "accessDuration",
                            title: "Durée d'accès",
                            type: "number",
                            description: "La durée de l'effet en jours, s'il s'agit d'une permission. Si la valeur reste null, l'effet est permanent.",
                        }),
                    ],
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: "title.fr",
        },
        prepare(selection) {
            const { title } = selection;
            return { title };
        },
    },
});

/* 
fields: [
                defineField({
                    name: "prices",
                    title: "Tarifs",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            fields: [
                                defineField({
                                    name: "originalPrice",
                                    title: "Prix d'origine",
                                    type: "number",
                                }),
                                defineField({
                                    name: "currency",
                                    title: "Devise",
                                    type: "string",
                                    options: {
                                        list: [
                                            { value: "EUR", title: "Euro (€)" },
                                            { value: "USD", title: "Dollar ($)" },
                                            { value: "CHF", title: "Franc suisse (CHF)" },
                                        ],
                                    },
                                    initialValue: "CHF",
                                }),
                                defineField({
                                    name: "discounts",
                                    title: "Réductions",
                                    type: "array",
                                    of: [
                                        {
                                            type: "object",
                                            fields: [
                                                defineField({
                                                    name: "discountValue",
                                                    title: "Valeur de la réduction",
                                                    type: "number",
                                                }),
                                                defineField({
                                                    name: "discountType",
                                                    title: "Type de réduction",
                                                    type: "string",
                                                    options: {
                                                        list: [
                                                            { value: "percentage", title: "Réduction en Pourcentage" },
                                                            { value: "flatDiscount", title: "Remise à montant fixe" },
                                                            { value: "newPrice", title: "Nouveau Montant" },
                                                        ],
                                                    },
                                                }),
                                                defineField({
                                                    name: "minimumQuantity",
                                                    title: "Quantité minimale",
                                                    type: "number",
                                                }),
                                                defineField({
                                                    name: "maximumQuantity",
                                                    title: "Quantité maximale",
                                                    type: "number",
                                                }),
                                                defineField({
                                                    name: "rounding",
                                                    title: "Arrondi",
                                                    type: "string",
                                                    options: {
                                                        list: [
                                                            { value: "round", title: "Arrondi à l'entier" },
                                                            { value: "none", title: "Aucun arrondi" },
                                                            { value: "decimal", title: "Arrondi au dixième" },
                                                        ],
                                                    },
                                                }),
                                                defineField({
                                                    name: "isCountingPreviousPurchases",
                                                    title: "Compter les achats précédents",
                                                    type: "boolean",
                                                }),
                                            ],
                                        },
                                    ],
                                }),
                            ],
                        },
                    ],
                }),
            ],
*/
