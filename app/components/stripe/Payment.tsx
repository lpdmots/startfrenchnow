import { Elements } from "@stripe/react-stripe-js";
import { StripeElementLocale, loadStripe } from "@stripe/stripe-js";
import { PricingDetails, ProductInfos } from "@/app/types/sfn/stripe";
import { useEffect, useState, useMemo } from "react";
import { AreReadyState } from "./Checkout";
import CheckoutForm from "./CheckoutForm";
import { useTranslations } from "next-intl";

interface FormData {
    email: string;
    firstName: string;
    lastName: string;
}

interface PaymentProps {
    productSlug: string;
    quantity: string;
    currency: string;
    locale: string;
    formData: FormData;
    sessionEmail: string | undefined;
    setAreReady: React.Dispatch<React.SetStateAction<AreReadyState>>;
    userId: string;
}

export const Payment = ({ productSlug, quantity, currency, locale, formData, sessionEmail, setAreReady, userId }: PaymentProps) => {
    const t = useTranslations();

    // Charge Stripe uniquement au montage du composant (pas au chargement du module)
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
    const stripePromise = useMemo(() => (pk ? loadStripe(pk) : null), [pk]);

    if (!pk) {
        // Message propre en dev si la clé manque
        return <div>Stripe public key manquante (NEXT_PUBLIC_STRIPE_PUBLIC_KEY)</div>;
    }

    const { errorIntentMessage, clientSecret, pricingDetails, productInfos } = usePaymentIntent(productSlug, quantity, currency, formData, sessionEmail, userId);

    if (errorIntentMessage) {
        return (
            <div className="min-w-56 flex items-center justify-center">
                <p className="mb-0">{errorIntentMessage}</p>
            </div>
        );
    }

    if (!clientSecret || !pricingDetails || !productInfos) return <div>{t("loading")}</div>;

    return (
        <div className="flex items-center w-full justify-center">
            {clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret, locale: locale as StripeElementLocale | undefined }}>
                    <CheckoutForm pricingDetails={pricingDetails} setAreReady={setAreReady} formData={formData} onSuccessUrl={productInfos.onSuccessUrl} />
                </Elements>
            )}
        </div>
    );
};

const usePaymentIntent = (productSlug: string, quantity: string, currency: string, formData: FormData, sessionEmail: string | undefined, userId: string) => {
    const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(null);
    const [productInfos, setProductInfos] = useState<null | ProductInfos>(null);
    const [errorIntentMessage, setErrorIntentMessage] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        if (!formData.email || !sessionEmail) return;
        setClientSecret("");

        fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productSlug, quantity, currency, sessionEmail, userId, ...formData }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to create payment intent");
                return res.json();
            })
            .then((data) => {
                if (data.clientSecret && data.pricingDetails && data.productInfos) {
                    setClientSecret(data.clientSecret);
                    setPricingDetails(data.pricingDetails);
                    setProductInfos(data.productInfos);
                } else {
                    throw new Error("Invalid data from server");
                }
            })
            .catch((error) => {
                setErrorIntentMessage(error.message);
            });
    }, [productSlug, quantity, currency, formData.email, sessionEmail]);

    return { pricingDetails, productInfos, errorIntentMessage, clientSecret };
};
