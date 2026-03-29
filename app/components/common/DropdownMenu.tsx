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
    const isPortalModalOpen = () => typeof document !== "undefined" && document.body.getAttribute("data-portal-modal-open") === "true";

    const handleContentMouseEnter = () => {
        setIsMouseOverPopover(true);
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }
    };

    const handleContentMouseLeave = () => {
        if (isPortalModalOpen()) return;
        setIsMouseOverPopover(false);
        // Retarde la fermeture
        closeTimer.current = setTimeout(() => {
            if (isPortalModalOpen()) return;
            setIsOpen(false);
        }, 200);
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
        if (isPortalModalOpen()) return;
        if (!isMouseOverPopover) {
            closeTimer.current = setTimeout(() => {
                if (isPortalModalOpen()) return;
                setIsOpen(false);
            }, 200);
        }
    };

    const contentWithHandlers = (
        // Les événements mouseEnter/mouseLeave restent pour permettre la transition entre le déclencheur et le contenu sur desktop
        <div onMouseEnter={handleContentMouseEnter} onMouseLeave={handleContentMouseLeave}>
            {content}
        </div>
    );

    const handleClickOutside = (event?: MouseEvent | TouchEvent) => {
        if (isPortalModalOpen()) return;
        const node = (event?.target as Node | null) ?? null;
        const targetElement = node instanceof Element ? node : (node as any)?.parentElement ?? null;
        if (targetElement?.closest?.('[data-keep-dropdown-open="true"]')) {
            return;
        }
        setIsOpen(false);
    };

    return (
        <Popover
            isOpen={isOpen}
            positions={[position]}
            // Le onClickOutside gère la fermeture pour le mobile et le bureau
            onClickOutside={handleClickOutside}
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
