import { FideLiteYoutubeEmbed } from "./FideLiteYoutubeEmbed";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";

export function FidePageTipsSection() {
    const t = useTranslations("Fide.FidePageTips");

    return (
        <section id="fide-tips" className="py-16 lg:py-24 bg-neutral-800">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h2 className="display-2 mb-4 text-neutral-100">
                    <span className="heading-span-secondary-5">{t("titleHighlight")}</span> {t("titleSuffix")}
                </h2>
                <p className="mb-0 text-neutral-200 text-justify">
                    {t("intro.line1")}
                    <br />
                    <b className="underline decoration-2 decoration-secondary-5">{t("intro.goalLabel")}</b> {t("intro.line2")}
                </p>

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
                    <div>
                        <FideLiteYoutubeEmbed id="wMv-bzxLmnk" title={t("videoTitle")} />
                    </div>

                    <div className="space-y-6">
                        <div className="pl-4 border-l-4 border-secondary-6">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">{t("tips.1.label")}</p>
                            <p className="mb-0 text-neutral-200">
                                {t("tips.1.text.prefix")}
                                <span className="underline decoration-2 decoration-secondary-5">{t("tips.1.text.under1")}</span>, {t("tips.1.text.middle")}{" "}
                                <span className="underline decoration-2 decoration-secondary-5">{t("tips.1.text.under2")}</span>.
                            </p>
                        </div>
                        <div className="pl-4 border-l-4 border-secondary-2">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">{t("tips.2.label")}</p>
                            <p className="mb-0 text-neutral-200">
                                {t("tips.2.text.prefix")}{" "}
                                <LinkArrow url="/fide/mock-exams" target="_self" className="!text-lg font-semibold !text-secondary-5 hover:!text-secondary-5 inline-flex">
                                    {t("tips.2.text.linkLabel")}
                                </LinkArrow>
                                , {t("tips.2.text.suffixPrefix")} <span className="underline decoration-2 decoration-secondary-5">{t("tips.2.text.under")}</span>{" "}
                                {t("tips.2.text.suffix")}
                            </p>
                        </div>
                        <div className="pl-4 border-l-4 border-secondary-5">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">{t("tips.3.label")}</p>
                            <p className="mb-0 text-neutral-200">
                                {t("tips.3.text.prefix")}
                                <span className="underline decoration-2 decoration-secondary-5">{t("tips.3.text.under1")}</span>, {t("tips.3.text.middle")}{" "}
                                <span className="underline decoration-2 decoration-secondary-5">{t("tips.3.text.under2")}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-2">
                    <div>
                        <p className="mb-3 text-xl font-semibold text-neutral-100">{t("keyPoints.title")}</p>
                        <ul className="mb-0 list-none pl-0 space-y-3">
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    <span className="underline decoration-2 decoration-secondary-5">{t("keyPoints.items.1.under")}</span>
                                    {t("keyPoints.items.1.rest")}
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    <span className="underline decoration-2 decoration-secondary-5">{t("keyPoints.items.2.under")}</span>
                                    {t("keyPoints.items.2.rest")}
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    <span className="underline decoration-2 decoration-secondary-5">{t("keyPoints.items.3.under")}</span>
                                    {t("keyPoints.items.3.rest")}
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-3 text-xl font-semibold text-neutral-100">{t("examDay.title")}</p>
                        <ul className="mb-0 list-none pl-0 space-y-3">
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-4 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    <span className="underline decoration-2 decoration-secondary-5">{t("examDay.items.1.under")}</span>
                                    {t("examDay.items.1.rest")}
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-1 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    {t("examDay.items.2.prefix")}
                                    <span className="underline decoration-2 decoration-secondary-5">{t("examDay.items.2.under")}</span>
                                    {t("examDay.items.2.suffix")}
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    {t("examDay.items.3.prefix")}
                                    <span className="underline decoration-2 decoration-secondary-5">{t("examDay.items.3.under")}</span>
                                    {t("examDay.items.3.suffix")}
                                </span>
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
