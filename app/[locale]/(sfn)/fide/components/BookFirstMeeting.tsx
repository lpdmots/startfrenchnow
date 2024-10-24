"use client";

import ShimmerButton from "@/app/components/ui/shimmer-button";
import { NotebookPen } from "lucide-react";
import { useState, useEffect } from "react";
import { PopupModal } from "react-calendly";

// VOIR L'HISTOIRE DU ROOT !

export const BookFirstMeeting = ({ label, variant = "primary" }: { label: string; variant?: "primary" | "secondary" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Exécuter après le montage du composant pour récupérer le root element
        setRootElement(document.getElementById("root"));
    }, []);

    if (!rootElement) return null; // Assure que rien n'est rendu si rootElement n'est pas prêt

    return (
        <div className="w-full flex justify-center">
            <ShimmerButton className="button-row w-button flex items-center justify-center w-full sm:w-auto" variant={variant} onClick={() => setIsOpen(true)}>
                <NotebookPen className="mr-2 text-xl" />
                {label}
            </ShimmerButton>

            <PopupModal url="https://calendly.com/yohann-startfrenchnow/15min" onModalClose={() => setIsOpen(false)} open={isOpen} rootElement={rootElement} />
        </div>
    );
};
