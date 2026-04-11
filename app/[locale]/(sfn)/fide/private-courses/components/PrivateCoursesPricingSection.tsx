import { PriceCard } from "../../components/PackFideCard";
import { client } from "@/app/lib/sanity.client";
import { getAmount } from "@/app/serverActions/stripeActions";
import { PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { groq } from "next-sanity";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n";
import { CustomHoursModalTrigger } from "./CustomHoursModalTrigger";

const PRIVATE_COURSES_PLANS = [
    {
        key: "last-minute",
        title: "Dernière minute",
        description: (
            <p>
                Idéal si votre examen est <b>proche</b>: focus immédiat sur vos points bloquants.
            </p>
        ),
        descriptionText: "Idéal si votre examen est proche: focus immédiat sur vos points bloquants.",
        priceFallback: "65 CHF/heure",
        accentColor: "neutral-300",
        features: ["Diagnostic oral rapide", "1-2 scénarios prioritaires", "Corrections immédiates"],
        extras: ["Créneaux rapides", "Plan d'action sur 7 jours"],
        ctaLabel: "Se rassurer avant le test",
        labelColor: "neutral-700",
        checkoutUrl: "/checkout/fide-preparation-class?quantity=2&callbackUrl=%2Ffide%2Fprivate-courses%23plans",
    },
    {
        key: "scenarios-6h",
        title: "Scénarios Express 6h",
        description: (
            <p>
                Le format recommandé pour maîtriser <b>les scénarios actuels</b> du test FIDE.
            </p>
        ),
        descriptionText: "Le format recommandé pour maîtriser les scénarios actuels du test FIDE.",
        priceFallback: "390 CHF",
        accentColor: "secondaryShades-2",
        features: ["Scénarios récents A1-A2 / A2-B1", "Vocabulaire utile et actuel", "Progression visible séance après séance"],
        extras: ["Priorités entre les séances", "Méthode claire pour le jour J"],
        ctaLabel: "Se préparer efficacement",
        labelColor: "neutral-700",
        checkoutUrl: "/checkout/fide-preparation-class-6-hours?quantity=1&callbackUrl=%2Ffide%2Fprivate-courses%23plans",
    },
    {
        key: "intensive-mastery",
        title: "Préparation intensive",
        description: (
            <p>
                Accompagnement <b>renforcé</b> si vous avez un délai court ou un objectif ambitieux.
            </p>
        ),
        descriptionText: "Accompagnement renforcé si vous avez un délai court ou un objectif ambitieux.",
        priceFallback: "Dès 10h personnalisées",
        accentColor: "secondary-2",
        features: ["Plan intensif selon votre date", "Simulations en conditions réelles", "Coaching expression + compréhension"],
        extras: ["Suivi rapproché", "Conseils anti-stress à l'oral"],
        ctaLabel: "Se préparer intensivement",
        checkoutUrl: undefined,
    },
] as const;

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
};

export async function PrivateCoursesPricingSection({ locale, title, subtitle, site }: { locale: Locale; title: ReactNode; subtitle: string; site: string }) {
    const isFr = locale === "fr";

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

    const cardsWithDynamicPrices: PrivateCourseCard[] = PRIVATE_COURSES_PLANS.map((plan) => ({
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
    }));

    if (fidePreparationClassProduct) {
        try {
            const { pricingDetails } = await getAmount(fidePreparationClassProduct, "1", "CHF", undefined);
            const unitPrice = formatPrice(pricingDetails.initialUnitPrice, pricingDetails.currency);
            cardsWithDynamicPrices[0].price = isFr ? `${unitPrice}/heure` : `${unitPrice}/hour`;
        } catch (error) {
            console.error("Failed to load pricing for fide-preparation-class (original):", error);
        }
    }

    if (fidePreparationClass6HoursProduct) {
        try {
            const { pricingDetails } = await getAmount(fidePreparationClass6HoursProduct, "1", "CHF", undefined);
            cardsWithDynamicPrices[1].price = formatPrice(pricingDetails.amount, pricingDetails.currency);
            cardsWithDynamicPrices[1].priceContent = buildPriceContent(pricingDetails);
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
        } catch (error) {
            console.error("Failed to load pricing for fide-preparation-class (fide-mastery):", error);
        }
    }

    const offersJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: isFr ? "Offres de coaching privé FIDE" : "Private FIDE coaching offers",
        itemListElement: cardsWithDynamicPrices.map((offer, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Service",
                name: offer.title,
                description: offer.descriptionText,
                provider: {
                    "@type": "Organization",
                    name: "Start French Now",
                    url: site,
                },
            },
        })),
    };

    return (
        <div id="plans" className="py-20 px-4 lg:px-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offersJsonLd) }} />
            <div className="max-w-7xl m-auto flex flex-col gap-10">
                <div className="text-center">
                    <h2 className="display-2 mb-4">{title}</h2>
                    <p className="mb-0">{subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cardsWithDynamicPrices.map((plan) => (
                        <PriceCard
                            key={plan.key}
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
                    ))}
                </div>
                <CustomHoursModalTrigger locale={locale} callbackPath={isFr ? "/fr/fide/private-courses#plans" : "/fide/private-courses#plans"} />
            </div>
        </div>
    );
}
