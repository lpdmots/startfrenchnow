import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

if (process.env.STRIPE_SECRET_KEY === undefined) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
});

const queryUser = `*[_type == "user" && email == $sessionEmail][0] { stripeCustomerId, _id, alias }`;

async function getOrCreateCustomer(sessionEmail: string): Promise<string> {
    const user = await client.fetch(queryUser, { sessionEmail });

    if (user && user.stripeCustomerId) {
        return user.stripeCustomerId;
    }

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

    if (user?._id) {
        await client.patch(user._id).set({ stripeCustomerId: customer.id }).commit();
    }

    return customer.id;
}

export async function POST(request: NextRequest) {
    try {
        const { paymentIntentId, email } = await request.json();

        const effectiveEmail = (email || "").trim().toLowerCase();
        if (!paymentIntentId || !effectiveEmail) {
            return NextResponse.json({ error: "Missing paymentIntentId or email" }, { status: 400 });
        }

        let customerId: string | undefined;
        let currentMetadata: Stripe.Metadata = {};
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (!paymentIntent.customer) {
                customerId = await getOrCreateCustomer(effectiveEmail);
            }
            currentMetadata = paymentIntent.metadata || {};
        } catch (error) {
            console.error("Unable to retrieve payment intent:", error);
        }

        const baseUpdate: Stripe.PaymentIntentUpdateParams = {
            receipt_email: effectiveEmail,
            metadata: { ...currentMetadata, email: effectiveEmail },
        };

        try {
            await stripe.paymentIntents.update(paymentIntentId, {
                ...baseUpdate,
                ...(customerId ? { customer: customerId } : {}),
            });
        } catch (error) {
            if (customerId) {
                await stripe.paymentIntents.update(paymentIntentId, baseUpdate);
            } else {
                throw error;
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
    }
}
