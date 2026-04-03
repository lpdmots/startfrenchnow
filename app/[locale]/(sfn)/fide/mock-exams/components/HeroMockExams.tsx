"use client";

import { ArrowRight, Bot, CheckCircle2, Clock3, Target } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import ShimmerButton from "@/app/components/ui/shimmer-button";

type HeroMockExamsProps = {
    checkoutDisabled?: boolean;
    checkoutDisabledReason?: "hasCredit" | "noTemplates" | null;
};

export const HeroMockExams = ({ checkoutDisabled = false, checkoutDisabledReason = null }: HeroMockExamsProps) => {
    const t = useTranslations("MockExamsPage.Hero");
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
    const disabledMessage = checkoutDisabledReason === "hasCredit" ? t("disabled.hasCredit") : checkoutDisabledReason === "noTemplates" ? t("disabled.noTemplates") : null;
    const isCreditAvailable = checkoutDisabledReason === "hasCredit";

    return (
        <section id="hero-mock-exams" className="section hero v1 wf-section relative overflow-x-clip !pt-6 !pb-10 lg:!pb-14">
            <div className="w-full px-4 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="mx-auto w-full">
                        <h1 className="display-1 text-center md:text-left mb-4">
                            {t("titlePrefix")} <span className="heading-span-secondary-6">{t("titleHighlight")}</span>
                        </h1>
                        <p className="mb-0 text-center md:text-left text-base text-neutral-700 sm:text-lg">{t("subtitle")}</p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 items-center gap-6 lg:mt-10 lg:grid-cols-[minmax(280px,430px)_1fr] lg:gap-8">
                        <div className="order-2 hidden w-full max-w-[320px] mx-auto sm:block sm:max-w-[440px] md:max-w-[540px] lg:order-1 lg:mx-0 lg:max-w-none">
                            <Image src="/images/mock-exam-hero.png" alt={t("imageAlt")} width={760} height={680} className="h-auto w-full object-contain" />
                            <div className="mt-5 mb-4 sm:mb-auto flex items-end w-full justify-center sm:mt-8">
                                <Image src="/images/fideLogo.png" alt={t("logoAlt")} width={90} height={36} className="h-auto w-auto object-contain" />
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 flex flex-col">
                            <div className="order-1 lg:order-2 mt-4 mb-4 lg:mb-12 lg:pt-8 flex flex-col gap-5 w-full items-center justify-center">
                                <div className="w-full max-w-[350px] lg:max-w-[640px]">
                                    <div className="flex flex-wrap items-end justify-center gap-3 gap-x-4">
                                        <div className="flex flex-col">
                                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                                <p className="mb-0 inline-flex rounded-full bg-neutral-200 text-base font-semibold uppercase tracking-wide text-neutral-800">{t("discoveryBadge")}</p>
                                                <p className="mb-0 inline-flex rounded-full bg-secondaryShades-4 px-3 py-1 text-base font-semibold uppercase tracking-wide text-neutral-800">
                                                    {t("discountBadge")}
                                                </p>
                                            </div>
                                            <div className="mb-0 flex items-end justify-center gap-2 whitespace-nowrap sm:justify-start sm:gap-3">
                                                <p className="mb-0 text-3xl font-extrabold leading-none text-secondary-6 sm:text-5xl">10 CHF</p>
                                                <p className="mb-0 text-base font-semibold text-neutral-500 sm:text-lg">
                                                    {t("oldPricePrefix")} <span className="line-through">50 CHF</span>
                                                </p>
                                            </div>
                                        </div>
                                        {/* <p className="mb-0 text-center text-sm text-neutral-600 sm:text-left">1 examen complet avec correction et plan d&apos;action.</p> */}
                                        {!checkoutDisabled ? (
                                            <ShimmerButton
                                                type="button"
                                                onClick={handleCheckout}
                                                className="btn btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                                                variant="primary"
                                            >
                                                {t("cta")}
                                                <ArrowRight className="h-4 w-4" />
                                            </ShimmerButton>
                                        ) : isCreditAvailable ? (
                                            <Link href={dashboardUrl} className="btn btn-secondary inline-flex w-full items-center justify-center gap-2 no-underline sm:w-auto">
                                                {t("ctaUseCredit")}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <button type="button" disabled className="btn btn-secondary inline-flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-75 sm:w-auto">
                                                {t("ctaDisabled")}
                                            </button>
                                        )}
                                    </div>
                                    {disabledMessage ? <p className="mb-0 mt-2 text-center text-xs text-neutral-600 sm:text-left">{disabledMessage}</p> : null}
                                </div>
                            </div>

                            <div className="order-2 mx-auto w-full max-w-[280px] sm:hidden">
                                <Image src="/images/mock-exam-hero.png" alt={t("imageAlt")} width={760} height={680} className="h-auto w-full object-contain" />
                                <div className="mt-4 mb-4 sm:mb-auto flex items-end w-full justify-center">
                                    <Image src="/images/fideLogo.png" alt={t("logoAlt")} width={90} height={36} className="h-auto w-[72px] object-contain" />
                                </div>
                            </div>

                            <div className="order-3 sm:order-2 lg:order-1 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-8">
                                <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2">
                                            <Clock3 className="h-4 w-4 text-secondary-2" />
                                        </span>
                                        <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.format.title")}</p>
                                    </div>
                                    <p className="mb-0 text-sm text-neutral-700">{t("cards.format.text")}</p>
                                </div>
                                <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5">
                                            <Bot className="h-4 w-4 text-secondary-5" />
                                        </span>
                                        <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.score.title")}</p>
                                    </div>
                                    <p className="mb-0 text-sm text-neutral-700">{t("cards.score.text")}</p>
                                </div>
                                <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-secondary-4" />
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-4">
                                            <Target className="h-4 w-4 text-secondary-4" />
                                        </span>
                                        <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.level.title")}</p>
                                    </div>
                                    <p className="mb-0 text-sm text-neutral-700">{t("cards.level.text")}</p>
                                </div>
                                <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-secondary-1" />
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-1">
                                            <CheckCircle2 className="h-4 w-4 text-secondary-1" />
                                        </span>
                                        <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.expert.title")}</p>
                                    </div>
                                    <p className="mb-0 text-sm text-neutral-700">{t("cards.expert.text")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
