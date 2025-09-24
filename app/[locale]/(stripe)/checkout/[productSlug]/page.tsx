import { ProtectedPage } from "@/app/components/auth/ProtectedPage";
import Checkout from "@/app/components/stripe/Checkout";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import { FaArrowLeft } from "react-icons/fa";

type Props = {
    params: {
        productSlug: string;
        locale: "fr" | "en";
    };
    searchParams: { quantity: string; callbackUrl: string };
};

export default function CheckoutPage({ params: { productSlug, locale }, searchParams: { quantity, callbackUrl } }: Props) {
    const t = useTranslations("Checkout");
    const route = `/checkout/${productSlug}?quantity=${quantity}`;

    return (
        <ProtectedPage callbackUrl={route} messageInfo="checkout">
            <div className="w-full flex flex-col items-center min-h-screen">
                <div className="flex flex-col max-w-7xl px-2 sm:px-4 lg:px-8 py-6 md:py-12 w-full min-h-screen">
                    <div className="flex gap-4 items-center">
                        <Link href={callbackUrl || "/"}>
                            <FaArrowLeft className="text-2xl lg:text-4xl cursor-pointer color-neutral-800 translate_on_hover" title={t("backToPrevious")} />
                        </Link>
                        <h1 className="heading-3 inline-block">{t("checkout")}</h1>
                    </div>
                    <div className="flex grow h-full">
                        <Checkout productSlug={productSlug} locale={locale} quantity={quantity} />
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
