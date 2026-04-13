import type { ReactNode } from "react";
import type { PricingDetails } from "@/app/types/sfn/stripe";
import { PriceCard } from "../../components/PackFideCard";
import LinkArrow from "@/app/components/common/LinkArrow";

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
            title: isFr ? "Pack Autonomie" : "Self-Study Pack",
            description: (
                <p className="mb-0" style={{ minHeight: 72 }}>
                    {isFr ? (
                        <>
                            Accédez à notre plateforme d'auto-apprentissage FIDE, de débutant complet au niveau B1, et progressez <b>à votre rythme</b>.
                        </>
                    ) : (
                        <>
                            Access our FIDE self-study platform from complete beginner to B1 level and progress <b>at your own pace</b>.
                        </>
                    )}
                </p>
            ),
            price: pricingAutonomie ? formatPrice(pricingAutonomie.amount, pricingAutonomie.currency) : "499 CHF",
            priceContent: buildPriceContent(pricingAutonomie),
            features: isFr
                ? ["14h de parcours vidéo FIDE, A0 → B1", "100+ scénarios dont les sujets actuels", "Suivi des progrès + Messagerie"]
                : ["14h of FIDE video content, A0 → B1", "100+ scenarios including current topics", "Progress tracking + messaging"],
            extras: isFr ? ["Mises à jour régulières", "Progression garantie"] : ["Regular updates", "Progression guaranteed"],
            color: "secondary-4",
            labelCTA: isFr ? "OBTENIR LA FORMATION" : "GET THE TRAINING",
            checkoutUrl: `/checkout/pack-fide?quantity=1&callbackUrl=${encodeURIComponent(callbackPath)}`,
            disableWhenHasPack: true,
        },
        {
            key: "pack-accompanied",
            title: isFr ? "Pack Accompagné" : "Guided Pack",
            description: (
                <p className="mb-0" style={{ minHeight: 72 }}>
                    {isFr ? (
                        <>
                            Préparez l'examen via notre plateforme <b>d'auto-apprentissage</b> puis pratiquez les scénarios FIDE avec 6h de <b>coaching privé</b>.
                        </>
                    ) : (
                        <>
                            Prepare for the exam via our <b>self-study platform</b> and then practice FIDE scenarios with 6 hours of <b>private coaching</b>.
                        </>
                    )}
                </p>
            ),
            price: pricingAccompagne ? formatPrice(pricingAccompagne.amount, pricingAccompagne.currency) : "875 CHF",
            priceContent: buildPriceContent(pricingAccompagne),
            features: isFr
                ? ["Tous les avantages de la formation FIDE", "6 heures de cours privés en visio", "Conseils experts et personnalisés"]
                : ["All benefits of the FIDE Essentials", "6 hours of private online lessons", "Expert and personalised advice"],
            extras: isFr ? ["1h de coaching offerte", "Réservation sous 12h possible"] : ["Save 75 CHF on coaching", "Booking possible within 12h"],
            color: "secondary-6",
            labelCTA: isFr ? "CHOISIR L'OFFRE MIXTE" : "CHOOSE THE HYBRID PLAN",
            checkoutUrl: `/checkout/pack-fide-accompagne?quantity=1&callbackUrl=${encodeURIComponent(callbackPath)}`,
            disableWhenHasPack: true,
        },
    ];

    return (
        <section id="pack-pricing" className="pt-24 pb-24">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="display-2 mb-4 lg:mb-8">
                        <span className="heading-span-secondary-6">{isFr ? "Choisissez" : "Choose"}</span> {isFr ? "votre formule" : "your plan"}
                    </h2>
                    <p className="text-lg mb-0">{isFr ? "Deux offres pack selon votre besoin d'autonomie ou d'accompagnement." : "Two pack offers depending on your need for autonomy or guidance."}</p>
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
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-2">{isFr ? "Option complémentaire" : "Complementary option"}</p>
                                    <h3 className="text-2xl lg:text-[32px] lg:leading-tight font-bold mb-3">{isFr ? "Cours privés FIDE" : "Private FIDE lessons"}</h3>
                                    <p className="mb-4 text-sm text-neutral-700 max-w-2xl">
                                        {isFr
                                            ? "Pour un accompagnement 1:1 ciblé: travaillez vos points bloquants, corrigez vos erreurs en direct et gagnez en confiance à l'oral."
                                            : "For targeted 1:1 support: work on blocking points, fix mistakes live, and build confidence for the speaking part."}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                            {isFr ? "Coaching individuel" : "1:1 coaching"}
                                        </span>
                                        <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                            {isFr ? "Scénarios actuels" : "Current scenarios"}
                                        </span>
                                        <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                            {isFr ? "Feedback direct" : "Direct feedback"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start gap-3 border-neutral-300 lg:items-end lg:border-l lg:pl-8 min-w-[230px]">
                                    <LinkArrow url="/fide/private-courses" target="_self" className="text-lg font-bold text-secondary-2 hover:!text-secondary-2">
                                        {isFr ? "Voir les cours privés" : "See private lessons"}
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
