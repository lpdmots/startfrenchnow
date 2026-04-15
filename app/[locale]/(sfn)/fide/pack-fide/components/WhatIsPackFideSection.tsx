import { VideoFide } from "../../components/VideoFide";
import { FideCourseRatings } from "@/app/components/sfn/courses/FideCourseRatings";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

export function WhatIsPackFideSection() {
    const t = useTranslations("Fide.PackFideWhatIs");
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
        <section className="bg-neutral-800 color-neutral-100 text-neutral-200 py-12 lg:py-24 px-4 lg:px-8">
            <div className="max-w-7xl m-auto">
                <h2 className="display-2 mb-8 lg:mb-12 text-left text-neutral-200">{t.rich("title", rich)}</h2>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 xl:gap-12 lg:items-center">
                    <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-6 order-2 lg:order-1 lg:h-full lg:justify-center">
                        <div className="flex gap-2 lg:gap-4">
                            <div className="bullet bg-secondary-4 mt-[1px] md:mt-2"></div>
                            <p className="text-lg lg:text-2xl mb-0">{t.rich("bullets.1", rich)}</p>
                        </div>
                        <div className="flex gap-2 lg:gap-4">
                            <div className="bullet bg-secondary-5 mt-[1px] md:mt-2"></div>
                            <p className="text-lg lg:text-2xl mb-0">{t.rich("bullets.2", rich)}</p>
                        </div>
                        <div className="flex gap-2 lg:gap-4">
                            <div className="bullet bg-secondary-2 mt-[1px] md:mt-2"></div>
                            <p className="text-lg lg:text-2xl mb-0">{t.rich("bullets.3", rich)}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <VideoFide
                            videoKey="fide/videopresentation-soustitres-encode.mp4"
                            subtitle={t("videoSubtitle")}
                            poster="/images/fide-presentation-thumbnail.png"
                            isAnimated={false}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-around items-center w-full mt-8 lg:mt-10">
                    <p className="mb-0 display-3 shrink-0 text-center font-bold w-full sm:w-auto text-neutral-200">
                        {t.rich("proof.text", rich)}
                    </p>
                    <div className="flex justify-center items-center">
                        <FideCourseRatings />
                    </div>
                </div>
            </div>
        </section>
    );
}
