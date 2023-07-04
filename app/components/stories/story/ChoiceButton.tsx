"use client";
import { ChoiceProps } from "@/app/types/stories/state";
import { useStoryStore } from "@/app/stores/storiesStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import Spinner from "../../common/Spinner";
import { PortableText } from "@portabletext/react";
import { RichTextStory } from "../../sanity/RichTextStory";

function ChoiceButton({ choice, classes }: { choice: ChoiceProps; classes: string }) {
    const { updateOnChoice, elementsData } = useStoryStore();
    const [clicked, setClicked] = useState(false);
    const elementKey = choice._id;
    const isKeyDefined = elementsData[elementKey] !== undefined;
    const disabled = choice.disabled || (isKeyDefined && elementsData[elementKey].layouts.length === 0);
    const [calculating, setCalculating] = useState(false);
    const handleUpdateOnChoice = useRef(false); // To avoid infinite loop in case of element antagonistes
    const buttonLabel = useMemo(
        () => (choice?.label?.[0].children[0].text.startsWith("arrow") ? undefined : choice?.label && <PortableText value={choice.label} components={RichTextStory()} />),
        [choice?.label]
    );

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

    return !buttonLabel ? (
        <button className="roundButton" onClick={handleChoice}>
            {calculating ? <Spinner radius maxHeight="20px" /> : <AiOutlineArrowRight className="text-3xl lg:text-4xl" />}
        </button>
    ) : (
        <button id="choiceButton" disabled={disabled} className={`${classes} ${disabled && "opacity-50 cursor-not-allowed hover:transform-none"}`} onClick={handleChoice}>
            {calculating ? <Spinner radius maxHeight="40px" /> : buttonLabel}
        </button>
    );
}

export default ChoiceButton;
