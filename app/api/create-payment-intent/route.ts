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
