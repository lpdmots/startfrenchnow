import { defineField, defineType } from "sanity";

export default defineType({
    name: "coupon",
    title: "Coupon",
    type: "document",
    fields: [
        defineField({
            name: "code",
            title: "Code",
            type: "string",
            description: "Code saisi par l'utilisateur (ex: BIENVENUE2026).",
            validation: (Rule) => Rule.required().min(3).max(64),
        }),
        defineField({
            name: "isActive",
            title: "Actif",
            type: "boolean",
            initialValue: true,
        }),
        defineField({
            name: "assignedUser",
            title: "Utilisateur assigné (optionnel)",
            type: "reference",
            to: [{ type: "user" }],
            description: "Si défini, seul cet utilisateur peut appliquer le coupon.",
        }),
        defineField({
            name: "maxUsesPerUser",
            title: "Nombre max d'utilisations par utilisateur",
            type: "number",
            initialValue: 1,
            validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
            name: "maxUsesGlobal",
            title: "Nombre max d'utilisations global",
            type: "number",
            description: "Laisser vide pour illimité.",
            validation: (Rule) => Rule.min(1),
        }),
        defineField({
            name: "stackable",
            title: "Cumulable avec réduction produit",
            type: "boolean",
            initialValue: false,
            description: "Si désactivé, le coupon n'est appliqué que s'il est plus avantageux que la réduction produit.",
        }),
        defineField({
            name: "validFrom",
            title: "Valide à partir du",
            type: "datetime",
        }),
        defineField({
            name: "validUntil",
            title: "Valide jusqu'au",
            type: "datetime",
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    if (!value) return true;
                    const parent = context.parent as { validFrom?: string } | undefined;
                    if (!parent?.validFrom) return true;
                    return new Date(value) > new Date(parent.validFrom) || "La date de fin doit être postérieure à la date de début.";
                }),
        }),
        defineField({
            name: "rules",
            title: "Règles",
            type: "array",
            description: "La première règle qui matche le produit est utilisée.",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "label",
                            title: "Label (optionnel)",
                            type: "string",
                        }),
                        defineField({
                            name: "products",
                            title: "Produits concernés",
                            type: "array",
                            of: [{ type: "reference", to: [{ type: "product" }] }],
                            validation: (Rule) => Rule.required().min(1),
                        }),
                        defineField({
                            name: "discountType",
                            title: "Type de réduction",
                            type: "string",
                            options: {
                                list: [
                                    { value: "percentage", title: "Réduction en pourcentage" },
                                    { value: "flatDiscount", title: "Remise à montant fixe" },
                                    { value: "newPrice", title: "Nouveau montant" },
                                ],
                            },
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "discountValue",
                            title: "Valeur (pourcentage)",
                            type: "number",
                            hidden: ({ parent }) => parent?.discountType !== "percentage",
                            validation: (Rule) =>
                                Rule.custom((value, context) => {
                                    const parent = context.parent as { discountType?: string } | undefined;
                                    if (parent?.discountType !== "percentage") return true;
                                    if (typeof value !== "number") return "La valeur est requise pour une réduction en pourcentage.";
                                    if (value <= 0) return "La valeur doit être supérieure à 0.";
                                    return true;
                                }),
                        }),
                        defineField({
                            name: "discountValuesByCurrency",
                            title: "Valeurs par devise (montant fixe / nouveau montant)",
                            type: "object",
                            hidden: ({ parent }) => parent?.discountType === "percentage",
                            fields: [
                                defineField({ name: "eur", title: "EUR", type: "number" }),
                                defineField({ name: "usd", title: "USD", type: "number" }),
                                defineField({ name: "chf", title: "CHF", type: "number" }),
                            ],
                            validation: (Rule) =>
                                Rule.custom((value, context) => {
                                    const parent = context.parent as { discountType?: string } | undefined;
                                    if (parent?.discountType === "percentage") return true;
                                    const data = value as { eur?: number; usd?: number; chf?: number } | undefined;
                                    const hasAtLeastOneAmount = [data?.eur, data?.usd, data?.chf].some((n) => typeof n === "number" && n >= 0);
                                    if (!hasAtLeastOneAmount) return "Indique au moins une devise pour ce type de réduction.";
                                    return true;
                                }),
                        }),
                        defineField({
                            name: "rounding",
                            title: "Arrondi",
                            type: "string",
                            initialValue: "none",
                            options: {
                                list: [
                                    { value: "round", title: "Arrondi à l'entier" },
                                    { value: "none", title: "Aucun arrondi (2 décimales)" },
                                    { value: "decimal", title: "Arrondi au dixième" },
                                ],
                            },
                        }),
                    ],
                    preview: {
                        select: {
                            label: "label",
                            discountType: "discountType",
                        },
                        prepare({ label, discountType }) {
                            return {
                                title: label || "Règle coupon",
                                subtitle: discountType || "Type inconnu",
                            };
                        },
                    },
                },
            ],
            validation: (Rule) => Rule.required().min(1),
        }),
    ],
    preview: {
        select: {
            title: "code",
            subtitle: "isActive",
        },
        prepare({ title, subtitle }) {
            return {
                title: title || "Coupon sans code",
                subtitle: subtitle ? "Actif" : "Inactif",
            };
        },
    },
});
