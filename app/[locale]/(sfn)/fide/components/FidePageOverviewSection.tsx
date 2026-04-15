import { Clock3, Target, CheckCircle2 } from "lucide-react";
import { FideLiteYoutubeEmbed } from "./FideLiteYoutubeEmbed";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

export function FidePageOverviewSection() {
    const t = useTranslations("Fide.FidePageOverview");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        link: (chunks: ReactNode) => (
            <LinkArrow url="/fide/private-courses" target="_self" className="!text-neutral-100 hover:!text-secondary-2 text-sm font-semibold inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };

    return (
        <section id="fide-overview" className="py-16 lg:py-24 bg-neutral-800">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h2 className="display-2 mb-8 lg:mb-12 text-neutral-100 text-center">{t.rich("title", rich)}</h2>
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                    <div className="order-1 mb-8 lg:mb-12">
                        <FideLiteYoutubeEmbed id="Cc78NsVrKNY" title={t("videoTitle")} />
                    </div>

                    <div className="order-2">
                        <p className="mb-4 text-neutral-200">{t.rich("paragraphs.p1Text", rich)}</p>
                        <p className="mb-5 text-neutral-200">{t.rich("paragraphs.p2Text", rich)}</p>

                        <div className="mb-5">
                            <ul className="mb-0 list-none pl-0 space-y-3">
                                <li className="flex items-start gap-3 text-neutral-200">
                                    <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <p className="mb-0">
                                        <strong>{t("examParts.oral.strong")}</strong> {t("examParts.oral.rest")}
                                    </p>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-200">
                                    <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <p className="mb-0">
                                        <strong>{t("examParts.written.strong")}</strong> {t("examParts.written.rest")}
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mb-5 flex flex-wrap gap-2">
                    <p className="text-lg underline decoration-secondary-2 text-neutral-200">{t("situationsLabel")}</p>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">{t("situations.housing")}</span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">{t("situations.work")}</span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">{t("situations.transport")}</span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">{t("situations.health")}</span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">{t("situations.postBank")}</span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-600 bg-neutral-200 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-6" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-6">
                                <Clock3 className="h-4 w-4 text-secondary-6" />
                            </span>
                            <p className="mb-0 font-semibold text-neutral-800">{t("levels.a1.title")}</p>
                        </div>
                        <p className="mb-0 text-neutral-700">{t("levels.a1.text")}</p>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-600 bg-neutral-200 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5">
                                <Target className="h-4 w-4 text-secondary-5" />
                            </span>
                            <p className="mb-0 font-semibold text-neutral-800">{t("levels.a2.title")}</p>
                        </div>
                        <p className="mb-0 text-neutral-700">{t("levels.a2.text")}</p>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-600 bg-neutral-200 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2">
                                <CheckCircle2 className="h-4 w-4 text-secondary-2" />
                            </span>
                            <p className="mb-0 font-semibold text-neutral-800">{t("levels.b1.title")}</p>
                        </div>
                        <p className="mb-0 text-neutral-700">{t("levels.b1.text")}</p>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="mb-0 text-neutral-300 text-sm">{t.rich("ctaLine.text", rich)}</p>
                    <LinkArrow url="/blog/post/1-votre-guide-pratique-pour-reussir-le-test-fide" target="_self" className="!text-neutral-100 hover:!text-secondary-2 !text-xl font-semibold">
                        {t("ctaGuide")}
                    </LinkArrow>
                </div>
            </div>
        </section>
    );
}
