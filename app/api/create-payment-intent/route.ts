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

    // Si `stripeCustomerId` n'existe pas, crée un nouveau client Stripe
    const customer = await stripe.customers.create({
        email: sessionEmail,
        metadata: {
            userId: user._id,
        },
    });

    await client.patch(user._id).set({ stripeCustomerId: customer.id }).commit();

    return customer.id;
}

export async function POST(request: NextRequest) {
    try {
        const { productSlug, quantity, currency, email, sessionEmail, userId, firstName, lastName } = await request.json();
        const product = (await client.fetch(queryProduct, { slug: productSlug })) as ProductFetch;
        const userPurchasedLesson = await getUserPurchases(userId, product.referenceKey);

        const { pricingDetails, productInfos } = await getAmount(product, quantity, currency, userPurchasedLesson);

        const stripeCustomerId = await getOrCreateCustomer(sessionEmail);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: convertToSubcurrency(pricingDetails.amount),
            currency: pricingDetails.currency,
            receipt_email: sessionEmail,
            customer: stripeCustomerId,
            automatic_payment_methods: { enabled: true },
            metadata: { productSlug, quantity, email, firstName, lastName },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret, pricingDetails, productInfos, paymentIntentId: paymentIntent.id });
    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
    }
}
