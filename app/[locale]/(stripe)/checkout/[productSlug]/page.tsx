import { use } from "react";
import Checkout from "@/app/components/stripe/Checkout";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FaArrowLeft } from "react-icons/fa";

type Props = {
    params: Promise<{
        productSlug: string;
        locale: "fr" | "en";
    }>;
    searchParams: Promise<{ quantity: string; callbackUrl: string; currency?: "CHF" | "EUR" | "USD"; couponCode?: string }>;
};

function normalizeLocalizedPath(pathLike?: string): string {
    const raw = (pathLike || "").trim();
    if (!raw) return "/";
    if (/^https?:\/\//i.test(raw)) return "/";

    let path = raw;
    try {
        path = decodeURIComponent(raw);
    } catch {
        path = raw;
    }

    if (!path.startsWith("/")) path = `/${path}`;
    path = path.replace(/^\/(fr|en)(?=\/|$)/, "");
    return path || "/";
}

export default function CheckoutPage(props: Props) {
    const searchParams = use(props.searchParams);

    const {
        quantity,
        callbackUrl,
        currency,
        couponCode
    } = searchParams;

    const params = use(props.params);

    const {
        productSlug,
        locale
    } = params;

    const t = useTranslations("Checkout");
    const normalizedCallbackUrl = normalizeLocalizedPath(callbackUrl);

    return (
        <div className="w-full flex flex-col items-center min-h-screen">
            <div className="flex flex-col max-w-7xl px-2 sm:px-4 lg:px-8 py-6 md:py-12 w-full min-h-screen">
                <div className="flex gap-4 items-center">
                    <Link href={normalizedCallbackUrl}>
                        <FaArrowLeft className="text-2xl lg:text-4xl cursor-pointer color-neutral-800 translate_on_hover" title={t("backToPrevious")} />
                    </Link>
                    <h1 className="heading-3 inline-block">{t("checkout")}</h1>
                </div>
                <div className="flex grow h-full">
                    <Checkout productSlug={productSlug} locale={locale} quantity={quantity} defaultCurrency={currency} prefilledCouponCode={couponCode} />
                </div>
            </div>
        </div>
    );
}
