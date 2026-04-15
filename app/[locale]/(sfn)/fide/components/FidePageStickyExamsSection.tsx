import { FideLiteYoutubeEmbed } from "./FideLiteYoutubeEmbed";
import { FideStickyScrollReveal } from "./FideStickyScrollReveal";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function FidePageStickyExamsSection() {
    const t = useTranslations("Fide.FidePageStickyExams");
    const rich = {
        strong: (chunks: any) => <strong>{chunks}</strong>,
        b: (chunks: any) => <strong>{chunks}</strong>,
        i: (chunks: any) => <i>{chunks}</i>,
    };
    const speakingCtaRich = {
        ...rich,
        link: (chunks: ReactNode) => (
            <LinkArrow url="/fide/private-courses" target="_self" className="text-sm font-semibold !text-secondary-2 hover:!text-secondary-2 inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };
    const listeningCtaRich = {
        ...rich,
        link: (chunks: ReactNode) => (
            <LinkArrow url="/fide/mock-exams" target="_self" className="text-sm font-semibold !text-secondary-5 hover:!text-secondary-5 inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };
    const readWriteCtaRich = {
        ...rich,
        link: (chunks: ReactNode) => (
            <LinkArrow url="/fide/pack-fide" target="_self" className="text-sm font-semibold !text-secondary-6 hover:!text-secondary-6 inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };

    const stickyItems = [
        {
            id: "fide-oral-speaking",
            content: (
                <>
                    <h3 className="text-2xl md:text-4xl font-bold leading-tight mb-4">{t("speaking.title")}</h3>
                    <div className="space-y-4">
                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("speaking.paragraphs.p1", rich)}</p>

                        <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 shadow-sm">
                            <p className="mb-2 font-bold text-neutral-800">{t("speaking.a2Tasks.title")}</p>
                            <ul className="mb-0 list-none pl-0 space-y-2">
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("speaking.a2Tasks.items.1", rich)}</span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("speaking.a2Tasks.items.2", rich)}</span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("speaking.a2Tasks.items.3", rich)}</span>
                                </li>
                            </ul>
                        </div>

                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("speaking.paragraphs.p2", rich)}</p>

                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("speaking.paragraphs.p3", rich)}</p>

                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("speaking.paragraphs.p4", rich)}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-neutral-600">{t.rich("speaking.ctaLine.text", speakingCtaRich)}</span>
                        <LinkArrow url="/blog/post/2-le-test-fide-la-partie-orale-parler" target="_self" className="text-lg font-semibold text-secondary-2 hover:!text-secondary-2">
                            {t("speaking.ctaGuide")}
                        </LinkArrow>
                    </div>
                </>
            ),
            media: <FideLiteYoutubeEmbed id="HJ0gjYlbmAw" title={t("speaking.videoTitle")} />,
        },
        {
            id: "fide-oral-listening",
            content: (
                <>
                    <h3 className="text-2xl md:text-4xl font-bold leading-tight mb-4">{t("listening.title")}</h3>
                    <div className="space-y-4">
                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("listening.paragraphs.p1", rich)}</p>

                        <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 shadow-sm">
                            <p className="mb-2 font-bold text-neutral-800">{t("listening.levelFormat.title")}</p>
                            <ul className="mb-0 list-none pl-0 space-y-2">
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("listening.levelFormat.items.a1", rich)}</span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("listening.levelFormat.items.a2", rich)}</span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("listening.levelFormat.items.b1", rich)}</span>
                                </li>
                            </ul>
                        </div>

                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("listening.paragraphs.p2", rich)}</p>

                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("listening.paragraphs.p3", rich)}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-neutral-600">{t.rich("listening.ctaLine.text", listeningCtaRich)}</span>
                        <LinkArrow url="/blog/post/3-le-test-fide-la-partie-orale-comprendre" target="_self" className="text-lg font-semibold text-secondary-2 hover:!text-secondary-2">
                            {t("listening.ctaGuide")}
                        </LinkArrow>
                    </div>
                </>
            ),
            media: <FideLiteYoutubeEmbed id="q2ov3ONIszw" title={t("listening.videoTitle")} />,
        },
        {
            id: "fide-read-write",
            content: (
                <>
                    <h3 className="text-2xl md:text-4xl font-bold leading-tight mb-4">{t("readWrite.title")}</h3>
                    <div className="space-y-4">
                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("readWrite.paragraphs.p1", rich)}</p>
                        <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 shadow-sm">
                            <p className="mb-2 font-bold text-neutral-800">{t("readWrite.structure.title")}</p>
                            <ul className="mb-0 list-none pl-0 space-y-2">
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("readWrite.structure.items.duration", rich)}</span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("readWrite.structure.items.modules", rich)}</span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>{t.rich("readWrite.structure.items.perModule", rich)}</span>
                                </li>
                            </ul>
                        </div>
                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("readWrite.paragraphs.p2", rich)}</p>
                        <p>{t.rich("readWrite.paragraphs.p3", rich)}</p>
                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("readWrite.paragraphs.p4", rich)}</p>
                        <p className="mb-0 text-neutral-700 text-justify">{t.rich("readWrite.paragraphs.p5", rich)}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-neutral-600">{t.rich("readWrite.ctaLine.text", readWriteCtaRich)}</span>
                        <LinkArrow url="/blog/post/4-le-test-fide-lire-et-ecrire" target="_self" className="text-lg font-semibold text-secondary-2 hover:!text-secondary-2">
                            {t("readWrite.ctaGuide")}
                        </LinkArrow>
                    </div>
                </>
            ),
            media: <FideLiteYoutubeEmbed id="aSyBOLTKkcc" title={t("readWrite.videoTitle")} />,
        },
    ];

    return (
        <section id="whatIsFIDE" className="py-16 lg:py-24 bg-neutral-200">
            <FideStickyScrollReveal
                items={stickyItems}
                activationOffset={0.04}
                sectionTitle={
                    <>
                        <span className="heading-span-secondary-2">{t("sectionTitleHighlight")}</span> {t("sectionTitleSuffix")}
                    </>
                }
                sectionSubtitle={t("sectionSubtitle")}
            />
        </section>
    );
}
