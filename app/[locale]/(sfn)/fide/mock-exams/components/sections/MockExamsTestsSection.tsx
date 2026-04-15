import { SlideFromBottom, SlideFromLeft } from "@/app/components/animations/Slides";
import { ChevronRight, CircleCheck, CircleDot, FileText, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

export function MockExamsTestsSection() {
    const t = useTranslations("Fide.MockExamsPage.Tests");
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
        <section id="mock-exams-tests" className="bg-neutral-800 py-14 text-neutral-100 lg:py-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] lg:gap-12">
                    <SlideFromLeft>
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <p className="mb-2 inline-flex rounded-full bg-secondaryShades-5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">{t("badge")}</p>
                            <h2 className="display-2 mb-4 text-neutral-100">
                                {t.rich("title", rich)}
                            </h2>
                            <p className="mb-4 text-base text-neutral-200 md:text-lg">{t("subtitle")}</p>
                            <div className="space-y-2">
                                <p className="mb-0 flex items-start gap-2 text-sm text-neutral-200">
                                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary-5" />
                                    <span>{t("checks.structure")}</span>
                                </p>
                                <p className="mb-0 flex items-start gap-2 text-sm text-neutral-200">
                                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary-5" />
                                    <span>{t("checks.guided")}</span>
                                </p>
                                <p className="mb-0 flex items-start gap-2 text-sm text-neutral-200">
                                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary-5" />
                                    <span>{t("checks.detailed")}</span>
                                </p>
                            </div>
                        </div>
                    </SlideFromLeft>

                    <div className="grid grid-cols-1 gap-8 lg:gap-12">
                        <SlideFromBottom duration={0.35} delay={0.1}>
                            <article className="rounded-2xl bg-neutral-800">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-secondaryShades-4 px-2 text-lg font-semibold text-neutral-800">01</span>
                                    <MessageSquare className="h-8 w-8 text-secondary-4" />
                                    <p className="mb-0 text-xl font-bold uppercase">{t("cards.speaking.title")}</p>
                                </div>
                                <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3">
                                    <div className="min-w-0 rounded-xl border border-solid border-neutral-400 p-3">
                                        <p className="mb-1 inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">{t("cards.inFideTest")}</p>
                                        <p className="mb-0 text-base text-neutral-200">{t("cards.speaking.testText")}</p>
                                    </div>
                                    <div className="hidden justify-center lg:flex">
                                        <ChevronRight className="h-6 w-6 text-neutral-400" />
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-solid border-secondary-4 p-3">
                                        <p className="mb-1 inline-flex rounded-full bg-secondaryShades-4 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">{t("cards.inApp")}</p>
                                        <p className="mb-0 text-base text-neutral-200">{t("cards.speaking.appText")}</p>
                                    </div>
                                </div>
                                <Image
                                    src="/images/parler-mock-exam.png"
                                    alt={t("cards.speaking.imageAlt")}
                                    width={760}
                                    height={680}
                                    className="h-auto w-full rounded-lg object-contain"
                                    sizes="(min-width: 1024px) 720px, 100vw"
                                />
                            </article>
                        </SlideFromBottom>

                        <SlideFromBottom duration={0.35} delay={0.2}>
                            <article className="rounded-2xl bg-neutral-800">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-secondaryShades-2 px-2 text-lg font-semibold text-neutral-800">02</span>
                                    <CircleDot className="h-8 w-8 text-secondary-2" />
                                    <p className="mb-0 text-xl font-bold uppercase">{t("cards.listening.title")}</p>
                                </div>
                                <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3">
                                    <div className="min-w-0 rounded-xl border border-solid border-neutral-400 p-3">
                                        <p className="mb-1 inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">{t("cards.inFideTest")}</p>
                                        <p className="mb-0 text-base text-neutral-200">{t("cards.listening.testText")}</p>
                                    </div>
                                    <div className="hidden justify-center lg:flex">
                                        <ChevronRight className="h-6 w-6 text-neutral-400" />
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-solid border-secondary-2 p-3">
                                        <p className="mb-1 inline-flex rounded-full bg-secondaryShades-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">{t("cards.inApp")}</p>
                                        <p className="mb-0 text-base text-neutral-200">{t("cards.listening.appText")}</p>
                                    </div>
                                </div>
                                <Image
                                    src="/images/comprendre-mock-exam.png"
                                    alt={t("cards.listening.imageAlt")}
                                    width={760}
                                    height={680}
                                    className="h-auto w-full rounded-lg object-contain"
                                    sizes="(min-width: 1024px) 720px, 100vw"
                                />
                            </article>
                        </SlideFromBottom>

                        <SlideFromBottom duration={0.35} delay={0.3}>
                            <article className="rounded-2xl bg-neutral-800">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-secondaryShades-5 px-2 text-lg font-semibold text-neutral-800">03</span>
                                    <FileText className="h-8 w-8 text-secondary-5" />
                                    <p className="mb-0 text-xl font-bold uppercase">{t("cards.readWrite.title")}</p>
                                </div>
                                <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3">
                                    <div className="min-w-0 rounded-xl border border-solid border-neutral-400 p-3">
                                        <p className="mb-1 inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">{t("cards.inFideTest")}</p>
                                        <p className="mb-0 text-base text-neutral-200">{t("cards.readWrite.testText")}</p>
                                    </div>
                                    <div className="hidden justify-center lg:flex">
                                        <ChevronRight className="h-6 w-6 text-neutral-400" />
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-solid border-secondary-5 p-3">
                                        <p className="mb-1 inline-flex rounded-full bg-secondaryShades-5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">{t("cards.inApp")}</p>
                                        <p className="mb-0 text-base text-neutral-200">{t("cards.readWrite.appText")}</p>
                                    </div>
                                </div>
                                <Image
                                    src="/images/lire-ecrire-mock-exam.png"
                                    alt={t("cards.readWrite.imageAlt")}
                                    width={760}
                                    height={680}
                                    className="h-auto w-full rounded-lg object-contain"
                                    sizes="(min-width: 1024px) 720px, 100vw"
                                />
                            </article>
                        </SlideFromBottom>
                    </div>
                </div>
            </div>
        </section>
    );
}
