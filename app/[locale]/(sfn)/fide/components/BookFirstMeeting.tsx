"use client";

import ShimmerButton from "@/app/components/ui/shimmer-button";
import clsx from "clsx";
import { NotebookPen } from "lucide-react";
import { useState, useEffect } from "react";
import { PopupModal } from "react-calendly";

export const BookFirstMeeting = ({ label, variant = "primary", test = false, small = false }: { label: string; variant?: "primary" | "secondary"; test?: boolean; small?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Exécuter après le montage du composant pour récupérer le root element
        setRootElement(document.getElementById("root"));
    }, []);

    if (!rootElement) return null; // Assure que rien n'est rendu si rootElement n'est pas prêt

    return (
        <div className="w-full sm:w-auto">
            <ShimmerButton className={clsx("w-button flex items-center justify-center w-full sm:w-auto", { small: small })} variant={variant} onClick={() => setIsOpen(true)}>
                <NotebookPen className="mr-2 text-xl" />
                {label}
            </ShimmerButton>

            <PopupModal
                url={test ? "https://calendly.com/yohann-startfrenchnow/test" : "https://calendly.com/yohann-startfrenchnow/15min"}
                onModalClose={() => setIsOpen(false)}
                open={isOpen}
                rootElement={rootElement}
            />
        </div>
    );
};

export const BookReservation = ({ label, hasPack, test = false, small = false }: { label: string; hasPack?: boolean; test?: boolean; small?: boolean }) => {
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
                    `hover:bg-[var(--hover-color)] border-secondary-2 hover:!border-[var(--hover-color)]`
                )}
                aria-disabled={hasPack}
                onClick={() => setIsOpen(true)}
            >
                {label}
            </button>

            <PopupModal
                url={test ? "https://calendly.com/yohann-startfrenchnow/test" : "https://calendly.com/yohann-startfrenchnow/15min"}
                onModalClose={() => setIsOpen(false)}
                open={isOpen}
                rootElement={rootElement}
            />
        </div>
    );
};
