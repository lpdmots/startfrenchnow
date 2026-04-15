import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, FileCheck2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

export function FidePageHubSection() {
    const t = useTranslations("Fide.FidePageHub");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
    };

    return (
        <section id="fide-hub" className="py-16 lg:py-24">
            <div id="plans" className="scroll-mt-24" />
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="display-2 mb-4">{t.rich("title", rich)}</h2>
                    <p className="mb-0">{t("subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                    <Link
                        href="/fide/pack-fide"
                        className="group flex h-full flex-col rounded-2xl border border-neutral-300 bg-neutral-100 p-5 !no-underline shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-6 hover:shadow-md"
                    >
                        <div className="mb-4 flex h-56 justify-center overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 p-2">
                            <Image
                                src="/images/pack-fide-hero.png"
                                alt={t("cards.pack.imageAlt")}
                                width={1200}
                                height={675}
                                sizes="(min-width: 992px) 380px, (min-width: 768px) 33vw, 100vw"
                                className="h-full w-full max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-4">
                                <BookOpen className="h-5 w-5 text-secondary-6" />
                            </div>
                            <p className="mb-1 text-lg font-bold text-neutral-800">{t("cards.pack.title")}</p>
                            <p className="mb-4 text-sm text-neutral-700">{t("cards.pack.description")}</p>
                            <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-6">
                                {t("cards.pack.cta")}
                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/fide/mock-exams"
                        className="group flex h-full flex-col rounded-2xl border border-neutral-300 bg-neutral-100 p-5 !no-underline shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-5 hover:shadow-md"
                    >
                        <div className="mb-4 flex h-56 justify-center overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 p-2">
                            <Image
                                src="/images/mock-exam-hero2.png"
                                alt={t("cards.mockExams.imageAlt")}
                                width={1200}
                                height={675}
                                sizes="(min-width: 992px) 380px, (min-width: 768px) 33vw, 100vw"
                                className="h-full w-full max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-5">
                                <FileCheck2 className="h-5 w-5 text-secondary-5" />
                            </div>
                            <p className="mb-1 text-lg font-bold text-neutral-800">{t("cards.mockExams.title")}</p>
                            <p className="mb-4 text-sm text-neutral-700">{t("cards.mockExams.description")}</p>
                            <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-5">
                                {t("cards.mockExams.cta")}
                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/fide/private-courses"
                        className="group flex h-full flex-col rounded-2xl border border-neutral-300 bg-neutral-100 p-5 !no-underline shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-2 hover:shadow-md"
                    >
                        <div className="mb-4 flex h-56 justify-center overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 p-2">
                            <Image
                                src="/images/etudiante-cours.png"
                                alt={t("cards.private.imageAlt")}
                                width={1200}
                                height={675}
                                sizes="(min-width: 992px) 380px, (min-width: 768px) 33vw, 100vw"
                                className="h-full w-full max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-2">
                                <UserRound className="h-5 w-5 text-secondary-2" />
                            </div>
                            <p className="mb-1 text-lg font-bold text-neutral-800">{t("cards.private.title")}</p>
                            <p className="mb-4 text-sm text-neutral-700">{t("cards.private.description")}</p>
                            <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-2">
                                {t("cards.private.cta")}
                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
