import React from "react";
import { VideoCard } from "./VideoCard";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { Access, CourseBundle, CourseKey } from "../[[...slug]]/page";

interface Props {
    coursesByKey: Record<CourseKey, CourseBundle>;
    locale: "fr" | "en";
}

export const DashboardHero = ({ coursesByKey, locale }: Props) => {
    const t = useTranslations("Courses.Dashboard.DashboardHero");
    const BeginnerData = coursesByKey.udemy_course_beginner;
    const IntermediateData = coursesByKey.udemy_course_intermediate;
    const DialogsData = coursesByKey.udemy_course_dialogs;

    return (
        <section className="flex flex-col max-w-7xl w-full gap-4 lg:gap-8 py-0">
            <div className="text-center---tablet">
                <div className="inner-container _550px---tablet center">
                    <h1 className="display-2 font-medium">{t.rich("title", intelRich())}</h1>
                </div>
            </div>
            <div className="flex justify-center lg:grid lg:grid-cols-3 gap-8 xl:gap-12 w-full h-[400px]">
                <div
                    className={clsx(
                        "card col-span-1 h-full w-full overflow-hidden hidden lg:block max-w-96 border-2 border-solid border-neutral-700 shadow-on-hover",
                        BeginnerData.hero?.kind === "video" && "!block",
                    )}
                >
                    <VideoCard hero={BeginnerData.hero} locale={locale} hasAccess={BeginnerData.hasAccess} courseKey="udemy_course_beginner" />
                </div>
                <div
                    className={clsx(
                        "card col-span-1 h-full w-full overflow-hidden hidden lg:block max-w-96 border-2 border-solid border-neutral-700 shadow-on-hover",
                        IntermediateData.hero?.kind === "video" && "!block",
                    )}
                >
                    <VideoCard hero={IntermediateData.hero} locale={locale} hasAccess={IntermediateData.hasAccess} courseKey="udemy_course_intermediate" />
                </div>
                <div
                    className={clsx(
                        "card col-span-1 h-full w-full overflow-hidden hidden lg:block max-w-96 border-2 border-solid border-neutral-700 shadow-on-hover",
                        DialogsData.hero?.kind === "video" && "!block",
                    )}
                >
                    <VideoCard hero={DialogsData.hero} locale={locale} hasAccess={DialogsData.hasAccess} courseKey="udemy_course_dialogs" />
                </div>
            </div>
        </section>
    );
};
