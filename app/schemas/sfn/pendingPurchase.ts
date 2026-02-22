import { LESSONS_CREDITS_PERMISSIONS } from "@/app/lib/constantes";
import { defineField, defineType } from "sanity";

export default defineType({
    name: "pendingPurchase",
    title: "Achat en attente",
    type: "document",
    fields: [
        defineField({
            name: "email",
            title: "Email",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "stripePaymentId",
            title: "Stripe Payment ID",
            description: "ID unique côté Stripe (PaymentIntent id ou Checkout Session id).",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "stripeCustomerId",
            title: "Stripe Customer ID",
            type: "string",
        }),

        defineField({
            name: "status",
            title: "Statut",
            type: "string",
            initialValue: "paid",
            options: {
                list: [
                    { title: "Paid", value: "paid" },
                    { title: "Assigned", value: "assigned" },
                    { title: "Refunded", value: "refunded" },
                    { title: "Canceled", value: "canceled" },
                ],
                layout: "radio",
                direction: "horizontal",
            },
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "purchasedAt",
            title: "Acheté le",
            type: "datetime",
            initialValue: () => new Date().toISOString(),
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: "items",
            title: "Articles",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        // ref optionnelle (mais très pratique pour l’admin)
                        defineField({
                            name: "productRef",
                            title: "Produit",
                            type: "reference",
                            to: [{ type: "product" }],
                        }),

                        // pratique pour requêtes rapides, même sans deref productRef
                        defineField({
                            name: "referenceKey",
                            title: "Clé de référence",
                            type: "string",
                            options: { list: LESSONS_CREDITS_PERMISSIONS },
                        }),

                        defineField({
                            name: "quantity",
                            title: "Quantité",
                            type: "number",
                            initialValue: 1,
                        }),

                        // ✅ snapshot des benefits au moment de l’achat (structure identique au product)
                        defineField({
                            name: "benefitsSnapshot",
                            title: "Avantages (snapshot)",
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
                                            description: "Durée en jours si permission. Si null, l'effet est permanent.",
                                        }),
                                    ],
                                },
                            ],
                            validation: (Rule) => Rule.required().min(1),
                        }),
                    ],
                },
            ],
            validation: (Rule) => Rule.required().min(1),
        }),

        defineField({
            name: "assignedTo",
            title: "Assigné à",
            type: "reference",
            to: [{ type: "user" }],
        }),

        defineField({
            name: "assignedAt",
            title: "Assigné le",
            type: "datetime",
        }),
    ],
});
