import { convertToSubcurrency } from "@/app/lib/utils";
import { getAmount } from "@/app/serverActions/stripeActions";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { ProductFetch } from "@/app/types/sfn/stripe";
import { groq } from "next-sanity";
import { getUserPurchases } from "@/app/serverActions/productActions";

if (process.env.STRIPE_SECRET_KEY === undefined) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
});

const queryUser = `*[_type == "user" && email == $sessionEmail][0] { stripeCustomerId, _id, alias }`;

const queryProduct = groq`
        *[_type=='product' && slug.current == $slug][0] 
    `;

const queryUserIdByEmail = groq`
    *[_type == "user" && lower(email) == $email][0]{
        _id
    }
`;

const queryMockExamPurchaseSnapshot = groq`
    *[_type == "user" && _id == $userId][0]{
        "remainingCredits": coalesce(credits[referenceKey == "mock_exam"][0].remainingCredits, 0),
        "ownedCompilations": count(examCompilations)
    }
`;

const queryActiveMockExamCompilationCount = groq`
    count(*[_type == "examCompilation" && isActive == true])
`;

async function getOrCreateCustomer(sessionEmail: string): Promise<string> {
    const user = await client.fetch(queryUser, { sessionEmail });

    if (user && user.stripeCustomerId) {
        return user.stripeCustomerId;
    }

    // Crée un customer Stripe même si le user n'existe pas encore côté Sanity
    const customer = await stripe.customers.create({
        email: sessionEmail,
        ...(user?._id
            ? {
                  metadata: {
                      userId: user._id,
                  },
              }
            : {}),
    });

    // Patch uniquement si user existe
    if (user?._id) {
        await client.patch(user._id).set({ stripeCustomerId: customer.id }).commit();
    }

    return customer.id;
}

export async function POST(request: NextRequest) {
    try {
        const { productSlug, quantity, currency, email, sessionEmail, userId } = await request.json();

        // Email “effectif” : si pas de session (guest), on utilise l’email du form
        const effectiveEmail = (sessionEmail || email || "").trim().toLowerCase();

        const product = (await client.fetch(queryProduct, { slug: productSlug })) as ProductFetch;
        const requestedQuantity = Number.parseInt(String(quantity || "1"), 10) || 1;

        if (product?.referenceKey === "mock_exam") {
            const activeCompilationCount = Number(await client.fetch<number>(queryActiveMockExamCompilationCount));

            if (!Number.isFinite(activeCompilationCount) || activeCompilationCount <= 0) {
                return NextResponse.json({ error: "Aucun examen blanc n'est disponible pour le moment." }, { status: 409 });
            }

            let targetUserId = String(userId || "").trim();
            if (!targetUserId && effectiveEmail) {
                const existingUser = await client.fetch<{ _id?: string } | null>(queryUserIdByEmail, { email: effectiveEmail });
                targetUserId = String(existingUser?._id || "").trim();
            }

            if (targetUserId) {
                const snapshot = await client.fetch<{ remainingCredits?: number; ownedCompilations?: number } | null>(queryMockExamPurchaseSnapshot, { userId: targetUserId });
                const remainingCredits = Number(snapshot?.remainingCredits || 0);
                const ownedCompilations = Number(snapshot?.ownedCompilations || 0);

                if (remainingCredits > 0) {
                    return NextResponse.json({ error: "Vous avez déjà un crédit disponible. Utilisez-le avant un nouvel achat." }, { status: 409 });
                }

                const totalAfterPurchase = ownedCompilations + remainingCredits + requestedQuantity;
                if (totalAfterPurchase > activeCompilationCount) {
                    return NextResponse.json(
                        {
                            error: "Impossible d'acheter plus de crédits que le nombre de templates disponibles.",
                        },
                        { status: 409 }
                    );
                }
            } else if (requestedQuantity > activeCompilationCount) {
                return NextResponse.json({ error: "Impossible d'acheter plus de crédits que le nombre de templates disponibles." }, { status: 409 });
            }
        }

        // ✅ Guest-safe : si pas de userId, on considère “pas d’achats précédents”
        const userPurchasedLesson = userId ? ((await getUserPurchases(userId, product.referenceKey)) ?? undefined) : undefined;

        const { pricingDetails, productInfos } = await getAmount(product, quantity, currency, userPurchasedLesson);

        const stripeCustomerId = effectiveEmail ? await getOrCreateCustomer(effectiveEmail) : undefined;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: convertToSubcurrency(pricingDetails.amount),
            currency: pricingDetails.currency,
            ...(effectiveEmail ? { receipt_email: effectiveEmail } : {}),
            ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
            automatic_payment_methods: { enabled: true },
            metadata: {
                productSlug,
                quantity,
                ...(effectiveEmail ? { email: effectiveEmail } : {}),
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret, pricingDetails, productInfos, paymentIntentId: paymentIntent.id });
    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
    }
}
