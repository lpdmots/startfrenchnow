import { FideLiteYoutubeEmbed } from "./FideLiteYoutubeEmbed";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

export function FidePageTipsSection() {
    const t = useTranslations("Fide.FidePageTips");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-5">{chunks}</span>,
    };
    const richWithBreak = {
        ...rich,
        br: () => <br />,
    };
    const richWithLink = {
        ...rich,
        link: (chunks: ReactNode) => (
            <LinkArrow url="/fide/mock-exams" target="_self" className="!text-lg font-semibold !text-secondary-5 hover:!text-secondary-5 inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };

    return (
        <section id="fide-tips" className="py-16 lg:py-24 bg-neutral-800">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h2 className="display-2 mb-4 text-neutral-100">{t.rich("title", rich)}</h2>
                <p className="mb-0 text-neutral-200 text-justify">{t.rich("intro", richWithBreak)}</p>

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
                    <div>
                        <FideLiteYoutubeEmbed id="wMv-bzxLmnk" title={t("videoTitle")} />
                    </div>

                    <div className="space-y-6">
                        <div className="pl-4 border-l-4 border-secondary-6">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">{t("tips.1.label")}</p>
                            <p className="mb-0 text-neutral-200">{t.rich("tips.1.text", rich)}</p>
                        </div>
                        <div className="pl-4 border-l-4 border-secondary-2">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">{t("tips.2.label")}</p>
                            <p className="mb-0 text-neutral-200">{t.rich("tips.2.text", richWithLink)}</p>
                        </div>
                        <div className="pl-4 border-l-4 border-secondary-5">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">{t("tips.3.label")}</p>
                            <p className="mb-0 text-neutral-200">{t.rich("tips.3.text", rich)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-2">
                    <div>
                        <p className="mb-3 text-xl font-semibold text-neutral-100">{t("keyPoints.title")}</p>
                        <ul className="mb-0 list-none pl-0 space-y-3">
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>{t.rich("keyPoints.items.1", rich)}</span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>{t.rich("keyPoints.items.2", rich)}</span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>{t.rich("keyPoints.items.3", rich)}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-3 text-xl font-semibold text-neutral-100">{t("examDay.title")}</p>
                        <ul className="mb-0 list-none pl-0 space-y-3">
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-4 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>{t.rich("examDay.items.1", rich)}</span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-1 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>{t.rich("examDay.items.2", rich)}</span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>{t.rich("examDay.items.3", rich)}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <LinkArrow url="/blog/post/7-le-test-fide-conseils-et-strategies" target="_self" className="text-xl font-semibold !text-neutral-100 hover:!text-secondary-5">
                        {t("ctaArticle")}
                    </LinkArrow>
                </div>
            </div>
        </section>
    );
}
