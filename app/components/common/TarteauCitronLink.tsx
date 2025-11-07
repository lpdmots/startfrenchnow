"use client";

import React from "react";

export const TarteauCitronLink = () => {
    const openPanel = () => {
        if (typeof window !== "undefined") {
            // @ts-expect-error: injected globally by tarteaucitron script
            window.tarteaucitron?.userInterface?.openPanel?.();
        }
    };
    return (
        <button type="button" className="text-sm italic" onClick={openPanel}>
            Gérer les cookies
        </button>
    );
};
