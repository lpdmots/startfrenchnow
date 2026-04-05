"use client";

import { useLocale } from "next-intl";
import React from "react";

export const TarteauCitronLink = () => {
    const locale = useLocale();
    const openPanel = () => {
        if (typeof window !== "undefined") {
            window.tarteaucitron?.userInterface?.openPanel?.();
        }
    };
    return (
        <div className="footer-link hover:cursor-pointer" onClick={openPanel}>
            {locale === "fr" ? "Gérer les cookies" : "Manage cookies"}
        </div>
    );
};
