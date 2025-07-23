"use client";
import { YourPurchase } from "@/app/components/stripe/YourPurchase";
import { useEffect, useState } from "react";
import { PricingDetails, ProductFetch, ProductInfos } from "@/app/types/sfn/stripe";
import { ContactInformations } from "./ContactInformations";
import { Payment } from "./Payment";
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

interface CheckoutProps {
    locale: "fr" | "en" | "es" | "pt" | "tr";
    productSlug: string;
    quantity: string;
}

export type AreReadyState = {
    yourPurchase: boolean;
    contactInformations: boolean;
    payment: boolean;
};

const queryProduct = groq`
        *[_type=='product' && slug.current == $slug][0] 
    `;

export default function Checkout({ locale, productSlug, quantity: originalQuantity }: CheckoutProps) {
    const { data: session } = useSession();
    const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(null);
    const [productInfos, setProductInfos] = useState<null | ProductInfos>(null);
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
    });
    const { email, firstName, lastName } = formData;
    const t = useTranslations();

    const [quantity, setQuantity] = useState(originalQuantity);
    const [currency, setCurrency] = useState<"CHF" | "EUR" | "USD">("CHF");
    const sessionEmail = session?.user?.email;
    const [areReady, setAreReady] = useState<AreReadyState>({ yourPurchase: true, contactInformations: false, payment: false });
    const [payment, setPayment] = useState(false);

    const amount = pricingDetails?.amount;
    const initialAmount = pricingDetails?.initialAmount;

    useEffect(() => {
        if (session) {
            console.log("session", session);
            setFormData((state) => ({ ...state, email: session.user?.email || "" }));
        }
    }, [session]);

    useEffect(() => {
        setAreReady((state) => ({ ...state, contactInformations: isValidEmail(email) && !!firstName.trim() && !!lastName.trim() }));
    }, [email, firstName, lastName]);

    useEffect(() => {
        setPayment(false);
    }, [email, quantity, currency]);

    useEffect(() => {
        if (!session) return;
        (async () => {
            const product = (await client.fetch(queryProduct, { slug: productSlug })) as ProductFetch;
            const userPurchasedLesson = await getUserPurchases(session?.user?._id, product.referenceKey);
            const data = await getAmount(product, quantity, currency, userPurchasedLesson);
            setPricingDetails(data.pricingDetails);
            setProductInfos(data.productInfos);
        })();
    }, [quantity, currency]);

    const getSpinner = (name: string) => {
        return !pricingDetails || !productInfos || !sessionEmail;
    };
    const getIsReady = (name: string) => {
        return areReady[name as keyof AreReadyState];
    };

    return (
        <div className="grid grid-cols-6 gap-4 lg:gap-8 w-full min-h-[65vh]">
            <div className="col-span-6 lg:col-span-4">
                <div className="w-full flex flex-col gap-8 lg:gap-12">
                    <div className="w-full">
                        <div className="flex w-full justify-between items-center color-neutral-700 gap-6 !p-0">
                            <h3 className="text-lg md:text-2xl text-neutral-700 text-left !font-bold flex items-center mb-6">
                                {getIsReady("contactInformations") ? (
                                    <FaCheckCircle className="text-2xp text-secondary-2 mr-2 lg:mr-4" />
                                ) : (
                                    <FaTimesCircle className="text-2xp text-neutral-400 mr-2 lg:mr-4" />
                                )}
                                {t("contactInformationsTitle")}
                            </h3>
                            {getSpinner("contactInformations") && <FaSpinner className="animate-spin text-blue-500 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />}
                        </div>
                        <ContactInformations sessionEmail={sessionEmail} payment={payment} formData={formData} setFormData={setFormData} />
                    </div>
                    <div className="w-full">
                        <div className="flex w-full justify-between items-center color-neutral-700 gap-6">
                            <h3 className="text-lg md:text-2xl text-neutral-700 text-left !font-bold flex items-center mb-6">
                                {getIsReady("yourPurchase") ? (
                                    <FaCheckCircle className="text-2xp text-secondary-2 mr-2 lg:mr-4" />
                                ) : (
                                    <FaTimesCircle className="text-2xp text-neutral-400 mr-2 lg:mr-4" />
                                )}
                                {t("yourPurchaseTitle")}
                            </h3>
                            {getSpinner("yourPurchase") && <FaSpinner className="animate-spin text-blue-500 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />}
                        </div>
                        {!getSpinner("yourPurchase") && (
                            <YourPurchase
                                productInfos={productInfos as ProductInfos}
                                pricingDetails={pricingDetails as PricingDetails}
                                locale={locale}
                                setQuantity={setQuantity}
                                setCurrency={setCurrency}
                                quantity={quantity}
                                payment={payment}
                                currency={currency}
                            />
                        )}
                    </div>
                    <div className="lg:hidden">
                        <PriceLayout initialAmount={initialAmount || 0} amount={amount || 0} quantity={quantity} currency={currency} payment={payment} setPayment={setPayment} areReady={areReady} />
                    </div>
                    {payment && (
                        <div className="w-full">
                            <div className="flex w-full justify-between items-center color-neutral-700 gap-6 !p-0">
                                <h3 className="text-lg md:text-2xl text-neutral-700 text-left !font-bold flex items-center">
                                    {getIsReady("payment") ? (
                                        <FaCheckCircle className="text-2xp text-secondary-2 mr-2 lg:mr-4" />
                                    ) : (
                                        <FaTimesCircle className="text-2xp text-neutral-400 mr-2 lg:mr-4" />
                                    )}
                                    {t("paymentTitle")}
                                </h3>
                                {getSpinner("payment") && <FaSpinner className="animate-spin text-blue-500 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />}
                            </div>
                            <Payment
                                productSlug={productSlug}
                                quantity={quantity}
                                currency={currency}
                                locale={locale}
                                formData={formData}
                                sessionEmail={sessionEmail}
                                setAreReady={setAreReady}
                                userId={session?.user?._id || ""}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="hidden col-span-6 lg:col-span-2 order-1 lg:order-2 lg:flex w-full gap-4">
                <Separator orientation="vertical" />
                <div className="grow">
                    <PriceLayout initialAmount={initialAmount || 0} amount={amount || 0} quantity={quantity} currency={currency} payment={payment} setPayment={setPayment} areReady={areReady} />
                </div>
            </div>
        </div>
    );
}
