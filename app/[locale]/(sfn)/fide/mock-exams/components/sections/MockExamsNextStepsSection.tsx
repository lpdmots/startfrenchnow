import { SlideFromBottom, SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, UserRound } from "lucide-react";

export function MockExamsNextStepsSection() {
    const t = useTranslations("Fide.MockExamsPage.NextSteps");

    return (
        <section id="mock-exams-next-steps" className="pt-4 pb-14 lg:pt-8 lg:pb-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <div className="p-0">
                    <SlideFromBottom delay={0.05} duration={0.35}>
                        <div className="mx-auto mb-8 max-w-3xl text-center">
                            <p className="mb-3 inline-flex rounded-full bg-secondary-3 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">{t("badge")}</p>
                            <h2 className="display-3 mb-2">
                                {t("titlePrefix")} <span className="heading-span-secondary-3">{t("titleHighlight")}</span> {t("titleSuffix")}
                            </h2>
                            <p className="mb-0 text-base text-neutral-700 md:text-lg">{t("subtitle")}</p>
                        </div>
                    </SlideFromBottom>

                    <SlideInOneByOneParent delay={0.05} delayChildren={0.1} duration={0.35}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                            <SlideInOneByOneChild duration={0.35}>
                                <Link
                                    href="/fide"
                                    className="group block h-full !no-underline rounded-2xl border border-neutral-300 bg-neutral-100 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-6 hover:shadow-md"
                                >
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-4">
                                        <BookOpen className="h-5 w-5 text-secondary-6" />
                                    </div>
                                    <p className="mb-1 text-lg font-bold text-neutral-800">{t("pack.title")}</p>
                                    <p className="mb-4 text-sm text-neutral-700">{t("pack.description")}</p>
                                    <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-6">
                                        {t("pack.cta")}
                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </p>
                                </Link>
                            </SlideInOneByOneChild>

                            <SlideInOneByOneChild duration={0.35}>
                                <Link
                                    href="/fide"
                                    className="group block h-full !no-underline rounded-2xl border border-neutral-300 bg-neutral-100 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-2 hover:shadow-md"
                                >
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-2">
                                        <UserRound className="h-5 w-5 text-secondary-2" />
                                    </div>
                                    <p className="mb-1 text-lg font-bold text-neutral-800">{t("private.title")}</p>
                                    <p className="mb-4 text-sm text-neutral-700">{t("private.description")}</p>
                                    <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-2">
                                        {t("private.cta")}
                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </p>
                                </Link>
                            </SlideInOneByOneChild>
                        </div>
                    </SlideInOneByOneParent>
                </div>
            </div>
        </section>
    );
}
