import { isValidEmail } from "@/app/lib/utils";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { FormEvent, useMemo, useState } from "react";
import { FaSpinner, FaLock } from "react-icons/fa";
import { AreReadyState } from "./Checkout";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { PricingDetails } from "@/app/types/sfn/stripe";

interface CheckoutFormProps {
    pricingDetails: PricingDetails;
    email: string;
    setAreReady: React.Dispatch<React.SetStateAction<AreReadyState>>;
    onSuccessUrl: string;
    productSlug: string;
    locale: string;
    onEmailSync?: (email: string) => Promise<void> | void;
}

export default function CheckoutForm({ pricingDetails, email, setAreReady, onSuccessUrl, productSlug, locale, onEmailSync }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const isDesktop = useMediaQuery("(min-width: 1024px)"); // tailwind "lg"

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

    const isEmailValid = isValidEmail(email);
    const formatAmount = (value?: number) => {
        if (typeof value !== "number" || !Number.isFinite(value)) return "";
        const normalized = Math.round(value * 100) / 100;
        const hasCents = Math.abs(normalized % 1) > 0;
        return new Intl.NumberFormat(locale === "fr" ? "fr-CH" : "en-US", {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
        }).format(normalized);
    };

    const return_url = useMemo(() => {
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || window.location.origin || "").replace(/\/$/, "");
        const successUrl = new URL(`${baseUrl}/${locale}/payment-success`);
        successUrl.searchParams.set("productSlug", productSlug);
        successUrl.searchParams.set("amount", String(pricingDetails?.amount ?? ""));
        successUrl.searchParams.set("currency", String(pricingDetails?.currency ?? ""));
        successUrl.searchParams.set("slug", onSuccessUrl || "/");
        return successUrl.toString();
    }, [locale, productSlug, pricingDetails?.amount, pricingDetails?.currency, onSuccessUrl]);

    // PaymentElement : tabs desktop, accordion mobile (ouverture par défaut)
    const paymentElementOptions: StripePaymentElementOptions = useMemo(
        () => ({
            // Force l’ordre : CB en premier (donc “ouverte” sur mobile avec defaultCollapsed:false)
            // Si TS se plaint pour google_pay, retire-le.
            paymentMethodOrder: ["card", "paypal", "google_pay"],

            layout: isDesktop
                ? "tabs"
                : {
                      type: "accordion",
                      defaultCollapsed: false, // ✅ ouvre le premier moyen (CB si “card” est en 1er)
                      spacedAccordionItems: true,
                  },
        }),
        [isDesktop],
    );

    const confirmPayment = async () => {
        if (!stripe || !elements) return;

        setErrorMessage(null);

        // Pour le flow “formulaire” (PaymentElement), Stripe recommande souvent submit() avant confirmPayment
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || "Oops! Something went wrong.");
            return;
        }

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url },
        });

        if (error) {
            setErrorMessage(error.message || "Oops! Something went wrong.");
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        await onEmailSync?.(email);
        await confirmPayment();
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white w-full">
            {/* ✅ Formulaire classique */}
            <PaymentElement
                options={paymentElementOptions}
                onReady={() => {
                    setIsPaymentElementReady(true);
                }}
                onChange={(event) => {
                    if (event.complete) {
                        setAreReady((state: AreReadyState) => ({ ...state, payment: true }));
                        setIsComplete(true);
                    } else {
                        setAreReady((state: AreReadyState) => ({ ...state, payment: false }));
                        setIsComplete(false);
                    }
                }}
            />

            {/* Message d’erreur plus clean */}
            {errorMessage && <div className="mt-3 text-sm text-red-600">{errorMessage}</div>}

            <button disabled={!stripe || loading || !isEmailValid || !isComplete || !isPaymentElementReady} className="btn btn-primary small w-full mt-4">
                {loading ? (
                    <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin text-neutral-600 h-6 w-6 mr-2" style={{ animationDuration: "2s" }} />
                        <span>{locale === "fr" ? "Traitement en cours..." : "Processing..."}</span>
                    </span>
                ) : (
                    `${locale === "fr" ? "Payer" : "Pay"} ${formatAmount(pricingDetails?.amount)} ${pricingDetails?.currency}`
                )}
            </button>

            {/* Micro UX rassurance */}
            <div className="mt-3 flex items-center justify-center text-xs text-neutral-500 gap-2">
                <FaLock className="text-neutral-400" />
                <span>{locale === "fr" ? "Paiement sécurisé via Stripe • Confirmation par email" : "Secure payment via Stripe • Email confirmation"}</span>
            </div>
        </form>
    );
}
