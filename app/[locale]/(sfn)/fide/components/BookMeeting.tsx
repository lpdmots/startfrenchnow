"use client";
import { updateCalendlyData } from "@/app/lib/calendlyUtils";
import { EVENT_TYPES } from "@/app/lib/constantes";
import { checkIfAlias } from "@/app/serverActions/productActions";
import { useSfnStore } from "@/app/stores/sfnStore";
import { useSession } from "next-auth/react";
import { useState, useEffect, ReactNode } from "react";
import { PopupModal, useCalendlyEventListener } from "react-calendly";

interface BookMeetingProps {
    eventType: keyof typeof EVENT_TYPES;
    children: ReactNode;
    wFull?: boolean;
}

export const BookMeeting = ({ eventType, wFull = false, children }: BookMeetingProps) => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
    const { setPrivateLesson } = useSfnStore();

    useEffect(() => {
        // Exécuter après le montage du composant pour récupérer le root element
        setRootElement(document.getElementById("root"));
    }, []);

    useCalendlyEventListener({
        onEventScheduled: async (e) => {
            if (!session) return;
            const inviteeUri = e.data.payload.invitee.uri;
            const emails = [session.user.email as string, ...(session?.user?.alias || [])];
            await checkIfAlias(inviteeUri, emails, session.user._id);
            const calendlyData = await updateCalendlyData(session, eventType);
            setPrivateLesson(calendlyData);
        },
    });

    if (!rootElement) return null;

    return (
        <div className={wFull ? "w-full" : ""}>
            <div className={wFull ? "w-full" : ""} onClick={() => setIsOpen(true)}>
                {children}
            </div>

            <PopupModal
                url={EVENT_TYPES[eventType as keyof typeof EVENT_TYPES].url}
                onModalClose={() => setIsOpen(false)}
                prefill={{
                    name: session?.user?.name,
                    email: session?.user?.email,
                }}
                open={isOpen}
                rootElement={rootElement}
            />
        </div>
    );
};
