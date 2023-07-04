"use client";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { ChoiceProps, LayoutProps } from "@/app/types/stories/state";
import { NUMBEROFBUTTONS_DESKTOP, NUMBEROFBUTTONS_MOBILE } from "@/app/lib/constantes";
import { removeDuplicatesObjects } from "@/app/lib/utils";
import React, { useEffect, useState } from "react";
import ChoiceButton from "./ChoiceButton";
import { CollapseChoices } from "./CollapseChoices";

interface ButtonVisibility {
    showAccessSelect: boolean;
    showInteractionSelect: boolean;
}

const getButtonVisibility = (accessChoices: ChoiceProps[], interactionChoices: ChoiceProps[], maxButtons: number): ButtonVisibility => {
    let totalButtons = accessChoices.length + interactionChoices.length;
    const showAccessSelect = (totalButtons > maxButtons && accessChoices.length > 1) || (interactionChoices.length > 2 && accessChoices.length > 1);
    totalButtons = showAccessSelect ? interactionChoices.length + 1 : totalButtons;
    const showInteractionSelect = totalButtons > maxButtons && interactionChoices.length > 1;
    return { showAccessSelect, showInteractionSelect };
};

export const ChoiceButtons = ({ data }: { data: LayoutProps }) => {
    const { accessChoices = [], interactionChoices = [] } = data;
    const maxButtons = useMediaQuery("(max-width: 480px)") ? NUMBEROFBUTTONS_MOBILE : NUMBEROFBUTTONS_DESKTOP;
    const [buttonVisibility, setButtonVisibility] = useState<ButtonVisibility | null>(null);
    const isOnlyOneButton = getIsOneButtonDisplayed(accessChoices, interactionChoices, buttonVisibility);

    useEffect(() => {
        setButtonVisibility(getButtonVisibility(accessChoices, interactionChoices, maxButtons));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maxButtons]);

    const renderChoices = (choices: ChoiceProps[], buttonClass: string, inCollapse: boolean = false) => {
        const singleButtonClass = isOnlyOneButton && !inCollapse ? "w-full" : "col-span-2 sm:col-span-1";
        return removeDuplicatesObjects(choices, "_id").map((choice, index) => <ChoiceButton key={index} classes={`${buttonClass} small btn-choice w-full ${singleButtonClass}`} choice={choice} />);
    };

    if (!buttonVisibility) return null;

    return (
        <div className={`${isOnlyOneButton ? "grid-cols-1 place-items-center md:w-1/2" : "grid-cols-2 gap-3 md:gap-6"} grid w-full`}>
            {buttonVisibility.showInteractionSelect ? (
                <CollapseChoices
                    type="primary"
                    label="Choisir une action..."
                    collapseData={<div className="flex flex-col gap-3 md:gap-6">{renderChoices(interactionChoices, "btn-primary", true)}</div>}
                />
            ) : (
                renderChoices(interactionChoices, "btn-primary col-span-2 sm:col-span-1")
            )}
            {buttonVisibility.showAccessSelect ? (
                <CollapseChoices type="secondary" label="Se rendre..." collapseData={<div className="flex flex-col gap-3 md:gap-6">{renderChoices(accessChoices, "btn-secondary", true)}</div>} />
            ) : (
                renderChoices(accessChoices, "btn-secondary col-span-2 sm:col-span-1")
            )}
        </div>
    );
};

const getIsOneButtonDisplayed = (accessChoices: ChoiceProps[], interactionChoices: ChoiceProps[], buttonVisibility: ButtonVisibility | null) => {
    let count = 0;
    if (!buttonVisibility) return true;
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
