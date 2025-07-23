import { EVENT_TYPES } from "@/app/lib/constantes";
import { getTimeData, toHours } from "@/app/lib/utils";
import { getCalendlyData } from "@/app/serverActions/productActions";
import { useSfnStore } from "@/app/stores/sfnStore";
import { CalendlyData, CalendlyEvent, PrivateLesson } from "@/app/types/sfn/lessons";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"; // Ta constante de types de leçons

function calculateTimes(calendlyEvents: CalendlyEvent[], totalAvailableMinutes: number) {
    let completedMinutes = 0;
    let upcomingMinutes = 0;
    let currentMinutes = 0;

    calendlyEvents.forEach((calendlyEvent: CalendlyEvent) => {
        const startTime = new Date(calendlyEvent.start_time);
        const endTime = new Date(calendlyEvent.end_time);
        const eventDuration = (endTime.getTime() - startTime.getTime()) / 1000 / 60; // Durée en minutes

        if (calendlyEvent.status === "active" && new Date() > endTime) {
            completedMinutes += eventDuration;
        } else if (calendlyEvent.status === "active" && new Date() < startTime) {
            upcomingMinutes += eventDuration;
        } else if (calendlyEvent.status === "active" && new Date() < endTime && new Date() > startTime) {
            currentMinutes += eventDuration;
        }
    });

    const remainingMinutes = totalAvailableMinutes - (completedMinutes + upcomingMinutes + currentMinutes);

    return {
        completedMinutes,
        upcomingMinutes,
        remainingMinutes,
        currentMinutes,
    };
}

const getFormattedData = ({ calendlyEvents, ...rest }: CalendlyData) => {
    const events = calendlyEvents.map((event: any) => {
        const status = (event.status === "canceled" ? "canceled" : event.end_time < new Date().toISOString() ? "completed" : event.start_time > new Date().toISOString() ? "upcoming" : "current") as
            | "canceled"
            | "completed"
            | "upcoming"
            | "current";
        const { date, startTime, endTime, duration } = getTimeData(event.start_time, event.end_time);
        return { formattedDate: date, startTime, endTime, zoomUrl: event.location.join_url, status, duration, date: event.start_time, id: event.uri.split("/").pop() };
    });

    const times = calculateTimes(calendlyEvents, rest.totalPurchasedMinutes);
    return {
        ...rest,
        ...times,
        events,
    };
};

export const useGetCalendlyData = (eventType: keyof typeof EVENT_TYPES) => {
    const { data: session } = useSession();
    const { privateLessons, setPrivateLesson } = useSfnStore();
    const privateLesson = privateLessons?.find((lesson) => lesson.eventType === eventType);

    useEffect(() => {
        if (!session) return;
        (async () => {
            const response: CalendlyData = await getCalendlyData(session?.user?._id, eventType);
            const formattedData: PrivateLesson = getFormattedData(response);
            setPrivateLesson(formattedData);
        })();
    }, []); // eslint-disable-line

    return { privateLesson };
};

export const updateCalendlyData = async (session: Session | null, eventType: keyof typeof EVENT_TYPES) => {
    const response: CalendlyData = await getCalendlyData(session?.user?._id || "", eventType);
    const formattedData: PrivateLesson = getFormattedData(response);
    return formattedData;
};
