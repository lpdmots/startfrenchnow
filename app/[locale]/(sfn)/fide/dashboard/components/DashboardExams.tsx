import React from "react";
import { HeroData } from "./dashboardUtils";
import Image from "next/image";
import { StatsTabel } from "./StatsTabel";
import { ExamsSuggestions } from "./ExamsSuggestions";
import { HiCheckCircle } from "react-icons/hi";
import { LinkArrowToFideExams } from "@/app/components/common/LinkToFideExams";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

interface DashboardExamsProps {
    hero: HeroData;
    locale: "fr" | "en";
    hasPack: boolean;
}

export const DashboardExams = ({ hero, locale, hasPack }: DashboardExamsProps) => {
    const t = useTranslations("Fide.dashboard.Exams");

    return (
        <section className="page-wrapper flex flex-col max-w-7xl m-auto gap-8 lg:gap-12 w-full py-0">
            <h2 className="mb-0 w-full display-2">{t.rich("title", intelRich())}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 w-full">
                <div className="col-span-1 flex justify-center w-full">
                    <Image
                        src="/images/fide-exams-dashboard.png"
                        alt={t("altExamsImage")}
                        width={400}
                        height={400}
                        className="px-8 object-contain w-full overflow-hidden max-w-40 lg:max-w-none h-auto"
                    />
                </div>

                <div className="col-span-1 lg:col-span-2 flex flex-col items-center w-full">
                    <h4 className="underline decoration-secondary-5 text-xl md:text-3xl mb-8">{t("myProgress")}</h4>
                    <StatsTabel hero={hero} locale={locale} hasPack={hasPack} />
                </div>
            </div>

            <ExamsSuggestions hero={hero} hasPack={hasPack} />

            <div className="w-full flex justify-center">
                <LinkArrowToFideExams className="text-xl font-bold text-neutral-700" category="culture">
                    <span className="flex items-center">
                        <HiCheckCircle className="text-6xl mr-2 text-secondary-5" /> <span>{t("allExams")}</span>
                    </span>
                </LinkArrowToFideExams>
            </div>
        </section>
    );
};
