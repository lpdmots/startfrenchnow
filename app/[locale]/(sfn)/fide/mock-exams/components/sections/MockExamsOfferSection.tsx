"use client";

import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom, SlideFromLeft, SlideFromRight } from "@/app/components/animations/Slides";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import Link from "next-intl/link";
import { useTranslations } from "next-intl";

type MockExamsOfferSectionProps = {
    checkoutDisabled?: boolean;
    checkoutDisabledReason?: "hasCredit" | "noTemplates" | null;
};

export function MockExamsOfferSection({ checkoutDisabled = false, checkoutDisabledReason = null }: MockExamsOfferSectionProps) {
    const t = useTranslations("MockExamsPage.Offer");
    const callbackUrl = "/fide/mock-exams";
    const dashboardUrl = "/fide/dashboard#mock-exams";
    const checkoutUrl = `/checkout/mock_exam?${new URLSearchParams({
        quantity: "1",
        callbackUrl,
    }).toString()}`;

    const handleCheckout = () => {
        if (checkoutDisabled) return;
        window.location.assign(checkoutUrl);
    };
    const disabledMessage =
        checkoutDisabledReason === "hasCredit" ? t("disabled.hasCredit") : checkoutDisabledReason === "noTemplates" ? t("disabled.noTemplates") : null;
    const isCreditAvailable = checkoutDisabledReason === "hasCredit";

    return (
        <section id="mock-exams-offer" className="bg-neutral-200 py-14 lg:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <SlideFromBottom delay={0.05} duration={0.35}>
                    <div className="mx-auto mb-8 max-w-4xl text-center">
                        <p className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-secondary-6 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            {t("badge")}
                        </p>
                        <h2 className="display-2 mb-3">
                            {t("titlePrefix")} <span className="heading-span-secondary-6">{t("titleHighlight")}</span>
                        </h2>
                        <p className="mb-0 text-base text-neutral-700 md:text-lg">{t("subtitle")}</p>
                    </div>
                </SlideFromBottom>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:gap-6">
                    <SlideFromLeft delay={0.1} duration={0.35}>
                        <article className="relative overflow-hidden rounded-3xl border-2 border-secondary-6 bg-neutral-100 p-5 shadow-lg md:p-7">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-secondaryShades-4 opacity-40" />
                            <div className="pointer-events-none absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-secondaryShades-4 opacity-30" />

                            <div className="relative grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto] md:items-end">
                                <div>
                                    <p className="mb-2 inline-flex rounded-full bg-secondaryShades-4 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">{t("main.offerBadge")}</p>
                                    <p className="mb-1 text-lg font-bold text-neutral-800">{t("main.title")}</p>
                                    <div className="mb-4 flex items-end gap-3 whitespace-nowrap">
                                        <p className="mb-0 text-5xl font-extrabold leading-none text-secondary-6 md:text-6xl">10 CHF</p>
                                        <p className="mb-0 text-base font-semibold text-neutral-500">
                                            {t("main.oldPricePrefix")} <span className="line-through">50 CHF</span>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <p className="mb-0 flex items-start gap-2 text-sm text-neutral-700">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-6" />
                                            <span>{t("main.bullets.exam")}</span>
                                        </p>
                                        <p className="mb-0 flex items-start gap-2 text-sm text-neutral-700">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-6" />
                                            <span>{t("main.bullets.resources")}</span>
                                        </p>
                                        <p className="mb-0 flex items-start gap-2 text-sm text-neutral-700">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-6" />
                                            <span>{t("main.bullets.feedback")}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="md:pb-0.5">
                                    {!checkoutDisabled ? (
                                        <ShimmerButton type="button" onClick={handleCheckout} className="btn btn-primary small inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                                            {t("main.cta")}
                                            <ArrowRight className="h-4 w-4" />
                                        </ShimmerButton>
                                    ) : isCreditAvailable ? (
                                        <Link href={dashboardUrl} className="btn btn-secondary small inline-flex w-full items-center justify-center gap-2 no-underline sm:w-auto">
                                            {t("main.ctaUseCredit")}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <button type="button" disabled className="btn btn-secondary small inline-flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-75 sm:w-auto">
                                            {t("main.ctaDisabled")}
                                        </button>
                                    )}
                                    {disabledMessage ? <p className="mb-0 mt-2 text-xs text-neutral-600">{disabledMessage}</p> : null}
                                </div>
                            </div>
                        </article>
                    </SlideFromLeft>

                    <SlideFromRight delay={0.15} duration={0.35}>
                        <aside className="flex h-full flex-col justify-between rounded-3xl border-2 border-dashed border-neutral-400 bg-neutral-100 p-5 shadow-sm md:p-6">
                            <div>
                                <p className="mb-2 inline-flex rounded-full bg-neutral-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">{t("standard.badge")}</p>
                                <p className="mb-1 text-lg font-bold text-neutral-800">{t("standard.title")}</p>
                                <p className="mb-2 text-5xl font-extrabold leading-none text-neutral-800 md:text-6xl">50 CHF</p>
                                <p className="mb-0 text-sm text-neutral-700">{t("standard.description")}</p>
                            </div>
                            <p className="mt-4 mb-0 inline-flex items-center gap-2 self-start rounded-full bg-neutral-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
                                <Clock3 className="h-3.5 w-3.5" />
                                {t("standard.comingSoon")}
                            </p>
                        </aside>
                    </SlideFromRight>
                </div>

                <Fade delay={0.2} duration={0.3}>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-neutral-700 md:mt-12 lg:mt-6">
                        <span>{t("reassurance.payment")}</span>
                        <span className="text-neutral-500">•</span>
                        <span>{t("reassurance.support")}</span>
                    </div>
                </Fade>
            </div>
        </section>
    );
}
