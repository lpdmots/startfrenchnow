"use client";
import React from "react";

export const AccordionButton = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        // Récupérer la div parent
        const parentDiv = event.currentTarget;

        // Récupérer le bouton avec la classe 'btn-secondary' ou 'btn-primary'
        const button = parentDiv.querySelector<HTMLButtonElement>(".btn-secondary, .btn-primary");
        const icon = button?.querySelector<SVGElement>("svg");
        const h3Element = parentDiv.querySelector("h3");

        if (button) {
            // Toggle entre les classes 'btn-secondary' et 'btn-primary'
            if (button.classList.contains("btn-secondary")) {
                button.classList.remove("btn-secondary");
                button.classList.add("btn-primary");
            } else {
                button.classList.remove("btn-primary");
                button.classList.add("btn-secondary");
            }
            // Ajouter une transition pour le bouton
            button.style.transition = "background-color 0.3s ease, border-color 0.3s ease";
        }

        if (icon) {
            // Ajouter ou retirer la rotation de 45 degrés à l'icône
            if (icon.style.transform === "rotate(45deg)") {
                icon.style.transform = "rotate(0deg)";
            } else {
                icon.style.transform = "rotate(45deg)";
            }
            // Ajouter une transition pour l'icône
            icon.style.transition = "transform 0.3s ease";
        }

        if (h3Element) {
            // Ajouter ou retirer l'effet d'agrandissement vers la droite pour le titre h3
            if (parentDiv.classList.contains("open")) {
                h3Element.style.transform = "scale(1)";
                h3Element.style.transformOrigin = "left";
                parentDiv.classList.remove("open");
            } else {
                h3Element.style.transform = "scale(1.1)";
                h3Element.style.transformOrigin = "left";
                parentDiv.classList.add("open");
            }
            // Ajouter une transition pour l'agrandissement
            h3Element.style.transition = "transform 0.3s ease";
        }
    };

    const handleHover = (event: React.MouseEvent<HTMLDivElement>) => {
        // Récupérer l'élément <h3> dans les enfants
        const h3Element = event.currentTarget.querySelector("h3");
        if (h3Element) {
            h3Element.style.textDecoration = "underline";
        }
    };

    const handleHoverOut = (event: React.MouseEvent<HTMLDivElement>) => {
        // Récupérer l'élément <h3> dans les enfants
        const h3Element = event.currentTarget.querySelector("h3");
        if (h3Element) {
            h3Element.style.textDecoration = "none";
        }
    };

    return (
        <div className="w-full group p-4" onClick={handleClick} onMouseEnter={handleHover} onMouseLeave={handleHoverOut}>
            {children}
        </div>
    );
});

AccordionButton.displayName = "AccordionButton";
