"use client";
import { YourPurchase } from "@/app/components/stripe/YourPurchase";
import { useCallback, useEffect, useState } from "react";
import { CouponFeedback, PricingDetails, ProductFetch, ProductInfos } from "@/app/types/sfn/stripe";
import { ContactInformations } from "./ContactInformations";
import { getAmount } from "@/app/serverActions/stripeActions";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { PriceLayout } from "./PriceLayout";
import { useSession } from "next-auth/react";
import { Separator } from "../ui/separator";
import { isValidEmail } from "@/app/lib/utils";
import { getUserPurchases } from "@/app/serverActions/productActions";
import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
const Payment = dynamic(() => import("./Payment").then((m) => m.Payment), { ssr: false });

interface CheckoutProps {
    locale: "fr" | "en";
    productSlug: string;
    quantity: string;
    defaultCurrency?: "CHF" | "EUR" | "USD";
    prefilledCouponCode?: string;
}

export type AreReadyState = {
    yourPurchase: boolean;
    contactInformations: boolean;
    payment: boolean;
};

const queryProduct = groq`
        *[_type=='product' && slug.current == $slug][0] 
    `;

const normalizeCouponCode = (raw?: string | null) =>
    String(raw || "")
        .trim()
        .toUpperCase();

export default function Checkout({ locale, productSlug, quantity: originalQuantity, defaultCurrency = "CHF", prefilledCouponCode }: CheckoutProps) {
    const { data: session } = useSession();
    const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(null);
    const [productInfos, setProductInfos] = useState<null | ProductInfos>(null);
    const [formData, setFormData] = useState({
        email: "",
    });
    const { email } = formData;
    const t = useTranslations();

    const [quantity, setQuantity] = useState(originalQuantity);
    const [currency, setCurrency] = useState<"CHF" | "EUR" | "USD">(defaultCurrency);
    const sessionEmail = session?.user?.email;
    const [areReady, setAreReady] = useState<AreReadyState>({ yourPurchase: true, contactInformations: false, payment: false });
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [lastSyncedEmail, setLastSyncedEmail] = useState<string | null>(null);
    const [couponInput, setCouponInput] = useState(() => normalizeCouponCode(prefilledCouponCode));
    const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>(() => normalizeCouponCode(prefilledCouponCode) || undefined);
    const [couponFeedback, setCouponFeedback] = useState<CouponFeedback | null>(null);

    const amount = pricingDetails?.amount;
    const initialAmount = pricingDetails?.initialAmount;

    useEffect(() => {
        const sessEmail = session?.user?.email;
        if (sessEmail && !formData.email) {
            setFormData((state) => ({ ...state, email: sessEmail }));
        }
    }, [session, formData.email]);

    useEffect(() => {
        setAreReady((state) => ({ ...state, contactInformations: isValidEmail(email) }));
    }, [email]);

    useEffect(() => {
        setLastSyncedEmail(null);
    }, [paymentIntentId]);

    useEffect(() => {
        setAreReady((state) => ({ ...state, payment: false }));
    }, [productSlug, quantity, currency, appliedCouponCode]);

    useEffect(() => {
        const normalizedPrefilledCouponCode = normalizeCouponCode(prefilledCouponCode);
        if (!normalizedPrefilledCouponCode) return;
        setCouponInput(normalizedPrefilledCouponCode);
        setAppliedCouponCode(normalizedPrefilledCouponCode);
        setCouponFeedback(null);
    }, [prefilledCouponCode]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const product = (await client.fetch(queryProduct, { slug: productSlug })) as ProductFetch;

            const sessionUserId = session?.user?._id;
            const userPurchasedLesson = sessionUserId ? await getUserPurchases(sessionUserId, product.referenceKey) : undefined;

            const data = await getAmount(product, quantity, currency, userPurchasedLesson ?? undefined);

            if (cancelled) return;
            setPricingDetails(data.pricingDetails);
            setProductInfos(data.productInfos);
        })();

        return () => {
            cancelled = true;
        };
    }, [productSlug, quantity, currency, session?.user?._id]);

    const isLoading = !pricingDetails || !productInfos;
    const getIsReady = (name: string) => {
        return areReady[name as keyof AreReadyState];
    };

    const syncEmailToStripe = useCallback(
        async (nextEmail: string) => {
            const normalized = nextEmail.trim().toLowerCase();
            if (!paymentIntentId || !isValidEmail(normalized)) return;
            if (normalized === lastSyncedEmail) return;

            try {
                const res = await fetch("/api/update-payment-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        paymentIntentId,
                        email: normalized,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.error || "Failed to update payment intent");
                }

                setLastSyncedEmail(normalized);
            } catch (error) {
                console.error("Failed to sync email to Stripe:", error);
            }
        },
        [paymentIntentId, lastSyncedEmail],
    );

    const applyCoupon = useCallback(() => {
        const normalized = couponInput.trim().toUpperCase();
        setCouponFeedback(null);

        if (!normalized) {
            setAppliedCouponCode(undefined);
            return;
        }

        setAppliedCouponCode(normalized);
    }, [couponInput]);

    const removeCoupon = useCallback(() => {
        setCouponInput("");
        setAppliedCouponCode(undefined);
        setCouponFeedback(null);
    }, []);

    return (
        <div className="grid grid-cols-6 gap-4 lg:gap-8 w-full min-h-[65vh]">
            <div className="col-span-6 lg:col-span-4">
                <div className="w-full flex flex-col gap-4">
                    <div className="w-full">
                        <div className="flex w-full justify-between items-center color-neutral-700 gap-6">
                            <h3 className="text-lg md:text-2xl text-neutral-700 text-left !font-bold flex items-center mb-4">
                                {getIsReady("yourPurchase") ? (
                                    <FaCheckCircle className="text-2xp text-secondary-2 mr-2 lg:mr-4" />
                                ) : (
                                    <FaTimesCircle className="text-2xp text-neutral-400 mr-2 lg:mr-4" />
                                )}
                                {t("yourPurchaseTitle")}
                            </h3>
                            {isLoading && <FaSpinner className="animate-spin text-blue-500 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />}
                        </div>
                        <div className="w-full mb-4">
                            {!isLoading && (
                                <YourPurchase
                                    productInfos={productInfos as ProductInfos}
                                    pricingDetails={pricingDetails as PricingDetails}
                                    locale={locale}
                                    setQuantity={setQuantity}
                                    setCurrency={setCurrency}
                                    quantity={quantity}
                                    currency={currency}
                                />
                            )}
                        </div>
                        <div className="w-full mb-6">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    value={couponInput}
                                    onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && !appliedCouponCode) {
                                            event.preventDefault();
                                            applyCoupon();
                                        }
                                    }}
                                    placeholder={t("coupon.placeholder")}
                                    className="rounded-md p-2 w-full sm:w-64 md:w-72 bg-neutral-100 text-neutral-700 h-12"
                                    style={{ border: "1px solid var(--neutral-400)" }}
                                />
                                {!appliedCouponCode && (
                                    <button type="button" onClick={applyCoupon} className="btn btn-primary small h-12 p-0 flex items-center justify-center" disabled={!couponInput.trim()}>
                                        {t("coupon.apply")}
                                    </button>
                                )}
                                {appliedCouponCode && (
                                    <button
                                        type="button"
                                        onClick={removeCoupon}
                                        className="btn btn-secondary small p-0 h-12 flex items-center justify-center"
                                        aria-label={t("coupon.remove")}
                                        title={t("coupon.remove")}
                                    >
                                        {t("coupon.remove")}
                                    </button>
                                )}
                            </div>
                            {couponFeedback && <p className={`mb-0 mt-2 text-sm ${couponFeedback.status === "applied" ? "text-secondary-5" : "text-secondary-4"}`}>{couponFeedback.message}</p>}
                            {!couponFeedback && appliedCouponCode && <p className="mb-0 mt-2 text-sm text-neutral-600">{t("coupon.pending")}</p>}
                        </div>
                        <div className="flex w-full justify-between items-center color-neutral-700 gap-6 !p-0">
                            <h3 className="text-lg md:text-2xl text-neutral-700 text-left !font-bold flex items-center mb-4">
                                {getIsReady("contactInformations") ? (
                                    <FaCheckCircle className="text-2xp text-secondary-2 mr-2 lg:mr-4" />
                                ) : (
                                    <FaTimesCircle className="text-2xp text-neutral-400 mr-2 lg:mr-4" />
                                )}
                                {t("contactInformationsTitle")}
                            </h3>
                            {isLoading && <FaSpinner className="animate-spin text-blue-500 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />}
                        </div>
                        <ContactInformations sessionEmail={sessionEmail} formData={formData} setFormData={setFormData} onEmailBlur={syncEmailToStripe} />
                    </div>
                    <div className="lg:hidden">
                        <PriceLayout
                            initialAmount={initialAmount || 0}
                            amount={amount || 0}
                            quantity={quantity}
                            currency={currency}
                            discountType={pricingDetails?.discountType}
                            discountValue={pricingDetails?.discountValue}
                        />
                    </div>
                    <div className="w-full">
                        <div className="flex w-full justify-between items-center color-neutral-700 gap-6 !p-0">
                            <h3 className="text-lg md:text-2xl text-neutral-700 text-left !font-bold flex items-center">
                                {getIsReady("payment") ? <FaCheckCircle className="text-2xp text-secondary-2 mr-2 lg:mr-4" /> : <FaTimesCircle className="text-2xp text-neutral-400 mr-2 lg:mr-4" />}
                                {t("paymentTitle")}
                            </h3>
                            {isLoading && <FaSpinner className="animate-spin text-blue-500 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />}
                        </div>
                        <Payment
                            productSlug={productSlug}
                            quantity={quantity}
                            currency={currency}
                            locale={locale}
                            email={formData.email}
                            sessionEmail={sessionEmail}
                            setAreReady={setAreReady}
                            userId={session?.user?._id}
                            onPaymentIntentReady={setPaymentIntentId}
                            onEmailSync={syncEmailToStripe}
                            couponCode={appliedCouponCode}
                            onPricingDataReady={(nextPricingDetails, nextProductInfos) => {
                                setPricingDetails(nextPricingDetails);
                                setProductInfos(nextProductInfos);
                            }}
                            onCouponFeedback={setCouponFeedback}
                        />
                    </div>
                </div>
            </div>
            <div className="hidden col-span-6 lg:col-span-2 order-1 lg:order-2 lg:flex w-full gap-4">
                <Separator orientation="vertical" />
                <div className="grow">
                    <PriceLayout
                        initialAmount={initialAmount || 0}
                        amount={amount || 0}
                        quantity={quantity}
                        currency={currency}
                        discountType={pricingDetails?.discountType}
                        discountValue={pricingDetails?.discountValue}
                    />
                </div>
            </div>
        </div>
    );
}
