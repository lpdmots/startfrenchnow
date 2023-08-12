"use client";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { useStoryStore } from "@/app/stores/storiesStore";
import React from "react";
import { Popover } from "../../animations/Popover";

interface Props {
    contentData: React.ReactNode;
    popoverData: React.ReactNode;
}

export const Translation = ({ contentData, popoverData }: Props) => {
    const { layouts, slideIndex } = useStoryStore();
    const isReview = layouts[slideIndex]?.reviewLayout; // Si review il ne faut pas repositionner.

    const isDesktop = useMediaQuery("(min-width: 992px)");
    const content = <span className="relative underline decoration-dotted decoration-1 underline-offset-4 cursor-pointer">{contentData}</span>;
    const popover = <span className="bl italic">{popoverData ? popoverData : "Pas de contenu spécifié..."}</span>;
    return (
        <span {...(isDesktop ? {} : { onClick: (e) => e.stopPropagation() })}>
            <Popover content={content} popover={popover} reposition={!isReview} />
        </span>
    );
};
