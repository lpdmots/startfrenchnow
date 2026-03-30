import { defineField, defineType } from "sanity";

export default defineType({
    name: "couponRedemption",
    title: "Coupon - Utilisation",
    type: "document",
    fields: [
        defineField({
            name: "couponRef",
            title: "Coupon",
            type: "reference",
            to: [{ type: "coupon" }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "couponCode",
            title: "Code coupon",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "status",
            title: "Statut",
            type: "string",
            initialValue: "consumed",
            options: {
                list: [
                    { value: "consumed", title: "Consommé" },
                    { value: "refunded", title: "Remboursé" },
                    { value: "canceled", title: "Annulé" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "stripePaymentId",
            title: "Stripe Payment ID",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "userRef",
            title: "Utilisateur",
            type: "reference",
            to: [{ type: "user" }],
        }),
        defineField({
            name: "userEmail",
            title: "Email utilisateur",
            type: "string",
        }),
        defineField({
            name: "productRef",
            title: "Produit",
            type: "reference",
            to: [{ type: "product" }],
        }),
        defineField({
            name: "productSlug",
            title: "Slug produit",
            type: "string",
        }),
        defineField({
            name: "quantity",
            title: "Quantité",
            type: "number",
            initialValue: 1,
        }),
        defineField({
            name: "currency",
            title: "Devise",
            type: "string",
            options: {
                list: [
                    { value: "EUR", title: "EUR" },
                    { value: "USD", title: "USD" },
                    { value: "CHF", title: "CHF" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "amountBeforeCoupon",
            title: "Montant avant coupon",
            type: "number",
        }),
        defineField({
            name: "amountAfterCoupon",
            title: "Montant après coupon",
            type: "number",
        }),
        defineField({
            name: "discountType",
            title: "Type de réduction",
            type: "string",
            options: {
                list: [
                    { value: "percentage", title: "Pourcentage" },
                    { value: "flatDiscount", title: "Montant fixe" },
                    { value: "newPrice", title: "Nouveau montant" },
                ],
            },
        }),
        defineField({
            name: "discountValue",
            title: "Valeur réduction",
            type: "number",
        }),
        defineField({
            name: "discountAmount",
            title: "Montant réduit",
            type: "number",
        }),
        defineField({
            name: "stackable",
            title: "Cumulable",
            type: "boolean",
        }),
        defineField({
            name: "appliedRuleIndex",
            title: "Index de règle appliquée",
            type: "number",
        }),
        defineField({
            name: "consumedAt",
            title: "Consommé le",
            type: "datetime",
            initialValue: () => new Date().toISOString(),
        }),
    ],
    preview: {
        select: {
            title: "couponCode",
            subtitle: "stripePaymentId",
        },
    },
});
