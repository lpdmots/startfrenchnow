import { PriceCard } from "../../components/PackFideCard";
import { client } from "@/app/lib/sanity.client";
import { getAmount } from "@/app/serverActions/stripeActions";
import { PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { groq } from "next-sanity";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n";
import { CustomHoursModalTrigger } from "./CustomHoursModalTrigger";
import LinkArrow from "@/app/components/common/LinkArrow";

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
        checkoutUrl: "/checkout/fide-preparation-class?quantity=1&callbackUrl=%2Ffide%2Fprivate-courses%23plans",
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
        ctaLabel: "RÉSERVER UN ENTRETIEN GRATUIT",
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
    schemaPrice: number;
    schemaCurrency: PricingDetails["currency"];
    schemaUrl: string;
    schemaUnitCode?: string;
};

export async function PrivateCoursesPricingSection({ locale, title, subtitle, site }: { locale: Locale; title: ReactNode; subtitle: string; site: string }) {
    const isFr = locale === "fr";
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
        name: isFr ? "Cours privés de préparation au test FIDE" : "Private coaching for FIDE test preparation",
        description: isFr
            ? "Coaching privé FIDE avec offres flexibles: dernière minute, scénarios express et préparation intensive."
            : "Private FIDE coaching with flexible options: last-minute, express scenarios, and intensive preparation.",
        brand: {
            "@type": "Organization",
            name: "Start French Now",
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
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-6">{isFr ? "Option autonomie" : "Self-study option"}</p>
                            <h3 className="text-2xl lg:text-[32px] lg:leading-tight font-bold mb-3">{isFr ? "Mix idéal: cours privés + Pack FIDE" : "Best mix: private coaching + FIDE Pack"}</h3>
                            <p className="mb-4 text-sm text-neutral-700 max-w-2xl">
                                {isFr
                                    ? "Travaillez en autonomie entre les séances grâce à la plateforme e-learning, puis validez vos progrès en cours privés avec un coach."
                                    : "Study autonomously between lessons on the e-learning platform, then validate your progress in private coaching sessions."}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {isFr ? "Autonomie entre les séances" : "Autonomous study between lessons"}
                                </span>
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {isFr ? "Vidéos + examens blancs" : "Videos + mock exams"}
                                </span>
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {isFr ? "Coaching ciblé" : "Targeted coaching"}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-3 border-neutral-300 lg:items-end lg:border-l lg:pl-8 min-w-[230px]">
                            <LinkArrow url="/fide/pack-fide" target="_self" className="text-lg font-bold text-secondary-6 hover:!text-secondary-6">
                                {isFr ? "Découvrir le Pack FIDE" : "Explore the FIDE Pack"}
                            </LinkArrow>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
