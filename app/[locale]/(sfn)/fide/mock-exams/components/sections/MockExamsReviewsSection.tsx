import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import { useTranslations } from "next-intl";
import { DeferredMockExamsReviewsCarousel } from "../DeferredMockExamsReviewsCarousel";

export function MockExamsReviewsSection() {
    const t = useTranslations("Fide.MockExamsPage.Reviews");

    return (
        <section id="mock-exams-reviews" className="pt-0 pb-14 lg:pb-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <SlideFromBottom>
                    <div className="flex w-full justify-center">
                        <div className="max-w-5xl text-center">
                            <p className="mb-3 inline-flex rounded-full bg-secondary-5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">{t("badge")}</p>
                            <h2 className="display-2 mb-2">
                                <span className="heading-span-secondary-5">{t("titleHighlight")}</span> {t("titleSuffix")}
                            </h2>
                            <p className="mb-0 text-base text-neutral-700 md:text-lg">{t("subtitle")}</p>
                        </div>
                    </div>
                </SlideFromBottom>
                <Fade delay={0.6}>
                    <DeferredMockExamsReviewsCarousel />
                </Fade>
            </div>
        </section>
    );
}
