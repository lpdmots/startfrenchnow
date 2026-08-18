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
        <section id="fide-hub" className="!py-16 lg:!py-24">
            <div id="plans" className="scroll-mt-24" />
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="display-2 mb-4">{t.rich("title", rich)}</h2>
                    <p className="mx-auto mb-0 max-w-2xl text-neutral-700">{t("subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                    <Link
                        href="/fide/mock-exams"
                        className="fide-elevated-card group flex h-full flex-col rounded-2xl bg-neutral-100 p-5 !no-underline transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.96] motion-reduce:transform-none"
                    >
                        <div className="mb-4 flex h-56 justify-center overflow-hidden rounded-xl bg-neutral-200 p-2">
                            <Image
                                src="/images/mock-exam-hero.avif"
                                alt={t("cards.mockExams.imageAlt")}
                                width={1200}
                                height={675}
                                sizes="(min-width: 992px) 380px, (min-width: 768px) 33vw, 100vw"
                                className="fide-image-outline h-full w-full max-w-[420px] rounded object-contain outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-150 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
                            />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-5">
                                <FileCheck2 aria-hidden="true" className="size-5 text-secondary-5" strokeWidth={2} />
                            </div>
                            <p className="mb-1 text-lg font-bold text-neutral-800">{t("cards.mockExams.title")}</p>
                            <p className="mb-4 text-sm text-neutral-700">{t("cards.mockExams.description")}</p>
                            <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-5">
                                {t("cards.mockExams.cta")}
                                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" strokeWidth={2} />
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/fide/pack-fide"
                        className="fide-elevated-card group flex h-full flex-col rounded-2xl bg-neutral-100 p-5 !no-underline transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.96] motion-reduce:transform-none"
                    >
                        <div className="mb-4 flex h-56 justify-center overflow-hidden rounded-xl bg-neutral-200 p-2">
                            <Image
                                src="/images/pack-fide-hero.png"
                                alt={t("cards.pack.imageAlt")}
                                width={1200}
                                height={675}
                                sizes="(min-width: 992px) 380px, (min-width: 768px) 33vw, 100vw"
                                className="fide-image-outline h-full w-full max-w-[420px] rounded object-contain outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-150 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
                            />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-4">
                                <BookOpen aria-hidden="true" className="size-5 text-secondary-6" strokeWidth={2} />
                            </div>
                            <p className="mb-1 text-lg font-bold text-neutral-800">{t("cards.pack.title")}</p>
                            <p className="mb-4 text-sm text-neutral-700">{t("cards.pack.description")}</p>
                            <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-6">
                                {t("cards.pack.cta")}
                                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" strokeWidth={2} />
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/fide/private-courses"
                        className="fide-elevated-card group flex h-full flex-col rounded-2xl bg-neutral-100 p-5 !no-underline transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.96] motion-reduce:transform-none"
                    >
                        <div className="mb-4 flex h-56 justify-center overflow-hidden rounded-xl bg-neutral-200 p-2">
                            <Image
                                src="/images/etudiante-cours.avif"
                                alt={t("cards.private.imageAlt")}
                                width={1200}
                                height={675}
                                sizes="(min-width: 992px) 380px, (min-width: 768px) 33vw, 100vw"
                                className="fide-image-outline h-full w-full max-w-[420px] rounded object-contain outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-150 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
                            />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-2">
                                <UserRound aria-hidden="true" className="size-5 text-secondary-2" strokeWidth={2} />
                            </div>
                            <p className="mb-1 text-lg font-bold text-neutral-800">{t("cards.private.title")}</p>
                            <p className="mb-4 text-sm text-neutral-700">{t("cards.private.description")}</p>
                            <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-2">
                                {t("cards.private.cta")}
                                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" strokeWidth={2} />
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
