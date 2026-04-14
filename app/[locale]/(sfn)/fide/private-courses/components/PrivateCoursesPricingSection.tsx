import { PriceCard } from "../../components/PackFideCard";
import { client } from "@/app/lib/sanity.client";
import { getAmount } from "@/app/serverActions/stripeActions";
import { PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { groq } from "next-sanity";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n";
import { CustomHoursModalTrigger } from "./CustomHoursModalTrigger";
import LinkArrow from "@/app/components/common/LinkArrow";
import { getTranslations } from "next-intl/server";

const queryProductBySlug = groq`*[_type=='product' && slug.current == $slug][0]`;

type PrivateCourseCard = {
    key: string;
    title: string;
    description: string | ReactNode;
    descriptionText: string;
    price: string;
    priceContent?: ReactNode;
    accentColor: string;
    features: string[];
    extras: string[];
    ctaLabel: string;
    checkoutUrl?: string;
    labelColor?: string;
    schemaPrice: number;
    schemaCurrency: PricingDetails["currency"];
    schemaUrl: string;
    schemaUnitCode?: string;
};

export async function PrivateCoursesPricingSection({ locale, title, subtitle, site }: { locale: Locale; title: ReactNode; subtitle: string; site: string }) {
    const isFr = locale === "fr";
    const t = await getTranslations({ locale, namespace: "Fide.PrivateCoursesPricing" });
    const privateCoursesPath = isFr ? "/fr/fide/private-courses" : "/fide/private-courses";

    const formatAmount = (value: number) => {
        const normalized = Math.round(value * 100) / 100;
        const hasCents = Math.abs(normalized % 1) > 0;
        return new Intl.NumberFormat(isFr ? "fr-CH" : "en-US", {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
        }).format(normalized);
    };

    const formatPrice = (value: number, currency: PricingDetails["currency"]) => `${formatAmount(value)} ${currency}`;

    const buildPriceContent = (pricingDetails?: PricingDetails | null) => {
        if (!pricingDetails) return undefined;
        const hasDiscount = pricingDetails.amount < pricingDetails.initialAmount;
        return (
            <div className="flex flex-col items-center leading-none">
                <div className="flex flex-wrap items-baseline justify-center gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold">{formatPrice(pricingDetails.amount, pricingDetails.currency)}</span>
                    {hasDiscount && <span className="text-sm sm:text-lg line-through opacity-70">{formatPrice(pricingDetails.initialAmount, pricingDetails.currency)}</span>}
                </div>
            </div>
        );
    };

    const [fidePreparationClassProduct, fidePreparationClass6HoursProduct] = await Promise.all([
        client.fetch<ProductFetch>(queryProductBySlug, { slug: "fide-preparation-class" }),
        client.fetch<ProductFetch>(queryProductBySlug, { slug: "fide-preparation-class-6-hours" }),
    ]);

    const plans = [
        {
            key: "last-minute",
            title: t("plans.lastMinute.title"),
            description: (
                <p>
                    {t("plans.lastMinute.description.prefix")} <b>{t("plans.lastMinute.description.bold")}</b>
                    {t("plans.lastMinute.description.suffix")}
                </p>
            ),
            descriptionText: t("plans.lastMinute.descriptionText"),
            priceFallback: t("plans.lastMinute.priceFallback"),
            accentColor: "neutral-300",
            features: t.raw("plans.lastMinute.features") as string[],
            extras: t.raw("plans.lastMinute.extras") as string[],
            ctaLabel: t("plans.lastMinute.ctaLabel"),
            labelColor: "neutral-700",
            checkoutUrl: "/checkout/fide-preparation-class?quantity=1&callbackUrl=%2Ffide%2Fprivate-courses%23plans",
        },
        {
            key: "scenarios-6h",
            title: t("plans.scenarios6h.title"),
            description: (
                <p>
                    {t("plans.scenarios6h.description.prefix")} <b>{t("plans.scenarios6h.description.bold")}</b>
                    {t("plans.scenarios6h.description.suffix")}
                </p>
            ),
            descriptionText: t("plans.scenarios6h.descriptionText"),
            priceFallback: t("plans.scenarios6h.priceFallback"),
            accentColor: "secondaryShades-2",
            features: t.raw("plans.scenarios6h.features") as string[],
            extras: t.raw("plans.scenarios6h.extras") as string[],
            ctaLabel: t("plans.scenarios6h.ctaLabel"),
            labelColor: "neutral-700",
            checkoutUrl: "/checkout/fide-preparation-class-6-hours?quantity=1&callbackUrl=%2Ffide%2Fprivate-courses%23plans",
        },
        {
            key: "intensive-mastery",
            title: t("plans.intensive.title"),
            description: (
                <p>
                    {t("plans.intensive.description.prefix")} <b>{t("plans.intensive.description.bold")}</b>
                    {t("plans.intensive.description.suffix")}
                </p>
            ),
            descriptionText: t("plans.intensive.descriptionText"),
            priceFallback: t("plans.intensive.priceFallback"),
            accentColor: "secondary-2",
            features: t.raw("plans.intensive.features") as string[],
            extras: t.raw("plans.intensive.extras") as string[],
            ctaLabel: t("plans.intensive.ctaLabel"),
            checkoutUrl: undefined,
        },
    ] as const;

    const cardsWithDynamicPrices: PrivateCourseCard[] = plans.map((plan) => ({
        key: plan.key,
        title: plan.title,
        description: plan.description,
        descriptionText: plan.descriptionText,
        price: plan.priceFallback || "—",
        accentColor: plan.accentColor,
        features: [...plan.features],
        extras: [...plan.extras],
        ctaLabel: plan.ctaLabel,
        checkoutUrl: plan.checkoutUrl,
        labelColor: "labelColor" in plan ? plan.labelColor : undefined,
        schemaPrice: plan.key === "scenarios-6h" ? 390 : 65,
        schemaCurrency: "CHF",
        schemaUrl: `${site}${privateCoursesPath}${plan.key === "intensive-mastery" ? "#ContactForFIDECourses" : "#plans"}`,
        schemaUnitCode: plan.key === "scenarios-6h" ? undefined : "HUR",
    }));

    if (fidePreparationClassProduct) {
        try {
            const { pricingDetails } = await getAmount(fidePreparationClassProduct, "1", "CHF", undefined);
            const unitPrice = formatPrice(pricingDetails.initialUnitPrice, pricingDetails.currency);
            cardsWithDynamicPrices[0].price = isFr ? `${unitPrice}/heure` : `${unitPrice}/hour`;
            cardsWithDynamicPrices[0].schemaPrice = pricingDetails.initialUnitPrice;
            cardsWithDynamicPrices[0].schemaCurrency = pricingDetails.currency;
        } catch (error) {
            console.error("Failed to load pricing for fide-preparation-class (original):", error);
        }
    }

    if (fidePreparationClass6HoursProduct) {
        try {
            const { pricingDetails } = await getAmount(fidePreparationClass6HoursProduct, "1", "CHF", undefined);
            cardsWithDynamicPrices[1].price = formatPrice(pricingDetails.amount, pricingDetails.currency);
            cardsWithDynamicPrices[1].priceContent = buildPriceContent(pricingDetails);
            cardsWithDynamicPrices[1].schemaPrice = pricingDetails.amount;
            cardsWithDynamicPrices[1].schemaCurrency = pricingDetails.currency;
        } catch (error) {
            console.error("Failed to load pricing for fide-preparation-class-6-hours:", error);
        }
    }

    if (fidePreparationClassProduct) {
        try {
            const chfPricing = fidePreparationClassProduct.pricingDetails.find((p) => p.currency === "CHF");
            const masteryPlan = chfPricing?.plans?.find((plan) => plan.name === "fide-mastery");
            const masteryQuantity = Math.max(1, masteryPlan?.minimumQuantity || 12);
            const { pricingDetails } = await getAmount(fidePreparationClassProduct, String(masteryQuantity), "CHF", undefined);
            cardsWithDynamicPrices[2].price = `${formatPrice(pricingDetails.unitPrice, pricingDetails.currency)}/${isFr ? "heure" : "hour"}`;
            cardsWithDynamicPrices[2].schemaPrice = pricingDetails.unitPrice;
            cardsWithDynamicPrices[2].schemaCurrency = pricingDetails.currency;
        } catch (error) {
            console.error("Failed to load pricing for fide-preparation-class (fide-mastery):", error);
        }
    }

    const offersJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: t("schema.name"),
        description: t("schema.description"),
        brand: {
            "@type": "Organization",
            name: t("schema.brand"),
            url: site,
        },
        offers: cardsWithDynamicPrices.map((offer) => ({
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            priceCurrency: offer.schemaCurrency,
            price: Math.round(offer.schemaPrice * 100) / 100,
            url: offer.schemaUrl,
            seller: {
                "@type": "Organization",
                name: "Start French Now",
                url: site,
            },
            itemOffered: {
                "@type": "Service",
                name: offer.title,
                description: offer.descriptionText,
                provider: {
                    "@type": "Organization",
                    name: "Start French Now",
                    url: site,
                },
            },
            priceSpecification: offer.schemaUnitCode
                ? {
                      "@type": "UnitPriceSpecification",
                      priceCurrency: offer.schemaCurrency,
                      price: Math.round(offer.schemaPrice * 100) / 100,
                      unitCode: offer.schemaUnitCode,
                      valueAddedTaxIncluded: true,
                  }
                : {
                      "@type": "PriceSpecification",
                      priceCurrency: offer.schemaCurrency,
                      price: Math.round(offer.schemaPrice * 100) / 100,
                      valueAddedTaxIncluded: true,
                  },
        })),
    };

    const mobileOrderClassByKey: Record<string, string> = {
        "scenarios-6h": "order-1 xl:order-none",
        "intensive-mastery": "order-2 xl:order-none",
        "last-minute": "order-3 xl:order-none",
    };

    return (
        <div id="plans" className="py-20 px-4 lg:px-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offersJsonLd) }} />
            <div className="max-w-7xl m-auto flex flex-col gap-10">
                <div className="text-center">
                    <h2 className="display-2 mb-4">{title}</h2>
                    <p className="mb-0">{subtitle}</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 m-auto">
                    {cardsWithDynamicPrices.map((plan) => (
                        <div key={plan.key} className={mobileOrderClassByKey[plan.key] || ""}>
                            <PriceCard
                                bookReservation={!plan.checkoutUrl}
                                card={{
                                    title: plan.title,
                                    description: <>{plan.description}</>,
                                    price: plan.price,
                                    ...(plan.priceContent ? { priceContent: plan.priceContent } : {}),
                                    features: plan.features,
                                    extras: plan.extras,
                                    color: plan.accentColor,
                                    labelCTA: plan.ctaLabel,
                                    checkoutUrl: plan.checkoutUrl,
                                    labelColor: plan.labelColor || "neutral-100",
                                }}
                            />
                        </div>
                    ))}
                </div>
                <CustomHoursModalTrigger locale={locale} callbackPath={isFr ? "/fr/fide/private-courses#plans" : "/fide/private-courses#plans"} />
                <div className="w-full">
                    <div className="grid items-center gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:py-9 border-y border-neutral-300">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-6">{t("mix.badge")}</p>
                            <h3 className="text-2xl lg:text-[32px] lg:leading-tight font-bold mb-3">{t("mix.title")}</h3>
                            <p className="mb-4 text-sm text-neutral-700 max-w-2xl">
                                {t("mix.description")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {t("mix.bullets.1")}
                                </span>
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {t("mix.bullets.2")}
                                </span>
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {t("mix.bullets.3")}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-3 border-neutral-300 lg:items-end lg:border-l lg:pl-8 min-w-[230px]">
                            <LinkArrow url="/fide/pack-fide" target="_self" className="text-lg font-bold text-secondary-6 hover:!text-secondary-6">
                                {t("mix.cta")}
                            </LinkArrow>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
