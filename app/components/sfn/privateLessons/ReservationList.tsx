"use client";
import { useSfnStore } from "@/app/stores/sfnStore";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Popover } from "../../animations/Popover";
import { toHours } from "@/app/lib/utils";
import { BookMeeting } from "@/app/[locale]/(sfn)/fide/components/BookMeeting";
import { Link } from "@/i18n/navigation";
import { RxCross1 } from "react-icons/rx";
import { Event } from "@/app/types/sfn/lessons";
import { ModalFromBottom } from "../../animations/Modals";
import { EVENT_TYPES, HOURS_BEFOR_CANCEL, SLUG_TO_EVENT_TYPE } from "@/app/lib/constantes";
import { FaSpinner } from "react-icons/fa";
import { cancelEventAction } from "@/app/serverActions/productActions";
import { useToast } from "@/app/hooks/use-toast";
import { useSession } from "next-auth/react";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import { Locale } from "@/i18n";
import { updateCalendlyData } from "@/app/lib/calendlyUtils";
import ClientLessonFetcher from "./ClientLessonFetcher";

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
        <div className="w-full flex flex-col gap-6 md:gap-12">
            <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="col-span-1 xl:col-span-2 flex flex-col gap-4 xl:gap-8 order-2 xl:order-1">
                    <h3 className="underline decoration-secondary-2 text-xl md:text-3xl font-medium">{t.rich("followUpTitle", intelRich())}</h3>
                    {privateLesson ? (
                        <div className="flex flex-col md:flex-row gap-6 text-center">
                            {/* Heures Restantes */}
                            <div className="flex flex-col items-center p-4 border-2 border-solid border-neutral-800 small-shadow min-w-60 gap-4 rounded-2xl">
                                <Image src="/images/schedule.png" alt="calendar" height={60} width={60} className="contain h-8 w-8 lg:h-10 lg:w-10" />
                                <p className="text-lg font-semibold text-neutral-700 mb-0">{t("remainingHours")}</p>
                                <p className="text-xl font-bold text-secondary-2 mb-0">{toHours(remainingMinutes || 0)} h</p>
                            </div>
                            {/* Heures En Attente */}
                            <div className="flex flex-col items-center p-4 border-2 border-solid border-neutral-800 min-w-60 gap-4 rounded-2xl">
                                <Image src="/images/hourglass.png" alt="hourglass" height={60} width={60} className="contain h-8 w-8 lg:h-10 lg:w-10" />
                                <p className="text-lg font-semibold  text-neutral-700 mb-0">{t("pendingHours")}</p>
                                <p className="text-xl font-bold text-primary mb-0">{toHours(upcomingMinutes || 0)} h</p>
                            </div>
                            {/* Heures Effectuées */}
                            <div className="flex flex-col items-center p-4 border-2 border-solid border-neutral-800 min-w-60 gap-4 rounded-2xl">
                                <Image src="/images/completed.png" alt="check" height={60} width={60} className="contain h-8 w-8 lg:h-10 lg:w-10" />
                                <p className="text-lg font-semibold  text-neutral-600 mb-0">{t("completedHours")}</p>
                                <p className="text-xl font-bold text-secondary-5 mb-0">{toHours(completedMinutes || 0)} h</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-neutral-600">{t("noPurchasedLessons")}</p>
                    )}
                    <ClientLessonFetcher eventType="Fide Preparation Class" isSmall={true} />
                </div>
                <div className="col-span-1 flex flex-col gap-4 items-center order-1 xl:order-2">
                    <Image
                        src="/images/etudiante-cours.png"
                        alt="private lessons"
                        width={400}
                        height={400}
                        className="px-2 object-contain w-full overflow-hidden max-w-56 xl:max-w-none h-auto"
                    />
                </div>
            </div>
            <div className="w-full">
                <h3 className="underline decoration-secondary-2 text-xl md:text-3xl mb-8 font-medium">{t.rich("calendarTitle", intelRich())}</h3>
                <p>
                    {t("lessonsList1")} <span className=" font-bold underline decoration-secondary-2">{t("lessonsList2")}</span>.
                </p>

                <div className="overflow-x-auto w-full min-h-96 small-shadow card border-2 border-solid border-neutral-700">
                    {privateLesson?.totalPurchasedMinutes && privateLesson?.events?.length ? (
                        <table className="min-w-full rounded-lg overflow-hidden px-12">
                            <thead style={{ borderBottom: "solid var(--neutral-800) 2px" }}>
                                <tr>
                                    <th className="px-4 py-6 text-left text-neutral-700">{t("status")}</th>
                                    <th className="px-4 py-6 text-left text-neutral-700">{t("date")}</th>
                                    <th className="px-4 py-6 text-left text-neutral-700">{t("time")}</th>
                                    <th className="px-4 py-6 text-left text-neutral-700">{t("zoomLink")}</th>
                                    <th className="py-6 text-left text-neutral-700"></th>
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
                <textarea id="reason" name="reason" placeholder={t("optionalMessage")} className="max-h-[200px] max-w-full min-h-[144px] min-w-full p-[24px] border-solid border-[3px] border-[var(--neutral-800)] rounded-[22px] bg-[var(--neutral-100)] [transition:box-shadow_300ms_ease\,_color_300ms_ease\,_border-color_300ms_ease] text-[var(--neutral-800)] text-[18px] font-bold hover:border-[var(--neutral-800)] hover:shadow-[5px_5px_0_0_var(--neutral-800)] shadow-[5px_5px_0_0_var(--neutral-800)] font-medium min-h-[102px] pt-[20px] pb-[20px] rounded-[18px] text-[16px] max-[767px]:min-h-[134px] max-[767px]:pt-[20px] max-[767px]:pb-[20px] max-[767px]:rounded-[18px] max-[767px]:text-[16px] max-[767px]:min-h-[92px] max-[767px]:pt-[18px] max-[767px]:pb-[18px] max-[767px]:rounded-[14px] max-[767px]:text-[14px] max-[479px]:pr-[20px] max-[479px]:pl-[20px] w-input placeholder:text-neutral-500" maxLength={3000}></textarea>
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
                        <span className="text-neutral-400">{t("noZoomLink")}</span>
                    )}
                </td>
                <td className="px-4 py-6">
                    {isMoreThan48HoursAway && isLoading ? (
                        <div className="flex items-center">
                            <FaSpinner className="animate-spin text-secondary-2 h-6 w-6 ml-2" style={{ animationDuration: "2s" }} />
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
