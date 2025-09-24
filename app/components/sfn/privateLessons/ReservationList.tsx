"use client";
import { useSfnStore } from "@/app/stores/sfnStore";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Popover } from "../../animations/Popover";
import { toHours } from "@/app/lib/utils";
import { BookMeeting } from "@/app/[locale]/(sfn)/fide/components/BookMeeting";
import Link from "next-intl/link";
import { RxCross1 } from "react-icons/rx";
import { Event } from "@/app/types/sfn/lessons";
import { ModalFromBottom } from "../../animations/Modals";
import { EVENT_TYPES, HOURS_BEFOR_CANCEL, SLUG_TO_EVENT_TYPE } from "@/app/lib/constantes";
import { FaSpinner } from "react-icons/fa";
import { cancelEventAction } from "@/app/serverActions/productActions";
import { useToast } from "@/app/hooks/use-toast";
import { updateCalendlyData } from "@/app/hooks/lessons/useGetCalendlyData";
import { useSession } from "next-auth/react";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import { Locale } from "@/i18n";

const getCancellable = (date: string) => {
    const startTime = new Date(date);
    const now = new Date();
    const in48Hours = new Date(now.getTime() + HOURS_BEFOR_CANCEL * 60 * 60 * 1000); // Ajoute 48 heures
    return new Date(startTime) > in48Hours;
};

