import { Elements } from "@stripe/react-stripe-js";
import { StripeElementLocale, loadStripe } from "@stripe/stripe-js";
import { CouponFeedback, PricingDetails, ProductInfos } from "@/app/types/sfn/stripe";
import { useEffect, useMemo, useRef, useState } from "react";
import { AreReadyState } from "./Checkout";
import CheckoutForm from "./CheckoutForm";
import { useTranslations } from "next-intl";

interface PaymentProps {
    productSlug: string;
    quantity: string;
    currency: string;
    locale: string;
    email: string;
    sessionEmail: string | undefined;
    setAreReady: React.Dispatch<React.SetStateAction<AreReadyState>>;
    userId?: string;
    onPaymentIntentReady?: (paymentIntentId: string) => void;
    onEmailSync?: (email: string) => Promise<void> | void;
    couponCode?: string;
    onPricingDataReady?: (pricingDetails: PricingDetails, productInfos: ProductInfos) => void;
    onCouponFeedback?: (feedback: CouponFeedback | null) => void;
}

export const Payment = ({ productSlug, quantity, currency, locale, email, sessionEmail, setAreReady, userId, onPaymentIntentReady, onEmailSync, couponCode, onPricingDataReady, onCouponFeedback }: PaymentProps) => {
    const t = useTranslations();

    // Charge Stripe uniquement au montage du composant (pas au chargement du module)
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
    const stripePromise = useMemo(() => (pk ? loadStripe(pk) : null), [pk]);

    const { errorIntentMessage, clientSecret, pricingDetails, productInfos, paymentIntentId, couponFeedback } = usePaymentIntent(productSlug, quantity, currency, locale, email, sessionEmail, userId, couponCode);

    useEffect(() => {
        if (paymentIntentId) {
            onPaymentIntentReady?.(paymentIntentId);
        }
    }, [paymentIntentId, onPaymentIntentReady]);

    useEffect(() => {
        if (pricingDetails && productInfos) {
            onPricingDataReady?.(pricingDetails, productInfos);
        }
    }, [pricingDetails, productInfos, onPricingDataReady]);

    useEffect(() => {
        onCouponFeedback?.(couponFeedback);
    }, [couponFeedback, onCouponFeedback]);

    const elementsOptions = useMemo(
        () => ({
            clientSecret,
            locale: locale as StripeElementLocale | undefined,
        }),
        [clientSecret, locale],
    );

    if (!pk) {
        // Message propre en dev si la clé manque
        return <div>Stripe public key manquante (NEXT_PUBLIC_STRIPE_PUBLIC_KEY)</div>;
    }

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
                <Elements key={clientSecret} stripe={stripePromise} options={elementsOptions}>
                    <CheckoutForm
                        pricingDetails={pricingDetails}
                        setAreReady={setAreReady}
                        email={email}
                        onSuccessUrl={productInfos.onSuccessUrl}
                        productSlug={productSlug}
                        locale={locale}
                        onEmailSync={onEmailSync}
                    />
                </Elements>
            )}
        </div>
    );
};

const usePaymentIntent = (productSlug: string, quantity: string, currency: string, locale: string, email: string, sessionEmail: string | undefined, userId?: string, couponCode?: string) => {
    const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(null);
    const [productInfos, setProductInfos] = useState<null | ProductInfos>(null);
    const [couponFeedback, setCouponFeedback] = useState<CouponFeedback | null>(null);
    const [errorIntentMessage, setErrorIntentMessage] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState("");
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const emailRef = useRef(email);
    const sessionEmailRef = useRef(sessionEmail);
    const requestIdRef = useRef(0);

    useEffect(() => {
        emailRef.current = email;
    }, [email]);

    useEffect(() => {
        sessionEmailRef.current = sessionEmail;
    }, [sessionEmail]);

    useEffect(() => {
        const currentRequestId = ++requestIdRef.current;
        const abortController = new AbortController();

        setClientSecret("");
        setPaymentIntentId(null);
        setPricingDetails(null);
        setProductInfos(null);
        setCouponFeedback(null);
        setErrorIntentMessage(null);

        (async () => {
            try {
                const res = await fetch("/api/create-payment-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: abortController.signal,
                    body: JSON.stringify({
                        productSlug,
                        quantity,
                        currency,
                        locale,
                        sessionEmail: sessionEmailRef.current,
                        email: emailRef.current,
                        userId,
                        couponCode,
                    }),
                });

                let data: any = null;
                try {
                    data = await res.json();
                } catch {
                    data = null;
                }

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to create payment intent");
                }

                if (currentRequestId !== requestIdRef.current || abortController.signal.aborted) {
                    return;
                }

                if (data?.clientSecret && data?.pricingDetails && data?.productInfos) {
                    setClientSecret(data.clientSecret);
                    setPricingDetails(data.pricingDetails);
                    setProductInfos(data.productInfos);
                    setPaymentIntentId(data.paymentIntentId || null);
                    setCouponFeedback(data?.couponFeedback || null);
                    return;
                }

                throw new Error("Invalid data from server");
            } catch (error) {
                if (abortController.signal.aborted || currentRequestId !== requestIdRef.current) {
                    return;
                }
                const message = error instanceof Error && error.message ? error.message : "Failed to create payment intent";
                setErrorIntentMessage(message);
            }
        })();

        return () => {
            abortController.abort();
        };
    }, [productSlug, quantity, currency, locale, userId, couponCode]);

    return { pricingDetails, productInfos, errorIntentMessage, clientSecret, paymentIntentId, couponFeedback };
};
