import { isValidEmail } from "@/app/lib/utils";
import { PricingDetails } from "@/app/types/sfn/stripe";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { AreReadyState } from "./Checkout";

interface FormData {
    email: string;
    firstName: string;
    lastName: string;
}

interface CheckoutFormProps {
    pricingDetails: PricingDetails | null;
    setAreReady: React.Dispatch<React.SetStateAction<AreReadyState>>;
    onSuccessUrl: string;
    formData: FormData;
}

export default function CheckoutForm({ pricingDetails, formData, setAreReady, onSuccessUrl }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const isEmailValid = isValidEmail(formData.email);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) return;

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError?.message || "Oops! Something went wrong.");
            setLoading(false);
            return;
        }

        const return_url = `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?amount=${pricingDetails?.amount}&currency=${pricingDetails?.currency}&slug=${onSuccessUrl}`;

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url,
            },
        });

        if (error) {
            setErrorMessage(error?.message || "Oops! Something went wrong.");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white w-full">
            <PaymentElement
                onChange={(event) => {
                    if (event.complete) {
                        setAreReady((state) => ({ ...state, payment: true }));
                        setIsComplete(true);
                    } else {
                        setAreReady((state) => ({ ...state, payment: false }));
                        setIsComplete(false);
                    }
                }}
            />

            {errorMessage && <div>{errorMessage}</div>}

            <button disabled={!stripe || loading || !isEmailValid || !isComplete} className="btn btn-primary small w-full mt-8">
                {loading ? (
                    <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin text-neutral-600 h-6 w-6 mr-2" style={{ animationDuration: "2s" }} />
                        <span>Processing...</span>
                    </span>
                ) : (
                    `PAY ${pricingDetails?.amount + " " + pricingDetails?.currency}`
                )}
            </button>
        </form>
    );
}
