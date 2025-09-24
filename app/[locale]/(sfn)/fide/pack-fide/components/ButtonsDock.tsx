"use client";
import FloatingCTA from "./FloatingCTA";

export default function ButtonsDock() {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 pointer-events-none">
            <div className="pointer-events-auto">
                <FloatingCTA />
            </div>
            <div className="pointer-events-auto">
                <ScrollToTopButton />
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa6";

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Gérer l'affichage du bouton en fonction du scroll
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Fonction pour remonter en haut de la page
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    return (
        isVisible && (
            <button
                className="roundButton small"
                style={{ backgroundColor: "transparent", boxShadow: "0px 0px 5px 0 var(--neutral-500)", opacity: 0.8 }}
                onClick={scrollToTop}
                aria-label="Retour en haut"
            >
                <FaArrowUp className="text-2xl text-neutral-700" />
            </button>
        )
    );
};
