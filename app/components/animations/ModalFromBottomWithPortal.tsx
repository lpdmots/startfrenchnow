"use client";

import clsx from "clsx";
import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type ModalData = {
    setOpen?: (value: boolean) => void;
    title?: string | JSX.Element;
    message: JSX.Element | string;
    functionOk?: () => void;
    functionCancel?: () => void;
    imageUrl?: string;
    clickOutside?: boolean;
    buttonOkStr?: string | JSX.Element;
    buttonAnnulerStr?: string | JSX.Element;
    oneButtonOnly?: boolean;
    className?: string;
};

interface Props {
    open: boolean;
    data: ModalData;
}

export const ModalFromBottomWithPortal = ({ open, data }: Props) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // 🔒 Lock scroll quand le modal est ouvert
    useEffect(() => {
        if (!isClient) return;

        const originalOverflow = document.body.style.overflow;

        if (open) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [open, isClient]);

    // Ne rien rendre côté serveur
    if (!isClient) return null;

    const { setOpen, message, title, functionOk, functionCancel, imageUrl, clickOutside, buttonOkStr, oneButtonOnly, buttonAnnulerStr, className } = data;

    const handleClickOk = () => {
        functionOk && functionOk();
        setOpen && setOpen(false);
    };

    const handleClickCancel = () => {
        functionCancel && functionCancel();
        setOpen && setOpen(false);
    };

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 px-5 flex items-center justify-center" style={{ zIndex: 100000 }}>
                    {/* Overlay sombre */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                        onClick={() => {
                            if (clickOutside) setOpen && setOpen(false);
                        }}
                        className="bg-neutral-800 fixed inset-0"
                    />

                    {/* Contenu du modal */}
                    <m.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className={clsx("absolute p-5 bg-neutral-200 text-neutral-900 max-w-md rounded-lg", className)}
                        style={{ width: "98%" }}
                    >
                        <div className="grid grid-cols-5 gap-4 mb-2">
                            <div className={`${imageUrl ? "col-span-4" : "col-span-5"} flex flex-col text-left`}>
                                {!!title && <div className="font-bold underline mb-1">{title}</div>}
                                <div className="text-sm">{message}</div>
                            </div>
                            {imageUrl && (
                                <div className="col-span-1">
                                    <Image src={imageUrl} height={50} width={50} alt="représentation de l'objet" className="h-12 sm:h-16 md:h-24 object-contain w-auto" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            {!oneButtonOnly && (
                                <button className="btn-secondary small" onClick={handleClickCancel}>
                                    {buttonAnnulerStr ? buttonAnnulerStr : "Annuler"}
                                </button>
                            )}
                            <button className="btn-primary small" onClick={handleClickOk}>
                                {buttonOkStr ? buttonOkStr : "Continuer"}
                            </button>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
