"use client";
import { ChoiceProps } from "@/app/types/stories/state";
import { useStoryStore } from "@/stores/storiesStore";
import { useEffect, useRef, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import Spinner from "../../common/Spinner";

function ChoiceButton({ choice, classes }: { choice: ChoiceProps; classes: string }) {
    const { updateOnChoice, elementsData } = useStoryStore();
    const [clicked, setClicked] = useState(false);
    const elementKey = choice._id;
    const isKeyDefined = elementsData[elementKey] !== undefined;
    const disabled = isKeyDefined && elementsData[elementKey].layouts.length === 0;
    const [calculating, setCalculating] = useState(false);
    const handleUpdateOnChoice = useRef(false); // To avoid infinite loop in case of element antagonistes

    useEffect(() => {
        if (clicked && isKeyDefined && !disabled && !handleUpdateOnChoice.current) {
            updateOnChoice(choice);
            setClicked(false);
            handleUpdateOnChoice.current = true;
        }
    }, [clicked, isKeyDefined, disabled, choice, updateOnChoice]);

    useEffect(() => {
        if (clicked && isKeyDefined) {
            setCalculating(true);
        } else {
            setCalculating(false);
        }
    }, [clicked, isKeyDefined]);

    const handleChoice = () => {
        setClicked(true);
    };

    return choice.label === "arrow" ? (
        <button className="roundButton" onClick={handleChoice}>
            {calculating ? <Spinner radius maxHeight="20px" /> : <AiOutlineArrowRight className="text-3xl lg:text-4xl" />}
        </button>
    ) : (
        <button disabled={disabled} className={`${classes} ${disabled && "opacity-50 cursor-not-allowed hover:transform-none"}`} onClick={handleChoice}>
            {calculating ? <Spinner radius maxHeight="40px" /> : choice.label}
        </button>
    );
}

export default ChoiceButton;
