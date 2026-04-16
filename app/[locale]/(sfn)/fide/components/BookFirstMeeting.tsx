"use client";

import ShimmerButton from "@/app/components/ui/shimmer-button";
import clsx from "clsx";
import { NotebookPen } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TrackedCalendlyPopupModal from "@/app/components/common/TrackedCalendlyPopupModal";

export const BookFirstMeeting = ({
    label,
    variant = "primary",
    test = false,
    small = false,
    className,
    buttonClassName,
}: {
    label: string;
    variant?: "primary" | "secondary";
    test?: boolean;
    small?: boolean;
    className?: string;
    buttonClassName?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Exécuter après le montage du composant pour récupérer le root element
        setRootElement(document.getElementById("root"));
    }, []);

    // ✅ écoute l'event Calendly "event_scheduled" et redirige
    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            // ✅ sécurité minimale : n'accepter que calendly.com
            try {
                const host = new URL(e.origin).hostname;
                if (!host.endsWith("calendly.com")) return;
            } catch {
                return;
            }

            const data = e.data as any;
            if (!data || typeof data !== "object") return;

            const eventName = data.event as string | undefined;
            if (eventName !== "calendly.event_scheduled") return;

            const eventUri = data.payload?.event?.uri as string | undefined;
            if (!eventUri) return;

            setIsOpen(false);

            // ✅ ton slug “connu”
            const slug = "your-fide-plan";

            const qs = new URLSearchParams();
            qs.set("event_uri", eventUri);
            if (test) qs.set("test", "1");
            qs.set("continue_url", "/fide");

            router.push(`/rdv-success/${slug}?${qs.toString()}`);
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [router, test]);

    if (!rootElement) return null; // Assure que rien n'est rendu si rootElement n'est pas prêt

    return (
        <div className={clsx("w-full sm:w-auto", className)}>
            <ShimmerButton
                className={clsx("w-button flex items-center justify-center w-full sm:w-auto", { small: small }, buttonClassName)}
                variant={variant}
                onClick={() => setIsOpen(true)}
            >
                <NotebookPen className="mr-2 text-xl" />
                {label}
            </ShimmerButton>

            <TrackedCalendlyPopupModal
                source="book_first_meeting"
                url={test ? "https://calendly.com/yohann-startfrenchnow/test" : "https://calendly.com/yohann-startfrenchnow/15min"}
                onModalClose={() => setIsOpen(false)}
                open={isOpen}
                rootElement={rootElement}
            />
        </div>
    );
};

export const BookReservation = ({
    label,
    hasPack,
    test = false,
    small = false,
    openFreeHours,
}: {
    label: string;
    hasPack?: boolean;
    test?: boolean;
    small?: boolean;
    openFreeHours?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Exécuter après le montage du composant pour récupérer le root element
        setRootElement(document.getElementById("root"));
    }, []);

    if (!rootElement) return null; // Assure que rien n'est rendu si rootElement n'est pas prêt

    return (
        <div className="w-full">
            <button
                style={{ ["--hover-color" as any]: `var(--secondary-2)` }}
                className={clsx(
                    "btn btn-primary small w-full text-center",
                    hasPack && "pointer-events-none opacity-60 cursor-not-allowed",
                    `hover:bg-[var(--hover-color)] border-secondary-2 hover:!border-[var(--hover-color)]`,
                )}
                aria-disabled={hasPack}
                onClick={openFreeHours ? () => openFreeHours(true) : () => setIsOpen(true)}
            >
                {label}
            </button>

            <TrackedCalendlyPopupModal
                source="book_reservation"
                url={test ? "https://calendly.com/yohann-startfrenchnow/test" : "https://calendly.com/yohann-startfrenchnow/15min"}
                onModalClose={() => setIsOpen(false)}
                open={isOpen}
                rootElement={rootElement}
            />
        </div>
    );
};
