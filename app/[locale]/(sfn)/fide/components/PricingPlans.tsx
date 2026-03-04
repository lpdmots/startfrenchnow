// app/[locale]/fide/pack-fide/components/PricingSection.tsx
"use client";

import { PiArrowBendRightDownDuotone } from "react-icons/pi";
import { PriceCard } from "./PackFideCard";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import PriceSliderFide from "./PriceSliderFide";
import { Locale } from "@/i18n";
import { useOutsideClick } from "@/app/hooks/use-outside-click";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import { SlideFromBottom, SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import { PricingDetails } from "@/app/types/sfn/stripe";

export function PricingPlans({
    hasPack,
    locale,
    hasReservation,
    pricingAutonomie,
    pricingAccompagne,
}: {
    hasPack?: boolean;
    locale: string;
    hasReservation?: boolean;
    pricingAutonomie?: PricingDetails | null;
    pricingAccompagne?: PricingDetails | null;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("PricingPlans");

    const close = () => setIsOpen(false);

    useOutsideClick(panelRef, () => {
        setIsOpen(false);
    });

    const formatAmount = (value: number) => {
        const normalized = Math.round(value * 100) / 100;
        const hasCents = Math.abs(normalized % 1) > 0;
        return new Intl.NumberFormat(locale === "fr" ? "fr-CH" : "en-US", {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
        }).format(normalized);
    };

    const formatPrice = (value: number, currency: PricingDetails["currency"]) => {
        const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "CHF";
        return currency === "CHF" ? `${formatAmount(value)} ${symbol}` : `${formatAmount(value)} ${symbol}`;
    };

    const buildPriceContent = (pricingDetails?: PricingDetails | null) => {
        if (!pricingDetails) return { priceContent: null };
        const hasDiscount = pricingDetails.amount < pricingDetails.initialAmount;
        const discountAmount = pricingDetails.initialAmount - pricingDetails.amount;
        const isPercentage = pricingDetails.discountType === "percentage" && typeof pricingDetails.discountValue === "number";

        return {
            priceContent: (
                <div className="flex flex-col items-center text-neutral-100 leading-none">
                    <div className="flex flex-wrap items-baseline justify-center gap-2">
                        <span className="text-4xl sm:text-5xl font-extrabold">{formatPrice(pricingDetails.amount, pricingDetails.currency)}</span>
                        {hasDiscount && <span className="text-sm sm:text-lg line-through text-neutral-100/70">{formatPrice(pricingDetails.initialAmount, pricingDetails.currency)}</span>}
                    </div>
                </div>
            ),
        };
    };

    const { priceContent: priceContentAutonomie } = buildPriceContent(pricingAutonomie);
    const { priceContent: priceContentAccompagne } = buildPriceContent(pricingAccompagne);

    const CARDS = [
        {
            title: t("card1.title"),
            description: (
                <>
                    <p className="bs mb-0" style={{ minHeight: 72 }}>
                        {t.rich("card1.description", intelRich())}
                    </p>
                </>
            ),
            price: pricingAutonomie ? formatPrice(pricingAutonomie.amount, pricingAutonomie.currency) : "499 CHF",
            priceContent: priceContentAutonomie,
            features: [t("card1.features.f1"), t("card1.features.f2"), t("card1.features.f3")],
            extras: [t("card1.extras.e1"), t("card1.extras.e2")],
            color: "secondary-4",
            labelCTA: t("card1.labelCTA"),
            checkoutUrl: `/checkout/pack-fide?quantity=1&callbackUrl=${encodeURIComponent("/fide#plans")}`,
        },
        {
            title: t("card2.title"),
            description: (
                <>
                    <p className="bs mb-0" style={{ minHeight: 72 }}>
                        {t.rich("card2.description", intelRich())}
                    </p>
                </>
            ),
            price: pricingAccompagne ? formatPrice(pricingAccompagne.amount, pricingAccompagne.currency) : "875 CHF",
            priceContent: priceContentAccompagne,
            features: [t("card2.features.f1"), t("card2.features.f2"), t("card2.features.f3")],
            extras: [t("card2.extras.e1"), t("card2.extras.e2")],
            color: "secondary-1",
            labelCTA: t("card2.labelCTA"),
            checkoutUrl: `/checkout/pack-fide-accompagne?quantity=1&callbackUrl=${encodeURIComponent("/fide#plans")}`,
        },
        {
            title: t("card3.title"),
            description: (
                <>
                    <p className="bs mb-0" style={{ minHeight: 72 }}>
                        {t.rich("card3.description", intelRich())}
                    </p>
                </>
            ),
            price: "65 CHF*",
            features: [t("card3.features.f1"), t("card3.features.f2"), t("card3.features.f3")],
            extras: [t("card3.extras.e1"), t("card3.extras.e2")],
            color: "secondary-2",
            labelCTA: hasReservation ? t("card3.labelByMore") : t("card3.labelCTA"),
            checkoutUrl: `/checkout/fide-preparation-class?quantity=12&callbackUrl=${encodeURIComponent("/fide#plans")}`,
        },
    ];

    return (
        <section className="pt-24 pb-12">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* Intro courte */}
                <div id="plans" className="mb-10 text-center">
                    <SlideFromBottom>
                        <>
                            <h2 className="display-2">
                                <span className="heading-span-secondary-1">{t("titleHighlight")}</span> {t("titleRest")}
                            </h2>
                            <p className="text-lg">{t("subtitle")}</p>
                        </>
                    </SlideFromBottom>
                </div>
                <div className="w-full text-center mb-10">
                    <p className="text-neutral-700 mb-0 flex justify-center w-full font-bold text-lg">
                        {t("mostPopular")}
                        <span className="relative">
                            <PiArrowBendRightDownDuotone className="text-2xl md:text-4xl absolute left-2 -bottom-6" />
                        </span>
                    </p>
                </div>
                {/* Layout 3 colonnes (Free allégé + 2 vraies cards) */}
                <SlideInOneByOneParent delayChildren={0.5} delay={0.1}>
                    <div className="flex flex-col lg:flex-row flex-nowrap gap-6 lg:gap-2 xl:gap-8">
                        <SlideInOneByOneChild>
                            <div className="flex justify-center order-2 lg:order-1">
                                <PriceCard card={CARDS[0]} hasPack={hasPack} />
                            </div>
                        </SlideInOneByOneChild>
                        <SlideInOneByOneChild>
                            <div className="flex justify-center order-1 lg:order-2">
                                <PriceCard card={CARDS[1]} hasPack={hasPack} />
                            </div>
                        </SlideInOneByOneChild>
                        <SlideInOneByOneChild>
                            <div className="flex justify-center order-3 lg:order-3">
                                <PriceCard card={CARDS[2]} hasPack={hasPack} bookReservation={true} setIsOpen={hasReservation ? setIsOpen : undefined} />
                            </div>
                        </SlideInOneByOneChild>
                    </div>
                </SlideInOneByOneParent>
                {/* Mentions sous la zone plans */}
                <div className="mt-12 text-center text-sm text-neutral-600">
                    <p className="mb-0">
                        {t("tailoredPrefix")}{" "}
                        <span onClick={() => setIsOpen((isOpen) => !isOpen)} className="text-secondary-2 cursor-pointer">
                            {t("chooseHours")}
                        </span>
                        .
                    </p>
                </div>
            </div>
            {/* MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neutral-800 z-50" />

                        {/* Conteneur centré */}
                        <div className="fixed inset-0 grid place-items-center z-[60]">
                            {/* Bouton X flottant (mobile) */}
                            <motion.button
                                className="flex absolute top-4 lg:hidden right-2 items-center justify-center bg-neutral-200 rounded-full h-8 w-8 z-[70] !p-0"
                                onClick={close}
                                aria-label={t("modalCloseLabel")}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.5 } }}
                                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            >
                                <FaTimes className="h-4 w-4 text-neutral-800" />
                            </motion.button>

                            {/* Carte / Panneau */}
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="choose-hours"
                                ref={panelRef}
                                initial={{ borderRadius: 16 }}
                                className="w-full h-full md:h-auto md:max-w-5xl bg-neutral-100 sm:rounded-3xl overflow-auto border-2 border-solid border-neutral-800 flex flex-col"
                            >
                                {/* En-tête (reprend l’icône + label animés) */}
                                <motion.div layoutId="sommaire-header" className="flex items-center gap-2 p-0 lg:p-4 border-b border-neutral-300 relative">
                                    <PriceSliderFide locale={locale as Locale} />
                                    <motion.button
                                        className="flex absolute top-4 right-2 items-center justify-center bg-neutral-200 rounded-full h-8 w-8 z-[70] !p-0"
                                        onClick={close}
                                        aria-label={t("modalCloseLabel")}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, transition: { delay: 0.5 } }}
                                        exit={{ opacity: 0, transition: { duration: 0.05 } }}
                                    >
                                        <FaTimes className="h-4 w-4 text-neutral-800" />
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