export const ReservationList = ({ eventType, locale }: { eventType: "Fide Preparation Class" | "Your FIDE Plan"; locale: Locale }) => {
    const { privateLessons } = useSfnStore();
    const privateLesson = privateLessons.find((lesson) => lesson.eventType === eventType);
    const { completedMinutes, upcomingMinutes, remainingMinutes } = privateLesson || {};
    const t = useTranslations("dashboard.PrivateLessons.common");
    const tSpe = useTranslations("dashboard.PrivateLessons");

    return (
        <div className="w-full flex flex-col gap-12 md:gap-24">
            <div className="w-full">
                <h2 className="display-2 mb-4 lg:mb-8">{t.rich("followUpTitle", intelRich())}</h2>
                {privateLesson ? (
                    <div className="flex flex-col md:flex-row gap-6 text-center">
                        {/* Heures Restantes */}
                        <div className="flex flex-col items-center p-4 card shadow-1 min-w-60 gap-4">
                            <Image src="/images/schedule.png" alt="calendar" height={60} width={60} className="contain h-8 w-8 lg:h-10 lg:w-10" />
                            <p className="text-lg font-semibold text-gray-700 mb-0">{t("remainingHours")}</p>
                            <p className="text-xl font-bold text-blue-600 mb-0">{toHours(remainingMinutes || 0)} h</p>
                        </div>
                        {/* Heures En Attente */}
                        <div className="flex flex-col items-center p-4 card min-w-60 gap-4">
                            <Image src="/images/hourglass.png" alt="hourglass" height={60} width={60} className="contain h-8 w-8 lg:h-10 lg:w-10" />
                            <p className="text-lg font-semibold  text-gray-700 mb-0">{t("pendingHours")}</p>
                            <p className="text-xl font-bold text-yellow-600 mb-0">{toHours(upcomingMinutes || 0)} h</p>
                        </div>
                        {/* Heures Effectuées */}
                        <div className="flex flex-col items-center p-4 card border-neutral-600 min-w-60 gap-4">
                            <Image src="/images/completed.png" alt="check" height={60} width={60} className="contain h-8 w-8 lg:h-10 lg:w-10" />
                            <p className="text-lg font-semibold  text-gray-600 mb-0">{t("completedHours")}</p>
                            <p className="text-xl font-bold text-green-600 mb-0">{toHours(completedMinutes || 0)} h</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-neutral-600">{t("noPurchasedLessons")}</p>
                )}
            </div>
            <div className="w-full">
                <h2 className="display-2">{t.rich("calendarTitle", intelRich())}</h2>
                <p>
                    {t("lessonsList1")} <span className=" font-bold underline decoration-secondary-2">{t("lessonsList2")}</span>.
                </p>

                <div className="overflow-x-auto w-full card shadow-2 min-h-96">
                    {privateLesson?.totalPurchasedMinutes && privateLesson?.events?.length ? (
                        <table className="min-w-full rounded-lg overflow-hidden px-12">
                            <thead style={{ borderBottom: "solid var(--neutral-800) 2px" }}>
                                <tr>
                                    <th className="px-4 py-6 text-left text-gray-700">{t("status")}</th>
                                    <th className="px-4 py-6 text-left text-gray-700">{t("date")}</th>
                                    <th className="px-4 py-6 text-left text-gray-700">{t("time")}</th>
                                    <th className="px-4 py-6 text-left text-gray-700">{t("zoomLink")}</th>
                                    <th className="py-6 text-left text-gray-700"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {privateLesson.events.map((event, index) => (
                                    <EventRow key={index} event={event} index={index} eventType={eventType} locale={locale} />
                                ))}
                            </tbody>
                        </table>
                    ) : privateLesson?.totalPurchasedMinutes ? (
                        <div className="flex flex-col items-center w-full">
                            <p className="text-neutral-600 w-full text-center mt-24">{t("noLessons")}</p>
                            <BookMeeting eventType={eventType}>
                                <button className="btn btn-secondary small text-neutral-600 border-neutral-600">{t("bookLesson")}</button>
                            </BookMeeting>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center w-full">
                            <p className="text-neutral-600 w-full text-center mt-24">{t("noBookedLessons")}</p>
                            <Link href="/fide">
                                <button className="btn btn-secondary small text-neutral-600 border-neutral-600">{tSpe("goToFidePage")}</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EventRow = ({ eventType, event, index, locale }: { eventType: keyof typeof EVENT_TYPES; event: Event; index: number; locale: Locale }) => {
    const isMoreThan48HoursAway = getCancellable(event.date);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { data: session } = useSession();
    const { setPrivateLesson } = useSfnStore();
    const [message, setMessage] = useState<null | { title: string; description: string }>(null);
    const t = useTranslations("dashboard.PrivateLessons.common.eventRow");

    useEffect(() => {
        if (message) {
            toast({ ...message });
            setMessage(null);
        }
    }, [message]);

    const functionOk = async () => {
        setIsLoading(true);
        const reason = (document.getElementById("reason") as HTMLInputElement)?.value;
        const response = await cancelEventAction(event.id, reason);
        if (response.error) {
            setMessage({
                title: t("errorTitle"),
                description: t("errorMessage"),
            });
        } else {
            setMessage({
                title: t("successTitle"),
                description: t("successMessage"),
            });
            const calendlyData = await updateCalendlyData(session, eventType);
            setTimeout(() => {
                setPrivateLesson(calendlyData);
            }, 100);
        }
        setIsLoading(false);
    };

    const modalData = {
        setOpen,
        title: <h3 className="display-3">{t("cancelLessonTitle")}</h3>,
        message: (
            <>
                <p>
                    {t("cancelLessonConfirmation1")}{" "}
                    <span className="underline font-bold">
                        {t("cancelLessonConfirmation2", {
                            date: new Date(event.date).toLocaleDateString(locale),
                            startTime: event.startTime,
                            endTime: event.endTime,
                        })}
                    </span>
                    .
                </p>
                <textarea id="reason" name="reason" placeholder={t("optionalMessage")} className="text-area w-input placeholder:text-neutral-500" maxLength={3000}></textarea>
            </>
        ),
        functionOk,
        buttonOkStr: t("cancelOk"),
        buttonAnnulerStr: t("cancelNo"),
        clickOutside: true,
    };

    const handleOpenCancelModal = () => {
        setOpen(true);
    };

    return (
        <>
            <tr className={`border-t ${index % 2 === 0 ? "bg-neutral-200" : "bg-neutral-100"} hover:bg-neutral-300`}>
                <td className="px-4 py-6">
                    {event.status === "completed" && (
                        <Popover
                            content={<Image src="/images/completed.png" alt="calendar" height={40} width={40} className="contain h-8 w-8 lg:h-10 lg:w-10" />}
                            popover={t("statusCompleted")}
                            small
                        />
                    )}
                    {event.status === "upcoming" && (
                        <Popover content={<Image src="/images/hourglass.png" alt="hourglass" height={40} width={40} className="contain h-6 w-6 lg:h-8 lg:w-8" />} popover={t("statusUpcoming")} small />
                    )}
                    {event.status === "canceled" && (
                        <Popover content={<Image src="/images/cancelled.png" alt="check" height={40} width={40} className="contain h-8 w-8 lg:h-10 lg:w-10" />} popover={t("statusCanceled")} small />
                    )}
                    {event.status === "current" && (
                        <Popover content={<Image src="/images/current.png" alt="check" height={40} width={40} className="contain h-8 w-8 lg:h-10 lg:w-10" />} popover={t("statusCurrent")} small />
                    )}
                </td>
                <td className="px-4 py-6 font-bold">{new Date(event.date).toLocaleDateString(locale)}</td>
                <td className="px-4 py-6">
                    {event.startTime} - {event.endTime}
                </td>
                <td className="px-4 py-6">
                    {["upcoming", "current"].includes(event.status) ? (
                        <a href={event.zoomUrl} className="font-bold text-secondary-2" target="_blank">
                            {t("zoomLink")}
                        </a>
                    ) : (
                        <span className="text-gray-400">{t("noZoomLink")}</span>
                    )}
                </td>
                <td className="px-4 py-6">
                    {isMoreThan48HoursAway && isLoading ? (
                        <div className="flex items-center">
                            <FaSpinner className="animate-spin text-blue-500 h-6 w-6 ml-2" style={{ animationDuration: "2s" }} />
                        </div>
                    ) : isMoreThan48HoursAway ? (
                        <div className="flex items-center">
                            <div className="flex items-center cursor-pointer translate_on_hover gap-2" onClick={handleOpenCancelModal}>
                                <p className="mb-0 italic">Annuler</p>
                                <RxCross1 style={{ fontSize: 20 }} />
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                    {open && <ModalFromBottom data={modalData} />}
                </td>
            </tr>
        </>
    );
};
