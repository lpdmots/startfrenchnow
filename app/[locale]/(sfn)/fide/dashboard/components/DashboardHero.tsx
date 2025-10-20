import React from "react";
import { buildHeroData } from "./dashboardUtils";
import { VideoCard } from "./VideoCard";
import { ExamCard } from "./ExamCard";
import clsx from "clsx";
import PrivateCoursesCard from "./PrivateCoursesCard";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

interface Props {
    hero: ReturnType<typeof buildHeroData>;
    locale: "fr" | "en";
    hasPack: boolean;
}

export const DashboardHero = ({ hero, locale, hasPack }: Props) => {
    const t = useTranslations("Fide.dashboard.DashboardHero");
    const kind = hero?.kind;

    return (
        <section className="flex flex-col max-w-7xl w-full gap-4 lg:gap-8 py-0">
            <div className="text-center---tablet">
                <div className="inner-container _550px---tablet center">
                    <h1 className="display-1">{t.rich("title", intelRich())}</h1>
                </div>
            </div>
            <div className="flex justify-center lg:grid lg:grid-cols-3 gap-8 xl:gap-12 w-full h-[400px]">
                <div className={clsx("card link-card col-span-1 h-full w-full overflow-hidden hidden lg:block max-w-96", kind === "video" && "!block")}>
                    <VideoCard hero={hero} locale={locale} hasPack={hasPack} />
                </div>
                <div className={clsx("card link-card col-span-1 h-full w-full overflow-hidden hidden lg:block max-w-96", kind === "exams" && "!block")}>
                    <ExamCard hero={hero} locale={locale} hasPack={hasPack} />
                </div>
                <div className={clsx("card link-card col-span-1 h-full w-full overflow-hidden hidden lg:block max-w-96", kind === "coaching" && "!block")}>
                    <PrivateCoursesCard hero={hero} locale={locale} />
                </div>
            </div>
        </section>
    );
};
