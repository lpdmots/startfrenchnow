import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { ProductFetch } from "@/app/types/sfn/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-09-30.acacia" });

// Désactiver `bodyParser` et définir le runtime en edge
export const runtime = "edge";

const queryUser = `*[_type == "user" && email == $sessionEmail][0] { 
    stripeCustomerId, 
    _id, 
    alias, 
    "firstName": coalesce(firstName, null),
    "lastName": coalesce(lastName, null)
}`;

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature") as string;
    let event: Stripe.Event;

    try {
        // Utiliser `req.text()` pour obtenir le corps brut de la requête
        const body = await req.text();
        // Vérifie la signature du webhook
        event = await stripe.webhooks.constructEventAsync(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err) {
        const message = `Erreur de vérification de la signature du webhook : ${(err as Error).message}`;
        console.error(message);
        return new NextResponse(message, { status: 400 });
    }

    // Traitez l'événement `payment_intent.succeeded`
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const sessionEmail = paymentIntent.receipt_email;
        const productSlug = paymentIntent.metadata.productSlug;
        const quantity = paymentIntent.metadata.quantity;
        const email = paymentIntent.metadata.email;
        const firstName = paymentIntent.metadata.firstName;
        const lastName = paymentIntent.metadata.lastName;

        try {
            const user = await client.fetch(queryUser, { sessionEmail });
            const product = await client.fetch(`*[_type == "product" && slug.current == $productSlug][0]{ _id, benefits }`, { productSlug });
            if (!user || !product) {
                return new NextResponse("Utilisateur ou produit non trouvé", { status: 404 });
            }

            if (user && product) {
                await applyPurchaseEffect(quantity, user, product);
                await addAliasToUser(sessionEmail || "", email, user);
                await updateUserIfFieldsAreEmpty(user, firstName, lastName);
            }

            return new NextResponse("Webhook traité avec succès", { status: 200 });
        } catch (error) {
            console.error("Erreur lors de l'appel de l'API pour appliquer l'effet :", error);
            return new NextResponse("Erreur lors du traitement du webhook", { status: 500 });
        }
    } else {
        return new NextResponse("Événement non traité", { status: 400 });
    }
}

async function applyPurchaseEffect(quantity: string, user: { _id: string; alias?: string[] }, product: ProductFetch) {
    const benefits = product.benefits;
    for (const benefit of benefits) {
        if (benefit.benefitType === "lessons") {
            const newMinutes = benefit.creditAmount * parseInt(quantity);

            const existingLesson = await client
                .fetch(`*[_type == "user" && _id == $userId][0] { lessons }`, { userId: user._id })
                .then((res) => res.lessons?.find((lesson: any) => lesson.eventType === benefit.referenceKey));

            if (existingLesson) {
                // Si le `eventType` existe déjà, mettre à jour `totalPurchasedMinutes`
                await client
                    .patch(user._id)
                    .set({
                        [`lessons[_key=="${existingLesson._key}"].totalPurchasedMinutes`]: existingLesson.totalPurchasedMinutes + newMinutes,
                    })
                    .commit();
            } else {
                // Sinon, ajouter un nouvel objet `lesson`
                await client
                    .patch(user._id)
                    .setIfMissing({ lessons: [] })
                    .append("lessons", [{ eventType: benefit.referenceKey, totalPurchasedMinutes: newMinutes }])
                    .commit({ autoGenerateArrayKeys: true });
            }
        } else if (benefit.benefitType === "credits") {
            // Appliquer l'effet de l'achat de crédits
        } else if (benefit.benefitType === "permission") {
            // Appliquer l'effet de l'achat de permission
        }
    }
}

async function addAliasToUser(sessionEmail: string, email: string, user: { _id: string; alias?: string[] }) {
    if (sessionEmail !== email && !(user.alias || []).includes(email)) {
        await client.patch(user._id).setIfMissing({ alias: [] }).append("alias", [email]).commit();
    }
}

async function updateUserIfFieldsAreEmpty(user: { firstName: string | null; lastName: string | null; _id: string }, newFirstName: string, newLastName: string) {
    const { firstName, lastName, _id } = user || {};

    if (firstName || lastName) {
        console.log("Les champs firstName ou lastName sont déjà définis, mise à jour ignorée.");
        return;
    }

    const patch = client.patch(_id);

    if (!firstName) {
        patch.set({ firstName: newFirstName });
    }
    if (!lastName) {
        patch.set({ lastName: newLastName });
    }

    const result = await patch.commit();
    console.log("Utilisateur mis à jour :", result);
}
