import type { ReactNode } from "react";
import type { PricingDetails } from "@/app/types/sfn/stripe";
import { PriceCard } from "../../components/PackFideCard";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

type PackFidePricingSectionProps = {
    locale: string;
    hasPack?: boolean;
    pricingAutonomie?: PricingDetails | null;
    pricingAccompagne?: PricingDetails | null;
};

type PackCard = {
    key: string;
    title: string;
    description: JSX.Element;
    price: string;
    priceContent?: ReactNode;
    features: string[];
    extras: string[];
    color: string;
    labelCTA: string;
    checkoutUrl: string;
    labelColor?: string;
    disableWhenHasPack?: boolean;
};

export function PackFidePricingSection({ locale, hasPack = false, pricingAutonomie, pricingAccompagne }: PackFidePricingSectionProps) {
    const isFr = locale === "fr";
    const t = useTranslations("Fide.PackFidePricing");
    const rich = intelRich();
    const callbackPath = isFr ? "/fr/fide/pack-fide#pack-pricing" : "/fide/pack-fide#pack-pricing";

    const formatAmount = (value: number) => {
        const normalized = Math.round(value * 100) / 100;
        const hasCents = Math.abs(normalized % 1) > 0;
        return new Intl.NumberFormat(isFr ? "fr-CH" : "en-US", {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
        }).format(normalized);
    };

    const formatPrice = (value: number, currency: PricingDetails["currency"]) => {
        const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "CHF";
        return `${formatAmount(value)} ${symbol}`;
    };

    const buildPriceContent = (pricingDetails?: PricingDetails | null) => {
        if (!pricingDetails) return undefined;
        const hasDiscount = pricingDetails.amount < pricingDetails.initialAmount;
        return (
            <div className="flex flex-col items-center text-neutral-100 leading-none">
                <div className="flex flex-wrap items-baseline justify-center gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold">{formatPrice(pricingDetails.amount, pricingDetails.currency)}</span>
                    {hasDiscount ? <span className="text-sm sm:text-lg line-through text-neutral-100/70">{formatPrice(pricingDetails.initialAmount, pricingDetails.currency)}</span> : null}
                </div>
            </div>
        );
    };

    const cards: PackCard[] = [
        {
            key: "pack-autonomous",
            title: t("cards.autonomy.title"),
            description: (
                <p className="mb-0" style={{ minHeight: 72 }}>{t.rich("cards.autonomy.description.text", rich)}</p>
            ),
            price: pricingAutonomie ? formatPrice(pricingAutonomie.amount, pricingAutonomie.currency) : "499 CHF",
            priceContent: buildPriceContent(pricingAutonomie),
            features: t.raw("cards.autonomy.features") as string[],
            extras: t.raw("cards.autonomy.extras") as string[],
            color: "secondary-4",
            labelCTA: t("cards.autonomy.cta"),
            checkoutUrl: `/checkout/pack-fide?quantity=1&callbackUrl=${encodeURIComponent(callbackPath)}`,
            disableWhenHasPack: true,
        },
        {
            key: "pack-accompanied",
            title: t("cards.guided.title"),
            description: (
                <p className="mb-0" style={{ minHeight: 72 }}>{t.rich("cards.guided.description.text", rich)}</p>
            ),
            price: pricingAccompagne ? formatPrice(pricingAccompagne.amount, pricingAccompagne.currency) : "875 CHF",
            priceContent: buildPriceContent(pricingAccompagne),
            features: t.raw("cards.guided.features") as string[],
            extras: t.raw("cards.guided.extras") as string[],
            color: "secondary-6",
            labelCTA: t("cards.guided.cta"),
            checkoutUrl: `/checkout/pack-fide-accompagne?quantity=1&callbackUrl=${encodeURIComponent(callbackPath)}`,
            disableWhenHasPack: true,
        },
    ];

    return (
        <section id="pack-pricing" className="pt-24 pb-24">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="display-2 mb-4 lg:mb-8">{t.rich("title", rich)}</h2>
                    <p className="text-lg mb-0">{t("subtitle")}</p>
                </div>

                <div className="flex w-full justify-center">
                    <div className="w-full">
                        <div className="flex flex-col items-center lg:flex-row lg:items-stretch justify-center gap-6 lg:gap-12 mb-6 lg:mb-12">
                            {cards.map((card) => (
                                <PriceCard key={card.key} card={card} hasPack={card.disableWhenHasPack ? hasPack : false} />
                            ))}
                        </div>

                        <div className="w-full">
                            <div className="grid items-center gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:py-9 border-y border-neutral-300">
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-2">{t("privateBadge")}</p>
                                    <h3 className="text-2xl lg:text-[32px] lg:leading-tight font-bold mb-3">{t("privateTitle")}</h3>
                                    <p className="mb-4 text-sm text-neutral-700 max-w-2xl">
                                        {t("privateDescription")}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                            {t("privateBullets.1")}
                                        </span>
                                        <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                            {t("privateBullets.2")}
                                        </span>
                                        <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                            {t("privateBullets.3")}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start gap-3 border-neutral-300 lg:items-end lg:border-l lg:pl-8 min-w-[230px]">
                                    <LinkArrow url="/fide/private-courses" target="_self" className="text-lg font-bold text-secondary-2 hover:!text-secondary-2">
                                        {t("privateCta")}
                                    </LinkArrow>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
