"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { HiOutlineCalendar } from "react-icons/hi";
import { PopupModal } from "react-calendly";

export default function FloatingCTA() {
    const [show, setShow] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [inactiveTimer, setInactiveTimer] = useState<NodeJS.Timeout | null>(null);
    const [animateShake, setAnimateShake] = useState(false);

    const INACTIVITY_DELAY = 5000; // Mobile : réapparition après 5 sec
    const DESKTOP_SCROLL_TRIGGER = 300; // Desktop : apparition après 300px
    const ATTENTION_INTERVAL = 20000; // Shake toutes les 20 sec

    // Gestion scroll + inactivité
    useEffect(() => {
        const handleScroll = () => {
            const isDesktop = window.innerWidth >= 1024;
            const currentScrollY = window.scrollY;

            if (inactiveTimer) clearTimeout(inactiveTimer);

            if (isDesktop) {
                // Desktop : n'affiche qu'après avoir scrollé un peu
                setShow(currentScrollY > DESKTOP_SCROLL_TRIGGER);
            } else {
                // Mobile
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Scroll vers le bas → cacher le bouton
                    setShow(false);
                    const timer = setTimeout(() => setShow(true), INACTIVITY_DELAY);
                    setInactiveTimer(timer);
                } else {
                    // Scroll vers le haut → montrer
                    setShow(true);
                }
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (inactiveTimer) clearTimeout(inactiveTimer);
        };
    }, [lastScrollY, inactiveTimer]);

    // Animation attention grabber
    useEffect(() => {
        if (!show) return;
        const interval = setInterval(() => {
            setAnimateShake(true);
            setTimeout(() => setAnimateShake(false), 800);
        }, ATTENTION_INTERVAL);
        return () => clearInterval(interval);
    }, [show]);

    const [isOpen, setIsOpen] = useState(false);
    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Exécuter après le montage du composant pour récupérer le root element
        setRootElement(document.getElementById("root"));
    }, []);

    if (!rootElement) return null; // Assure que rien n'est rendu si rootElement n'est pas prêt

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="floating-cta"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className=""
                >
                    <div
                        className="translate_on_hover rounded-full"
                        style={{
                            boxShadow: "0px 0px 5px 0 var(--neutral-500)",
                            opacity: 0.9,
                        }}
                    >
                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 rounded-full bg-transparent px-2 py-1 lg:px-3 lg:py-2 transition-colors md:px-5 h-8 md:h-10 lg:h-12"
                            aria-label="Réserver un entretien gratuit"
                        >
                            <motion.div className="flex items-end" animate={animateShake ? { rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.3, 1] } : { rotate: 0, scale: 1 }} transition={{ duration: 1 }}>
                                <HiOutlineCalendar className="text-xl md:text-2xl lg:text-3xl" />
                            </motion.div>
                            <span className="hidden md:inline font-semibold !no-underline">Entretien gratuit</span>
                        </button>
                        <PopupModal url="https://calendly.com/yohann-startfrenchnow/15min" onModalClose={() => setIsOpen(false)} open={isOpen} rootElement={rootElement} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
