import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { claimPendingPurchases } from "@/app/lib/claimPendingPurchases";
import { resolveAuthLocale } from "@/app/lib/authMailMessages";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-09-30.acacia",
});

export const runtime = "nodejs";

const queryUserByEmail = `*[_type == "user" && lower(email) == $email][0]{
  _id, email, isActive
}`;

const queryProduct = `*[_type == "product" && slug.current == $productSlug][0]{
  _id,
  referenceKey,
  benefits[]{
    benefitType,
    referenceKey,
    creditAmount,
    accessDuration
  }
}`;

function uuid() {
    return globalThis.crypto.randomUUID();
}

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature") as string;
    let event: Stripe.Event;

    try {
        const body = await req.text();
        event = await stripe.webhooks.constructEventAsync(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err) {
        const message = `Erreur de vérification de la signature du webhook : ${(err as Error).message}`;
        console.error(message);
        return new NextResponse(message, { status: 400 });
    }

    // On ne traite que le paiement confirmé
    if (event.type !== "payment_intent.succeeded") {
        return new NextResponse("Événement non traité", { status: 200 });
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const productSlug = paymentIntent.metadata?.productSlug;
    const quantityRaw = paymentIntent.metadata?.quantity;
    const metadataEmail = paymentIntent.metadata?.email;
    const metadataLocale = paymentIntent.metadata?.locale;

    const receiptEmail = paymentIntent.receipt_email || undefined;
    const buyerEmail = (metadataEmail || receiptEmail || "").trim().toLowerCase();

    const stripePaymentId = paymentIntent.id;
    const stripeCustomerId = typeof paymentIntent.customer === "string" ? paymentIntent.customer : undefined;
    const locale = resolveAuthLocale(metadataLocale);

    const qty = Number.parseInt(String(quantityRaw || "1"), 10) || 1;

    // ⚠️ Si metadata/email manquent, un retry Stripe ne corrigera pas le problème → on log + 200
    if (!buyerEmail) {
        console.error("Webhook: email manquant (metadata.email ou receipt_email).", {
            stripePaymentId,
        });
        return new NextResponse("Ignored", { status: 200 });
    }

    if (!productSlug) {
        console.error("Webhook: productSlug manquant dans metadata.", { stripePaymentId });
        return new NextResponse("Ignored", { status: 200 });
    }

    try {
        // 1) Récup produit + benefits (snapshot)
        const product = await client.fetch(queryProduct, { productSlug });

        // Idem : si produit introuvable, retry ne changera rien → log + 200
        if (!product?._id || !Array.isArray(product?.benefits) || product.benefits.length === 0) {
            console.error("Webhook: produit introuvable ou benefits vides", {
                productSlug,
                stripePaymentId,
            });
            return new NextResponse("Ignored", { status: 200 });
        }

        // 2) Idempotence béton : ID déterministe + createIfNotExists
        const pendingId = `pendingPurchase_${stripePaymentId}`;

        const pendingDoc = {
            _id: pendingId,
            _type: "pendingPurchase",
            email: buyerEmail,
            stripePaymentId,
            stripeCustomerId,
            locale,
            purchasedAt: new Date(paymentIntent.created * 1000).toISOString(),
            status: "paid",
            items: [
                {
                    _key: uuid(),
                    productRef: { _type: "reference", _ref: product._id },
                    referenceKey: product.referenceKey,
                    quantity: qty,
                    benefitsSnapshot: (product.benefits || []).map((b: any) => ({
                        _key: uuid(),
                        benefitType: b.benefitType,
                        referenceKey: b.referenceKey,
                        creditAmount: b.creditAmount,
                        accessDuration: b.accessDuration ?? null,
                    })),
                },
            ],
        };

        // Si Stripe envoie 2 fois en parallèle, un seul doc sera créé
        await client.createIfNotExists(pendingDoc);

        // 3) Optionnel : si user existe déjà et actif → claim immédiatement
        console.log("[webhook] buyerEmail:", buyerEmail);
        const dbUser = await client.fetch(queryUserByEmail, { email: buyerEmail });
        console.log("[webhook] dbUser:", dbUser);

        if (dbUser?._id) {
            console.log("[webhook] isActive:", dbUser.isActive);
        }

        if (dbUser?._id && dbUser?.isActive === true) {
            try {
                const res = await claimPendingPurchases({ email: buyerEmail, userId: dbUser._id });
                console.log("[webhook] claim result:", res);
            } catch (e) {
                console.error("claimPendingPurchases (webhook) failed:", e);
            }
        }

        return new NextResponse("Webhook traité avec succès", { status: 200 });
    } catch (error) {
        console.error("Erreur webhook:", error);
        // Ici, on garde 500 : un retry Stripe peut aider si c'est une panne temporaire
        return new NextResponse("Erreur lors du traitement du webhook", { status: 500 });
    }
}
