import { isValidEmail } from "@/app/lib/utils";
import { useStripe, useElements, PaymentElement, ExpressCheckoutElement } from "@stripe/react-stripe-js";
import type { StripeExpressCheckoutElementOptions, StripePaymentElementOptions } from "@stripe/stripe-js";
import { FormEvent, useMemo, useState } from "react";
import { FaSpinner, FaLock } from "react-icons/fa";
import { AreReadyState } from "./Checkout";
import useMediaQuery from "@/app/hooks/useMediaQuery";

export default function CheckoutForm({ pricingDetails, formData, setAreReady, onSuccessUrl, productSlug, locale }: any) {
    const stripe = useStripe();
    const elements = useElements();

    const isDesktop = useMediaQuery("(min-width: 1024px)"); // tailwind "lg"

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    // Masquer le bloc Express si aucun wallet dispo
    const [showExpress, setShowExpress] = useState(true);

    const isEmailValid = isValidEmail(formData.email);

    const return_url = useMemo(() => {
        return `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?productSlug=${productSlug}` + `&amount=${pricingDetails?.amount}&currency=${pricingDetails?.currency}&slug=${onSuccessUrl}`;
    }, [productSlug, pricingDetails?.amount, pricingDetails?.currency, onSuccessUrl]);

    // Wallet buttons (Apple Pay / Google Pay) : layout responsive
    const expressOptions: StripeExpressCheckoutElementOptions = useMemo(
        () => ({
            layout: isDesktop ? { maxColumns: 2, maxRows: 1, overflow: "never" } : { maxColumns: 1, maxRows: 2, overflow: "auto" },
            paymentMethods: { applePay: "always", googlePay: "always" },
        }),
        [isDesktop],
    );

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

    const confirmPayment = async (submitElementsFirst: boolean) => {
        if (!stripe || !elements) return;

        setErrorMessage(null);

        // Pour le flow “formulaire” (PaymentElement), Stripe recommande souvent submit() avant confirmPayment
        if (submitElementsFirst) {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setErrorMessage(submitError.message || "Oops! Something went wrong.");
                return;
            }
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
        await confirmPayment(true);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white w-full">
            {/* ✅ Boutons Apple/Google Pay (si dispo) */}
            {showExpress && (
                <>
                    <ExpressCheckoutElement
                        options={expressOptions}
                        onReady={(e: any) => {
                            // Cache le bloc si aucun moyen express dispo
                            const hasExpress = !!e?.availablePaymentMethods && (e.availablePaymentMethods.applePay || e.availablePaymentMethods.googlePay || e.availablePaymentMethods.link);

                            setShowExpress(!!hasExpress);

                            // Si l’express est dispo, on peut considérer “payment” prêt côté UX
                            if (hasExpress) {
                                setAreReady((s: AreReadyState) => ({ ...s, payment: true }));
                            }
                        }}
                        onConfirm={async () => {
                            if (!stripe || !elements) return;
                            setLoading(true);
                            await confirmPayment(false);
                            setLoading(false);
                        }}
                    />
                </>
            )}

            {/* ✅ Formulaire classique */}
            <PaymentElement
                options={paymentElementOptions}
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

            <button disabled={!stripe || loading || !isEmailValid || !isComplete} className="btn btn-primary small w-full mt-8">
                {loading ? (
                    <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin text-neutral-600 h-6 w-6 mr-2" style={{ animationDuration: "2s" }} />
                        <span>{locale === "fr" ? "Traitement en cours..." : "Processing..."}</span>
                    </span>
                ) : (
                    `PAY ${pricingDetails?.amount + " " + pricingDetails?.currency}`
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
