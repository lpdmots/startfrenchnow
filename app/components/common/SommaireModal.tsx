"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { FaListUl, FaTimes } from "react-icons/fa";

type SommaireModalProps = {
    title?: string;
    children?: React.ReactNode;
    /** Si tu veux contrôler l’ouverture depuis le parent plus tard */
    openProp?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export default function SommaireModal({ title = "Sommaire", children, openProp, onOpenChange }: SommaireModalProps) {
    const [open, setOpen] = useState<boolean>(false);
    const isControlled = typeof openProp === "boolean";
    const isOpen = isControlled ? (openProp as boolean) : open;

    const panelRef = useRef<HTMLDivElement>(null);

    // Fermer sur clic extérieur
    useEffect(() => {
        function onDown(e: MouseEvent) {
            if (!isOpen) return;
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                close();
            }
        }
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Fermer sur ESC
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") close();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Bloquer le scroll du body quand ouvert
    useEffect(() => {
        if (isOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [isOpen]);

    function openModal() {
        if (isControlled) onOpenChange?.(true);
        else setOpen(true);
    }
    function close() {
        if (isControlled) onOpenChange?.(false);
        else setOpen(false);
    }

    return (
        <LayoutGroup id="sommaire-layout">
            {/* BOUTON D’OUVERTURE (reprend tes classes/esthétique) */}
            <motion.button
                layoutId="sommaire-card"
                onClick={openModal}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls="sommaire-modal"
                className="max-w-44 !bg-neutral-200 text-neutral-800 font-bold border border-solid border-neutral-300 !rounded-xl flex items-center gap-2 px-3 py-2"
            >
                {/* On anime aussi l’entête (icône + label) */}
                <motion.span layoutId="sommaire-header" className="flex items-center gap-2">
                    <FaListUl />
                    <span className="truncate">Sommaire</span>
                </motion.span>
            </motion.button>

            {/* MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-50" />

                        {/* Conteneur centré */}
                        <div className="fixed inset-0 grid place-items-center z-[60]">
                            {/* Bouton X flottant (mobile) */}
                            <motion.button
                                className="flex absolute top-4 right-2 lg:hidden items-center justify-center bg-neutral-200 rounded-full h-8 w-8 z-[70] !p-0"
                                onClick={close}
                                aria-label="Fermer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.5 } }}
                                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            >
                                <FaTimes className="h-4 w-4 text-neutral-800" />
                            </motion.button>

                            {/* Carte / Panneau */}
                            <motion.div
                                id="sommaire-modal"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="sommaire-title"
                                ref={panelRef}
                                layoutId="sommaire-card"
                                initial={{ borderRadius: 16 }}
                                className="w-full h-full md:h-[80vh] md:max-w-2xl bg-neutral-100 sm:rounded-3xl overflow-hidden border-2 border-solid border-neutral-800 flex flex-col"
                            >
                                {/* En-tête (reprend l’icône + label animés) */}
                                <motion.div layoutId="sommaire-header" className="flex items-center gap-2 p-4 border-b border-neutral-300">
                                    <FaListUl />
                                    <h3 id="sommaire-title" className="m-0 text-lg font-bold text-neutral-800">
                                        {title}
                                    </h3>

                                    {/* X en desktop */}
                                    <button onClick={close} className="ml-auto hidden md:flex items-center justify-center bg-neutral-200 rounded-full h-8 w-8 p-0" aria-label="Fermer">
                                        <FaTimes className="h-4 w-4 text-neutral-800" />
                                    </button>
                                </motion.div>

                                {/* Contenu (vide pour l’instant) */}
                                <div className="p-4 md:p-6 overflow-y-auto flex-1">{children ?? <div className="text-neutral-600">Contenu à ajouter…</div>}</div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </LayoutGroup>
    );
}
