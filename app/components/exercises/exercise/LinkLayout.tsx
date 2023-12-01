"use client";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { shuffleArray } from "@/app/lib/utils";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import QuestionPrompt from "./QuestionPrompt";
import { Response } from "@/app/types/sfn/blog";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import SimpleButton from "../../animations/SimpleButton";
import { m } from "framer-motion";
import { AiOutlineSound } from "react-icons/ai";
import { COLORVARIABLESSHADES } from "@/app/lib/constantes";
import ValidationButton from "./ValidationButton";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export const LinkLayout = ({ _key }: { _key: string }) => {
    const { getExercise } = useExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const { addTrueAnswer, addFalseAnswer, falseResponses } = useScoreManagement(_key);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const [control, setControl] = useState<"open" | "close">("close");
    const { leftColumn, rightColumn } = useResponses(currentQuestion.responses || [], control);
    const numberOfPairs = currentQuestion.responses.length / 2;
    const [isCorrect, setIsCorrect] = useState<boolean>(true);

    const feedbackMessage = useMemo(() => {
        if (isCorrect) return null;
        const multipleErrors = falseResponses > 1;
        return (
            <p className="mb-0">
                Tu as fait{" "}
                <span className="mb-0 text-secondary-4">
                    {falseResponses} {multipleErrors ? "erreurs" : "erreur"}
                </span>
                .
            </p>
        );
    }, [isCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

    const [leftSelected, setLeftSelected] = useState<null | number>(null);
    const [rightSelected, setRightSelected] = useState<null | number>(null);
    const [foundValues, setFoundValues] = useState<number[]>([]);

    const initialShouldScale: { trueAnimation: number; falseAnimation: { left: number; right: number } } = { trueAnimation: 0, falseAnimation: { left: 0, right: 0 } };
    const [shouldScale, setShouldScale] = useState(initialShouldScale);

    useEffect(() => {
        const bothSelected = !!leftSelected && !!rightSelected;
        if (bothSelected && rightSelected === leftSelected) {
            setFoundValues([...foundValues, rightSelected]);
            setLeftSelected(null);
            setRightSelected(null);
            addTrueAnswer();
            setShouldScale((prev) => ({ ...prev, trueAnimation: rightSelected }));
            setTimeout(() => setShouldScale(initialShouldScale), 200);
        }
        if (bothSelected && rightSelected !== leftSelected) {
            setLeftSelected(null);
            setRightSelected(null);
            addFalseAnswer();
            setShouldScale({ trueAnimation: 0, falseAnimation: { left: leftSelected, right: rightSelected } });
            setTimeout(() => setShouldScale(initialShouldScale), 200);
        }
    }, [leftSelected, rightSelected]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (numberOfPairs === foundValues.length) {
            // Vérifier si c'est correct et FAIRE LE MESSAGE DE FEEDBACK
            setIsCorrect(!falseResponses);
            setControl("open");
        }
    }, [foundValues]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClick = (column: "left" | "right", value: number) => {
        if (column === "left") {
            if (value === leftSelected) setLeftSelected(null);
            else setLeftSelected(value);
        } else {
            if (value === rightSelected) setRightSelected(null);
            else setRightSelected(value);
        }
    };

    return (
        <div className="flex flex-col justify-between w-full h-full grow">
            <QuestionPrompt currentQuestion={currentQuestion} htmlElement="disabledInput" />
            <div className="flex justify-center items-center w-full">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col gap-y-4">
                            {leftColumn.map((response, index) => (
                                <ButtonPair key={index} response={response} handleClick={handleClick} selectedValue={leftSelected} foundValues={foundValues} shouldScale={shouldScale} />
                            ))}
                        </div>
                        <div className="flex flex-col gap-y-4">
                            {rightColumn.map((response, index) => (
                                <ButtonPair key={index} response={response} handleClick={handleClick} selectedValue={rightSelected} foundValues={foundValues} shouldScale={shouldScale} />
                            ))}
                        </div>
                    </div>
                </SlideInOneByOneParent>
            </div>
            <ValidationButton _key={_key} handleValidation={() => {}} disabled={false} isCorrect={isCorrect} control={control} feedbackMessage={feedbackMessage} />
        </div>
    );
};

interface ButtonPairProps {
    response: ExtendedResponse;
    handleClick: (column: "left" | "right", value: number) => void;
    selectedValue: null | number;
    foundValues: number[];
    shouldScale: { trueAnimation: number; falseAnimation: { left: number; right: number } };
}

const ButtonPair = ({ response, handleClick, selectedValue, foundValues, shouldScale }: ButtonPairProps) => {
    const { text, image, sound, value, column } = response;
    const foundValue = foundValues.includes(value);
    const buttonStatus = selectedValue === value && !foundValue ? COLORVARIABLESSHADES["blue"] : "";

    const handleSound = (sound: string, e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        new Audio(cloudFrontDomain + sound).play();
    };

    const imageRender = response.image && (
        <Image src={urlFor(image).url()} alt="image" height={100} width={200} className="object-cover rounded-xl mb-2" style={{ maxWidth: "100%", maxHeight: 100 }} />
    );
    const audio = sound && (
        <div className="flex w-full justify-center">
            <SimpleButton>
                <m.div onClick={(e) => handleSound(sound, e)} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <AiOutlineSound className="text-4xl lg:text-5xl" />
                </m.div>
            </SimpleButton>
        </div>
    );

    const whileHover = foundValue ? { y: 0 } : { y: -2 };
    const whileTap = foundValue ? { scale: 1 } : { scale: 0.97 };
    const scaleEffect =
        shouldScale.trueAnimation === value ? { scale: 1.03, color: "rgb(0, 128, 0)" } : shouldScale.falseAnimation[column] === value ? { scale: 1.03, color: "rgb(128, 0, 0)" } : { scale: 1 };

    return (
        <SlideInOneByOneChild duration={0.3}>
            <m.button
                disabled={foundValue}
                className={"badge-secondary small w-full flex flex-col items-center justify-center font-bold h-full" + (foundValue ? " found-pair" : "")}
                style={{
                    backgroundColor: buttonStatus,
                }}
                onClick={foundValue ? undefined : () => handleClick(column, value)}
                animate={scaleEffect}
                whileHover={whileHover} // orange sur hover
                whileTap={whileTap} // réduit la taille à 90% sur click
                transition={{ duration: 0.2 }} // transition smooth
            >
                {imageRender}
                {audio}
                {text}
            </m.button>
        </SlideInOneByOneChild>
    );
};

interface ParsedIsCorrect {
    column: "left" | "right";
    value: number;
}

interface ExtendedResponse extends Response, ParsedIsCorrect {}

const useResponses = (responses: Response[], control: "open" | "close") => {
    return useMemo(() => {
        const leftColumn: ExtendedResponse[] = [];
        const rightColumn: ExtendedResponse[] = [];

        shuffleArray(responses).forEach((response) => {
            let data: ParsedIsCorrect = { column: "left", value: 0 };
            try {
                data = JSON.parse(response.isCorrect || "{}");
            } catch (e) {
                console.error("Erreur d'analyse JSON:", e);
            }
            const { column, value } = data;
            if (column === "left") leftColumn.push({ ...response, column, value });
            else rightColumn.push({ ...response, column, value });
        });

        return { leftColumn, rightColumn };
    }, [responses, control]);
};

function useScoreManagement(_key: string) {
    const { updateScore, getExercise } = useExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps

    const [responseMonitoring, setResponseMonitoring] = useState({ trueResponses: 0, falseResponses: 0, scoreAdded: 0, maxScoreAdded: 0 });
    const { trueResponses, falseResponses, scoreAdded, maxScoreAdded } = responseMonitoring;

    const scoreCalculation = useMemo(() => currentQuestion.options?.scoreCalculation || 1, [currentQuestion]);
    const numberOfPairs = useMemo(() => currentQuestion.responses.length / 2, [currentQuestion]);

    const getPoints = () => (Math.max(trueResponses - falseResponses, 0) / numberOfPairs) * scoreCalculation;
    const addTrueAnswer = () => setResponseMonitoring((prev) => ({ ...prev, trueResponses: trueResponses + 1 }));
    const addFalseAnswer = () => setResponseMonitoring((prev) => ({ ...prev, falseResponses: falseResponses + 1 }));

    useEffect(() => {
        const newScore = getPoints();
        const adjustement = newScore - scoreAdded;
        const actualMaxScore = Math.min((scoreCalculation / numberOfPairs) * (trueResponses + falseResponses), scoreCalculation);
        const maxScoreAdjustement = actualMaxScore - maxScoreAdded;

        setResponseMonitoring((prev) => ({ ...prev, scoreAdded: newScore, maxScoreAdded: actualMaxScore }));
        updateScore(_key, adjustement, maxScoreAdjustement);
    }, [trueResponses, falseResponses]); // eslint-disable-line react-hooks/exhaustive-deps

    return { addTrueAnswer, addFalseAnswer, falseResponses };
}
