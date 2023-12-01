"use client";
import { useEffect, useMemo, useState } from "react";
import { shuffleArray } from "@/app/lib/utils";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import QuestionPrompt from "./QuestionPrompt";
import ValidationButton from "./ValidationButton";
import { CATEGORIESCOLORSSHADES, COLORVARIABLESSHADES } from "@/app/lib/constantes";
import { Exercise } from "@/app/types/sfn/blog";

export const ButtonsLayout = ({ responsesLayout, _key }: { responsesLayout: "buttons" | "true-false"; _key: string }) => {
    const { updateScore, getExercise } = useExerciseStore();
    const { questions, questionIndex, data, showAnswers } = getExercise(_key);
    const [disabled, setDisabled] = useState(true);
    const [selectedButton, setSelectedButton] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);

    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const showResponses = showAnswers[currentQuestion._key];
    const responses = useMemo(() => {
        if (responsesLayout === "buttons") return shuffleArray(currentQuestion.responses);
        return currentQuestion.responses;
    }, [currentQuestion.responses, responsesLayout]);
    const scoreCalculation = currentQuestion.options?.scoreCalculation || 1;

    const handleClick = (responseKey: string) => {
        if (responseKey === selectedButton) {
            setSelectedButton(null);
        } else setSelectedButton(responseKey);
    };

    useEffect(() => {
        if (selectedButton) setDisabled(false);
        else setDisabled(true);
    }, [selectedButton, setDisabled]);

    const handleValidationClick = () => {
        const isCorrect = selectedButton === currentQuestion.responses.find((response) => response.isCorrect)?._key;
        setIsCorrect(isCorrect);
        const toAdd = isCorrect ? scoreCalculation : 0;
        updateScore(_key, toAdd, scoreCalculation);
    };

    return (
        <div className="flex flex-col justify-between w-full h-full grow">
            <QuestionPrompt currentQuestion={currentQuestion} htmlElement="disabledInput" />
            <div className="flex justify-center items-center w-full">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {responses.map((response, index) => {
                                const backgroundColor = getButtonColor(response, !!showResponses, selectedButton, data);
                                return (
                                    <div className="col-span-2 sm:col-span-1" key={index}>
                                        <SlideInOneByOneChild duration={0.3}>
                                            <button className={"badge-secondary small w-full font-bold"} style={{ backgroundColor }} onClick={() => handleClick(response._key)}>
                                                {response.text}
                                            </button>
                                        </SlideInOneByOneChild>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                </SlideInOneByOneParent>
            </div>
            <ValidationButton _key={_key} handleValidation={handleValidationClick} disabled={disabled} isCorrect={isCorrect} />
        </div>
    );
};

const getButtonColor = (response: any, showAnswers: boolean, selectedButton: string | null, data: Exercise | null) => {
    const isSelected = selectedButton === response._key;
    if (showAnswers) {
        if (response.isCorrect) return COLORVARIABLESSHADES["green"];
        else if (!response.isCorrect && isSelected) return COLORVARIABLESSHADES["red"];
    } else {
        if (isSelected) return CATEGORIESCOLORSSHADES[data?.category || "tips"];
        else return undefined;
    }
};
