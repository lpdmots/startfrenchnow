"use client";
import React, { useRef, ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
/**
 * Hook personnalisé pour détecter un clic en dehors de l'élément référencé
 * @param ref - Référence à l'élément DOM
 * @param callback - Fonction à appeler lors d'un clic en dehors
 */
const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
};

// --- Définition du Composant PdfDropdown ---

interface PdfDropdownProps {
    children: ReactNode; // Le bouton qui ouvre/ferme le dropdown
    content: ReactNode; // Le contenu à afficher dans le dropdown (la liste des PDFs)
    className?: string; // Classe optionnelle pour le conteneur principal
}

export const PdfDropdown = ({ children, content, className }: PdfDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ferme le dropdown lors d'un clic à l'extérieur
    useClickOutside(dropdownRef, () => setIsOpen(false));

    // Définition des animations Framer Motion
    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, transition: { duration: 0.2 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    };

    return (
        <div ref={dropdownRef} className={clsx("relative inline-block text-left", className)}>
            {/* Bouton pour ouvrir/fermer le dropdown */}
            <button
                type="button"
                className="inline-flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-800 transition-colors duration-200 focus:outline-none"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
            >
                {children}
            </button>

            {/* Contenu du Dropdown avec animation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={dropdownVariants}
                        className="absolute right-0 mt-2 z-10 origin-top-right whitespace-nowrap"
                        // Empêche le clic à l'intérieur du dropdown de se propager au Link parent
                        onClick={(e) => e.stopPropagation()}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
