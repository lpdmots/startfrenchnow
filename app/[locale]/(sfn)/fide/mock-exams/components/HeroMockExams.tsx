import { Bot, CheckCircle2, Clock3, Target } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MockExamCheckoutCTA } from "./checkout/MockExamCheckoutCTA";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

const heroCards = [
    {
        key: "format",
        Icon: Clock3,
        barClassName: "bg-secondary-2",
        iconWrapperClassName: "bg-secondaryShades-2",
        iconClassName: "text-secondary-2",
    },
    {
        key: "score",
        Icon: Bot,
        barClassName: "bg-secondary-5",
        iconWrapperClassName: "bg-secondaryShades-5",
        iconClassName: "text-secondary-5",
    },
    {
        key: "level",
        Icon: Target,
        barClassName: "bg-secondary-4",
        iconWrapperClassName: "bg-secondaryShades-4",
        iconClassName: "text-secondary-4",
    },
    {
        key: "expert",
        Icon: CheckCircle2,
        barClassName: "bg-secondary-1",
        iconWrapperClassName: "bg-secondaryShades-1",
        iconClassName: "text-secondary-1",
    },
] as const;

export const HeroMockExams = () => {
    const t = useTranslations("Fide.MockExamsPage.Hero");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
    };

    return (
        <section id="hero-mock-exams" className="section hero v1 wf-section relative overflow-x-clip !pt-6 !pb-10 lg:!pb-14">
            <div className="w-full px-4 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="mx-auto w-full">
                        <h1 className="display-1 text-center md:text-left mb-4">{t.rich("title", rich)}</h1>
                        <p className="mb-0 text-center md:text-left text-base text-neutral-700 sm:text-lg">{t("subtitle")}</p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 items-center gap-6 lg:mt-10 lg:grid-cols-[minmax(280px,430px)_1fr] lg:gap-8">
                        <div className="order-2 mx-auto w-full max-w-[280px] sm:max-w-[440px] md:max-w-[540px] lg:order-1 lg:row-span-2 lg:mx-0 lg:max-w-none">
                            <Image
                                src="/images/mock-exam-hero.avif"
                                alt={t("imageAlt")}
                                width={664}
                                height={524}
                                className="h-auto w-full object-contain"
                                sizes="(min-width: 1024px) 430px, (min-width: 768px) 540px, (min-width: 640px) 440px, 280px"
                                priority
                                fetchPriority="high"
                            />
                            <div className="mt-4 mb-4 flex w-full items-end justify-center sm:mt-8 sm:mb-0">
                                <Image src="/images/logo.png" alt={t("logoAlt")} width={70} height={28} className="object-contain" sizes="70px" />
                            </div>
                        </div>

                        <div className="order-1 flex min-h-[190px] w-full flex-col items-center justify-center gap-5 sm:min-h-[150px] lg:order-3 lg:min-h-[170px] lg:items-start lg:pt-4">
                            <div className="w-full max-w-[350px] lg:max-w-[640px]">
                                <div className="flex flex-wrap items-end justify-center gap-3 gap-x-4 lg:justify-start">
                                    <div className="flex flex-col">
                                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                            <p className="mb-0 inline-flex rounded-full bg-neutral-200 text-base font-semibold uppercase tracking-wide text-neutral-800">{t("discoveryBadge")}</p>
                                            <p className="mb-0 inline-flex rounded-full bg-secondaryShades-4 px-3 py-1 text-base font-semibold uppercase tracking-wide text-secondary-4">
                                                {t("discountBadge")}
                                            </p>
                                        </div>
                                        <div className="mb-0 flex items-end justify-center gap-2 whitespace-nowrap sm:justify-start sm:gap-3">
                                            <p className="mb-0 text-3xl font-extrabold leading-none text-secondary-6 sm:text-5xl">20 CHF</p>
                                            <p className="mb-0 text-base font-semibold text-neutral-500 sm:text-lg">
                                                {t("oldPricePrefix")} <span className="line-through">50 CHF</span>
                                            </p>
                                        </div>
                                    </div>
                                    <MockExamCheckoutCTA
                                        labels={{
                                            cta: t("cta"),
                                            ctaUseCredit: t("ctaUseCredit"),
                                            ctaDisabled: t("ctaDisabled"),
                                            disabledHasCredit: t("disabled.hasCredit"),
                                            disabledNoTemplates: t("disabled.noTemplates"),
                                        }}
                                        useShimmer
                                        ctaClassName="btn btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                                        useCreditClassName="btn btn-secondary inline-flex w-full items-center justify-center gap-2 no-underline sm:w-auto"
                                        disabledClassName="btn btn-secondary inline-flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-75 sm:w-auto"
                                        containerClassName="flex flex-col items-center gap-0 sm:items-start"
                                        disabledMessageClassName="mb-0 mt-2 min-h-10 text-center text-xs text-neutral-600 sm:text-left"
                                        reserveMessageSpace
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="order-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:order-2 lg:gap-8">
                            {heroCards.map(({ key, Icon, barClassName, iconWrapperClassName, iconClassName }) => (
                                <article key={key} className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                    <div className={`absolute inset-y-0 left-0 w-1 ${barClassName}`} />
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${iconWrapperClassName}`}>
                                            <Icon className={`h-4 w-4 ${iconClassName}`} />
                                        </span>
                                        <p className="mb-0 text-base font-bold text-neutral-800">{t(`cards.${key}.title`)}</p>
                                    </div>
                                    <p className="mb-0 text-sm text-neutral-700">{t(`cards.${key}.text`)}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
