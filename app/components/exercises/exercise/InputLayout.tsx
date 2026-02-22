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
    const questionAreaRef = useRef<HTMLDivElement | null>(null);

    const handleChange = useCallback(
        (responseNumber: number, e: ChangeEvent<HTMLInputElement>) => {
            setInputs((prevInputs) => ({ ...prevInputs, [responseNumber]: e.target.value }));
        },
        [setInputs],
    );

    const { prompt, correctResponses, isBottomSelect, isError } = useMemo(() => getSelectsInputsData(currentQuestion, handleChange, "input"), [currentQuestion, handleChange]);
    const feedbackMessage = useMemo(() => <FeedbackMessage isCorrect={isCorrect} correctResponses={correctResponses} />, [isCorrect, correctResponses]);

    useEffect(() => {
        if (Object.keys(inputs).length === Object.keys(correctResponses).length) setDisabled(false);
        else setDisabled(true);
    }, [inputs, correctResponses]);

    const handleValidation = () => {
        dismissKeyboard();

        const points = isError ? scoreCalculation : getSelectPoints(correctResponses, inputs, scoreCalculation);
        const iscorrect = points === scoreCalculation;
        setIsCorrect(iscorrect);
        updateScore(_key, points, scoreCalculation);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key !== "Enter") return;

        const target = e.target as HTMLElement | null;
        const isTextField = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
        if (!isTextField) return; // laisse Enter cliquer un bouton focusé

        if (disabled || control) return;

        e.preventDefault();

        if (target && typeof (target as any).blur === "function") {
            (target as any).blur();
        } else {
            dismissKeyboard();
        }

        setControl("open");
        setShowAnswers(_key, questions[questionIndex]._key, true);
        handleValidation();
    };

    useEffect(() => {
        // petit délai pour laisser React/animations rendre le DOM de la nouvelle question
        requestAnimationFrame(() => {
            const root = questionAreaRef.current;
            if (!root) return;

            const el = root.querySelector<HTMLElement>('input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), [contenteditable="true"]');

            if (el) {
                el.focus();

                // bonus UX: sélectionne le texte si l'input contient déjà quelque chose
                if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                    el.select?.();
                }
            }
        });
    }, [questionIndex, _key]);

    return (
        <div ref={questionAreaRef} className="flex-col flex justify-between items-center gap-8 grow" onKeyDownCapture={handleKeyPress}>
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
                                        style={{ color: "#000" }}
                                        onChange={(e) => handleChange(1, e)}
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

const dismissKeyboard = () => {
    const el = document.activeElement;
    if (el instanceof HTMLElement) el.blur();
};
