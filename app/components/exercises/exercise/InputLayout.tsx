"use client";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import { FeedbackMessage, getSelectPoints, getSelectsInputsData } from "./Exercise";
import ValidationButton from "./ValidationButton";

export const InputLayout = ({ _key }: { _key: string }) => {
    const { updateScore, getExercise, setShowAnswers } = useExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const [disabled, setDisabled] = useState(true);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const [inputs, setInputs] = useState({} as { [key: string]: string });
    const scoreCalculation = currentQuestion.options?.scoreCalculation || 1;
    const [isCorrect, setIsCorrect] = useState<boolean>(true);
    const [control, setControl] = useState<"open" | "close" | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = useCallback(
        (responseNumber: number, e: ChangeEvent<HTMLInputElement>) => {
            setInputs((prevInputs) => ({ ...prevInputs, [responseNumber]: e.target.value }));
        },
        [setInputs]
    );

    const { prompt, correctResponses, isBottomSelect, isError } = useMemo(() => getSelectsInputsData(currentQuestion, handleChange, "input"), [currentQuestion, handleChange]);
    const feedbackMessage = useMemo(() => <FeedbackMessage isCorrect={isCorrect} correctResponses={correctResponses} />, [isCorrect, correctResponses]);

    useEffect(() => {
        if (Object.keys(inputs).length === Object.keys(correctResponses).length) setDisabled(false);
        else setDisabled(true);
    }, [inputs, correctResponses]);

    const handleValidation = () => {
        const points = isError ? scoreCalculation : getSelectPoints(correctResponses, inputs, scoreCalculation);
        const iscorrect = points === scoreCalculation;
        setIsCorrect(iscorrect);
        updateScore(_key, points, scoreCalculation);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !disabled && !control) {
            inputRef?.current?.blur();
            setControl("open");
            setShowAnswers(_key, questions[questionIndex]._key, true);
            handleValidation();
        }
    };

    return (
        <div className="flex-col flex justify-between items-center gap-8 grow">
            {prompt}
            <div className="flex justify-center items-center w-full">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <div className="flex flex-col gap-4">
                        {isBottomSelect && (
                            <SlideInOneByOneChild duration={0.3}>
                                <div className="w-full flex justify-center my-1">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="rounded-xl px-2 my-1 focus:border-secondary-2 w-full sm:w-60 h-12 md:h-14"
                                        onChange={(e) => handleChange(1, e)}
                                        onKeyDown={handleKeyPress}
                                        name="response"
                                        placeholder="..."
                                        autoComplete="off"
                                    />
                                </div>
                            </SlideInOneByOneChild>
                        )}
                    </div>
                </SlideInOneByOneParent>
            </div>
            <ValidationButton _key={_key} handleValidation={handleValidation} disabled={disabled} isCorrect={isCorrect} feedbackMessage={feedbackMessage} control={control} />
        </div>
    );
};
