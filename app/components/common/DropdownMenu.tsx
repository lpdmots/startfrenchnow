"use client";
import React, { ReactNode, useRef, useState } from "react";
import { Popover } from "react-tiny-popover";

interface DropdownProps {
    content: ReactNode;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
}

const DropdownMenu: React.FC<DropdownProps> = ({ content, children, position = "bottom" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMouseOverPopover, setIsMouseOverPopover] = useState(false);
    const closeTimer = useRef<NodeJS.Timeout | null>(null);

    const handleContentMouseEnter = () => {
        setIsMouseOverPopover(true);
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }
    };

    const handleContentMouseLeave = () => {
        setIsMouseOverPopover(false);
        // Retarde la fermeture
        closeTimer.current = setTimeout(() => setIsOpen(false), 200);
    };

    // NOUVELLE FONCTION pour gérer le clic/tap (utile pour les mobiles)
    const handleTriggerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsOpen((prev) => !prev); // Bascule l'état
        // Annuler le timer de fermeture s'il y en a un
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }
    };

    // Gestionnaire de survol du déclencheur (pour bureau)
    const handleTriggerMouseEnter = () => {
        setIsOpen(true);
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }
    };

    // Gestionnaire de sortie de survol du déclencheur (pour bureau)
    const handleTriggerMouseLeave = () => {
        if (!isMouseOverPopover) {
            closeTimer.current = setTimeout(() => setIsOpen(false), 200);
        }
    };

    const contentWithHandlers = (
        // Les événements mouseEnter/mouseLeave restent pour permettre la transition entre le déclencheur et le contenu sur desktop
        <div onMouseEnter={handleContentMouseEnter} onMouseLeave={handleContentMouseLeave}>
            {content}
        </div>
    );

    return (
        <Popover
            isOpen={isOpen}
            positions={[position]}
            // Le onClickOutside gère la fermeture pour le mobile et le bureau
            onClickOutside={() => setIsOpen(false)}
            content={contentWithHandlers}
        >
            <div
                className="cursor-pointer"
                role="button"
                onClick={handleTriggerClick} // Utiliser le clic pour basculer (mobile et bureau)
                onMouseEnter={handleTriggerMouseEnter} // Maintenir le survol pour le bureau
                onMouseLeave={handleTriggerMouseLeave} // Maintenir le survol pour le bureau
            >
                {children}
            </div>
        </Popover>
    );
};

export default DropdownMenu;
