"use client";

import { BookMeeting } from "@/app/[locale]/(sfn)/fide/components/BookMeeting";
import { useGetCalendlyData } from "@/app/hooks/lessons/useGetCalendlyData";
import { EVENT_TYPES, SLUG_TO_EVENT_TYPE } from "@/app/lib/constantes";
import { cn } from "@/app/lib/schadcn-utils";
import { toHours } from "@/app/lib/utils";
import { NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";

export default function ClientLessonFetcher({ eventType }: { eventType: keyof typeof EVENT_TYPES }) {
    const t = useTranslations("dashboard.PrivateLessons.common");
    const { privateLesson } = useGetCalendlyData(eventType as keyof typeof EVENT_TYPES);
    const areRemainingMinutes = privateLesson?.remainingMinutes || 0 > 0;
    if (!privateLesson) return <div className="h-8"></div>;

    return (
        <div className="flex flex-col gap-8 w-full sm:w-auto">
            {areRemainingMinutes ? (
                <p className="text-2xl font-bold mb-0">
                    <span className="underline decoration-secondary-4">
                        {t("lessonsAvailable1", {
                            hours: toHours(privateLesson.remainingMinutes),
                            plural: toHours(privateLesson.remainingMinutes) > 1 ? "s" : "",
                        })}
                    </span>{" "}
                    {t("lessonsAvailable2")}
                </p>
            ) : (
                <p className="text-xl mb-0">{t("noLessons")}</p>
            )}
            <div className={cn("flex justify-center", areRemainingMinutes && "grid grid-cols-1 gap-2 sm:grid-cols-2")}>
                <Link href="/fide#priceSliderFide" className="no-underline w-full sm:max-w-80">
                    <button className="btn btn-secondary flex items-center justify-center w-full">
                        <span className="h-6 flex items-center">{t("buyLessons")}</span>
                    </button>
                </Link>
                {areRemainingMinutes && (
                    <BookMeeting eventType={eventType}>
                        <button className={cn("btn btn-primary flex items-center justify-center w-full sm:w-auto")}>
                            <NotebookPen className="mr-2 text-xl" />
                            {t("bookLesson")}
                        </button>
                    </BookMeeting>
                )}
            </div>
        </div>
    );
}
