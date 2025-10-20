import React from "react";
import { buildHeroData } from "./dashboardUtils";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import ClientLessonFetcher from "@/app/components/sfn/privateLessons/ClientLessonFetcher";
import { Fade } from "@/app/components/animations/Fades";
import Image from "next/image";
import { ReservationList } from "@/app/components/sfn/privateLessons/ReservationList";

interface Props {
    hero: ReturnType<typeof buildHeroData>;
    locale: "fr" | "en";
}

export const DashboardCoaching = ({ hero, locale }: Props) => {
    const t = useTranslations("Fide.dashboard.PrivateLessons");

    return (
        <section id="private-courses" className="page-wrapper flex flex-col max-w-7xl m-auto gap-6 lg:gap-12 w-full py-0">
            <h2 className="mb-0 w-full display-2">{t.rich("title", intelRich())}</h2>

            <div className="w-full max-w-7xl">
                <ReservationList eventType="Fide Preparation Class" locale={locale} />
            </div>
        </section>
    );
};
