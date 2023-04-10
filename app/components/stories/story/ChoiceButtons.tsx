"use client";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { ChoiceProps, LayoutProps } from "@/app/types/stories/state";
import { NUMBEROFBUTTONS_DESKTOP, NUMBEROFBUTTONS_MOBILE } from "@/lib/constantes";
import { removeDuplicatesObjects } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import ChoiceButton from "./ChoiceButton";
import { CollapseChoices } from "./CollapseChoices";

const getButtonVisibility = (accessChoices: ChoiceProps[], interactionChoices: ChoiceProps[], maxButtons: number) => {
    let totalButtons = accessChoices.length + interactionChoices.length;
    const showAccessSelect = (totalButtons > maxButtons && accessChoices.length > 1) || (interactionChoices.length > 2 && accessChoices.length > 1);
    totalButtons = showAccessSelect ? interactionChoices.length + 1 : totalButtons;
    const showInteractionSelect = totalButtons > maxButtons && interactionChoices.length > 1;
    return { showAccessSelect, showInteractionSelect };
};

export const ChoiceButtons = ({ data }: { data: LayoutProps }) => {
    const { accessChoices = [], interactionChoices = [] } = data;
    const maxButtons = useMediaQuery("(max-width: 480px)") ? NUMBEROFBUTTONS_MOBILE : NUMBEROFBUTTONS_DESKTOP;
    const [buttonVisibility, setButtonVisibility] = useState(getButtonVisibility(accessChoices, interactionChoices, maxButtons));
    const isOnlyOneButton = getIsOneButtonDisplayed(accessChoices, interactionChoices, buttonVisibility);

    useEffect(() => {
        setButtonVisibility(getButtonVisibility(accessChoices, interactionChoices, maxButtons));
    }, [accessChoices.length, interactionChoices.length, maxButtons, accessChoices, interactionChoices]);

    const renderChoices = (choices: ChoiceProps[], buttonClass: string) => {
        const singleButtonClass = isOnlyOneButton ? "w-full sm:w-1/2" : "col-span-2 sm:col-span-1";
        return removeDuplicatesObjects(choices, "_id").map((choice, index) => <ChoiceButton key={index} classes={`${buttonClass} small btn-choice w-full ${singleButtonClass}`} choice={choice} />);
    };
    return (
        <div className={`${isOnlyOneButton ? "flex justify-center" : "grid grid-cols-2 gap-3 md:gap-6"} w-full`}>
            {buttonVisibility.showInteractionSelect ? (
                <CollapseChoices type="primary" label="Choisir une action..." collapseData={<div className="flex flex-col gap-3 md:gap-6">{renderChoices(interactionChoices, "btn-primary")}</div>} />
            ) : (
                renderChoices(interactionChoices, "btn-primary col-span-2 sm:col-span-1")
            )}
            {buttonVisibility.showAccessSelect ? (
                <CollapseChoices type="secondary" label="Se rendre..." collapseData={<div className="flex flex-col gap-3 md:gap-6">{renderChoices(accessChoices, "btn-secondary")}</div>} />
            ) : (
                renderChoices(accessChoices, "btn-secondary col-span-2 sm:col-span-1")
            )}
        </div>
    );
};

const getIsOneButtonDisplayed = (accessChoices: ChoiceProps[], interactionChoices: ChoiceProps[], buttonVisibility: { showAccessSelect: boolean; showInteractionSelect: boolean }) => {
    let count = 0;

    if (!buttonVisibility.showAccessSelect) {
        count += accessChoices.length;
    } else {
        count++; // Add 1 for the CollapseChoices element
    }

    if (!buttonVisibility.showInteractionSelect) {
        count += interactionChoices.length;
    } else {
        count++; // Add 1 for the CollapseChoices element
    }

    return count === 1;
};
