"use client";
import { useEffect, useRef } from "react";

interface AccordionButtonProgProps {
    children: React.ReactNode;
    isActive: boolean;
}

export const AccordionButtonProg = ({ children, isActive }: AccordionButtonProgProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const parentDiv = ref.current;
        if (!parentDiv) return;

        const h3Element = parentDiv.querySelector("h3");

        if (h3Element) {
            // Ajouter ou retirer l'effet d'agrandissement pour le titre h3 en fonction de `isActive`
            h3Element.style.transform = isActive ? "scale(1.2)" : "scale(1)";
            h3Element.style.transformOrigin = "left";
            h3Element.style.transition = "transform 0.3s ease";

            // Ajouter ou retirer la classe text-neutral-800
            if (isActive) {
                h3Element.classList.add("text-neutral-800", "!font-bold");
            } else {
                h3Element.classList.remove("text-neutral-800", "!font-bold");
            }
        }
    }, [isActive]);

    return (
        <div ref={ref} className="w-full group p-4">
            {children}
        </div>
    );
};
