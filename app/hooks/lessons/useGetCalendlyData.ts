import { getFormattedData } from "@/app/lib/calendlyUtils";
import { EVENT_TYPES } from "@/app/lib/constantes";
import { getCalendlyData } from "@/app/serverActions/productActions";
import { useSfnStore } from "@/app/stores/sfnStore";
import { CalendlyData, PrivateLesson } from "@/app/types/sfn/lessons";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect } from "react"; // Ta constante de types de leçons

export const useGetCalendlyData = (eventType: keyof typeof EVENT_TYPES) => {
    const { data: session } = useSession();
    const { privateLessons, setPrivateLesson } = useSfnStore();
    const privateLesson = privateLessons?.find((lesson) => lesson.eventType === eventType);

    useEffect(() => {
        if (!session) return;
        (async () => {
            const response: CalendlyData = await getCalendlyData(session?.user?._id, eventType);
            const formattedData: PrivateLesson = getFormattedData(response);
            console.log("Fetched Calendly Data:", formattedData);
            setPrivateLesson(formattedData);
        })();
    }, []); // eslint-disable-line

    return { privateLesson };
};
