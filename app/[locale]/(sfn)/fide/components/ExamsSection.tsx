"use client";

import Link from "next-intl/link";
import { LuBarChart3, LuClock, LuFileCheck2, LuCheckCircle2, LuActivity } from "react-icons/lu";
import { LucideSparkles } from "lucide-react";
import Image from "next/image";
import { HiCheckCircle } from "react-icons/hi";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { LinkArrowToFideExams } from "@/app/components/common/LinkToFideExams";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import { SlideFromLeft, SlideFromRight } from "@/app/components/animations/Slides";

export default function ExamsSection({
    stats = { totalExams: 100, avgDurationMin: 12, completionRate: 0.82 },
    hasPack,
}: {
    stats?: { totalExams: number; avgDurationMin: number; completionRate: number };
    hasPack?: boolean;
}) {
    const { totalExams, avgDurationMin, completionRate } = stats;
    const t = useTranslations("ExamsSection");

    return (
        <section id="exams" className="w-full bg-neutral-200 py-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 overflow-hidden">
                {/* Header */}
                <SlideFromLeft>
                    <header className="mb-12">
                        <h2 className="display-2 mb-4 lg:mb-8">{t.rich("title", { ...intelRich(), exams: totalExams })}</h2>
                        <p>{t("subtitle")}</p>
                    </header>
                </SlideFromLeft>

                {/* Benefits */}
                <div className="mb-4 lg:mb-12 grid grid-cols-1 lg:grid-cols-7 gap-12">
                    <div className="col-span-1 lg:col-span-3 grid grid-cols-2 gap-2 xl:gap-4">
                        <BenefitCard icon={<LuActivity className="text-xl" />} title={t("benefit1.title")} desc={t("benefit1.desc")} color="bg-secondary-4" />
                        <BenefitCard icon={<LucideSparkles className="text-xl" />} title={t("benefit2.title")} desc={t("benefit2.desc")} color="bg-secondary-2" />
                        <BenefitCard icon={<LuFileCheck2 className="text-xl" />} title={t("benefit3.title")} desc={t("benefit3.desc")} color="bg-secondary-1" />
                        <BenefitCard icon={<LuBarChart3 className="text-xl" />} title={t("benefit4.title")} desc={t("benefit4.desc")} color="bg-secondary-5" />
                    </div>

                    <div className="col-span-1 lg:col-span-4 flex justify-center items-center">
                        <SlideFromRight>
                            <Image src="/images/examsMobile.png" alt={t("imageAlt")} layout="responsive" width={800} height={500} className="w-full h-auto object-contain max-w-2xl" />
                        </SlideFromRight>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-4 justify-center items-center w-full flex-wrap">
                    {hasPack ? (
                        <Link href="/fide#plans" className="w-full sm:w-auto !no-underline">
                            <ShimmerButton className="w-button flex items-center justify-center w-full sm:w-auto">{t("ctaHasPack")}</ShimmerButton>
                        </Link>
                    ) : (
                        <Link href="#plans" className="w-full sm:w-auto !no-underline">
                            <ShimmerButton className="w-button flex items-center justify-center w-full sm:w-auto">{t("ctaNoPack")}</ShimmerButton>
                        </Link>
                    )}
                    <LinkArrowToFideExams className="text-xl font-bold text-neutral-700" category="culture">
                        <span className="flex items-center">
                            <HiCheckCircle className="text-6xl mr-2 text-secondary-5" /> <span>{t("linkAllExams")}</span>
                        </span>
                    </LinkArrowToFideExams>
                </div>
            </div>
        </section>
    );
}

function BenefitCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
    return (
        <div className="col-span-2 md:col-span-1 lg:col-span-2 rounded-xl border border-solid border-neutral-800 p-2 xl:p-4 shadow-sm flex flex-nowrap gap-2 xl:gap-4 items-center">
            <div className={`m-2 h-12 w-12 rounded-xl shrink-0 ${color}`}>
                <div className="flex w-full h-full justify-center items-center">{icon}</div>
            </div>
            <div>
                <p className="font-semibold mb-0">{title}</p>
                <p className="m-0 text-sm text-neutral-600">{desc}</p>
            </div>
        </div>
    );
}
