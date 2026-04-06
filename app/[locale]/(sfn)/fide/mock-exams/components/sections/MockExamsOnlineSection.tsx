import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { VideoFide } from "../../../components/VideoFide";
import { MockExamCheckoutCTA } from "../checkout/MockExamCheckoutCTA";

export function MockExamsOnlineSection() {
    const t = useTranslations("Fide.MockExamsPage.Online");

    return (
        <section id="mock-exams-video" className="py-14 lg:py-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <SlideFromBottom delay={0.05} duration={0.35}>
                    <div className="mx-auto mb-8 max-w-4xl text-center">
                        <p className="mb-2 inline-flex rounded-full bg-secondary-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">{t("badge")}</p>
                        <h2 className="display-2 mb-3">
                            {t("titlePrefix")} <span className="heading-span-secondary-2">{t("titleHighlight")}</span> {t("titleSuffix")}
                        </h2>
                        <p className="mb-0 text-base text-neutral-700 md:text-lg">{t("subtitle")}</p>
                    </div>
                </SlideFromBottom>

                <Fade delay={0.15} duration={0.35}>
                    <div className="mb-4 flex w-full flex-col items-center justify-center gap-2 md:mb-8">
                        <MockExamCheckoutCTA
                            labels={{
                                cta: t("cta"),
                                ctaUseCredit: t("ctaUseCredit"),
                                ctaDisabled: t("ctaDisabled"),
                                disabledHasCredit: t("disabled.hasCredit"),
                                disabledNoTemplates: t("disabled.noTemplates"),
                            }}
                            useShimmer
                            ctaClassName="btn btn-primary small inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                            useCreditClassName="btn btn-secondary small inline-flex w-full items-center justify-center gap-2 no-underline sm:w-auto"
                            disabledClassName="btn btn-secondary small inline-flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-75 sm:w-auto"
                            containerClassName="flex flex-col items-center gap-2"
                            disabledMessageClassName="mb-0 text-center text-xs text-neutral-600"
                        />
                    </div>
                </Fade>

                <SlideFromBottom delay={0.1} duration={0.4}>
                    <div className="mx-auto w-full max-w-[860px]">
                        <VideoFide videoKey="mock-exams/videos-presentation/presentation-page-mock-exam.mp4" isAnimated={false} />
                    </div>
                </SlideFromBottom>

                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 pt-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch lg:gap-4 lg:pt-16">
                    <SlideFromBottom delay={0.1} duration={0.35}>
                        <article className="relative h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md flex flex-col">
                            <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                            <div className="mb-2 flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2 text-sm font-semibold text-neutral-800">1</span>
                                <p className="mb-0 text-base font-bold text-neutral-800">{t("steps.step1.title")}</p>
                            </div>
                            <p className="mb-0 text-sm text-neutral-700">{t("steps.step1.text")}</p>
                        </article>
                    </SlideFromBottom>

                    <Fade delay={0.15} duration={0.3}>
                        <div className="h-full min-h-10 flex items-center justify-center text-neutral-500 lg:text-neutral-400">
                            <ChevronDown className="h-5 w-5 lg:hidden" />
                            <ChevronRight className="hidden h-5 w-5 lg:block" />
                        </div>
                    </Fade>

                    <SlideFromBottom delay={0.2} duration={0.35}>
                        <article className="relative h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md flex flex-col">
                            <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                            <div className="mb-2 flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5 text-sm font-semibold text-neutral-800">2</span>
                                <p className="mb-0 text-base font-bold text-neutral-800">{t("steps.step2.title")}</p>
                            </div>
                            <p className="mb-0 text-sm text-neutral-700">{t("steps.step2.text")}</p>
                        </article>
                    </SlideFromBottom>

                    <Fade delay={0.25} duration={0.3}>
                        <div className="h-full min-h-10 flex items-center justify-center text-neutral-500 lg:text-neutral-400">
                            <ChevronDown className="h-5 w-5 lg:hidden" />
                            <ChevronRight className="hidden h-5 w-5 lg:block" />
                        </div>
                    </Fade>

                    <SlideFromBottom delay={0.3} duration={0.35}>
                        <article className="relative h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md flex flex-col">
                            <div className="absolute inset-y-0 left-0 w-1 bg-secondary-6" />
                            <div className="mb-2 flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-4 text-sm font-semibold text-neutral-800">3</span>
                                <p className="mb-0 text-base font-bold text-neutral-800">{t("steps.step3.title")}</p>
                            </div>
                            <p className="mb-0 text-sm text-neutral-700">{t("steps.step3.text")}</p>
                        </article>
                    </SlideFromBottom>
                </div>
            </div>
        </section>
    );
}
