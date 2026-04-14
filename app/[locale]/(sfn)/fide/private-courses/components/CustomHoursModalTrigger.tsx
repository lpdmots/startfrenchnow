"use client";

import { useOutsideClick } from "@/app/hooks/use-outside-click";
import type { Locale } from "@/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import PriceSliderFide from "../../components/PriceSliderFide";

export function CustomHoursModalTrigger({ locale, callbackPath }: { locale: Locale; callbackPath: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("Fide.PrivateCoursesPricing.customHours");

    const close = () => setIsOpen(false);
    useOutsideClick(panelRef, () => setIsOpen(false));

    return (
        <>
            <div className="text-center text-sm text-neutral-600">
                <p className="mb-0">
                    {t("prefix")}{" "}
                    <button type="button" onClick={() => setIsOpen(true)} className="text-secondary-2 cursor-pointer">
                        {t("cta")}
                    </button>
                    {t("suffix")}
                </p>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neutral-800 z-50" />

                        <div className="fixed inset-0 grid place-items-center z-[60]">
                            <motion.button
                                className="flex absolute top-4 lg:hidden right-2 items-center justify-center bg-neutral-200 rounded-full h-8 w-8 z-[70] !p-0"
                                onClick={close}
                                aria-label={t("close")}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            >
                                <FaTimes className="h-4 w-4 text-neutral-800" />
                            </motion.button>

                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                ref={panelRef}
                                initial={{ borderRadius: 16 }}
                                className="w-full h-full md:h-auto md:max-w-5xl bg-neutral-100 sm:rounded-3xl overflow-auto border-2 border-solid border-neutral-800 flex flex-col"
                            >
                                <div className="flex items-center gap-2 p-0 lg:p-4 border-b border-neutral-300 relative">
                                    <PriceSliderFide locale={locale} callbackPath={callbackPath} />
                                    <motion.button
                                        className="flex absolute top-4 right-2 items-center justify-center bg-neutral-200 rounded-full h-8 w-8 z-[70] !p-0"
                                        onClick={close}
                                        aria-label={t("close")}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, transition: { delay: 0.2 } }}
                                        exit={{ opacity: 0, transition: { duration: 0.05 } }}
                                    >
                                        <FaTimes className="h-4 w-4 text-neutral-800" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
