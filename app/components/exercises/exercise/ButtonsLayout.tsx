"use client";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { shuffleArray } from "@/app/lib/utils";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import QuestionPrompt from "./QuestionPrompt";
import ValidationButton from "./ValidationButton";
import { CATEGORIESCOLORSSHADES, COLORVARIABLESSHADES } from "@/app/lib/constantes";
import { Exercise } from "@/app/types/sfn/blog";
import SimpleButton from "../../animations/SimpleButton";
import { m } from "framer-motion";
import { AiOutlineSound } from "react-icons/ai";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

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

    const handleSound = (sound: string, e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        new Audio(cloudFrontDomain + sound).play();
    };

    return (
        <div className="flex flex-col justify-between w-full h-full grow">
            <QuestionPrompt currentQuestion={currentQuestion} htmlElement="disabledInput" />
            <div className="flex justify-center items-center w-full pt-4">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {responses.map((response, index) => {
                                const backgroundColor = getButtonColor(response, !!showResponses, selectedButton, data);
                                const audio = response.sound && (
                                    <div className="flex w-full">
                                        <SimpleButton>
                                            <m.div onClick={(e) => handleSound(response.sound || "", e)} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
                                                <AiOutlineSound className="text-2xl lg:text-3xl" />
                                            </m.div>
                                        </SimpleButton>
                                    </div>
                                );
                                const image = response.image && (
                                    <span className="mb-0 mx-2">
                                        <Image src={urlFor(response.image).url()} alt="image" height={75} width={75} className="object-contain" style={{ maxWidth: "100%" }} />
                                    </span>
                                );
                                return (
                                    <div className="col-span-2 sm:col-span-1" key={index}>
                                        <SlideInOneByOneChild duration={0.3}>
                                            <button className="badge-secondary small w-full font-bold flex items-center" style={{ backgroundColor }} onClick={() => handleClick(response._key)}>
                                                <div className="flex w-full justify-center items-center gap-4">
                                                    <p className="mb-0">{response.text}</p>
                                                    {audio && <span className="flex items-center ">{audio}</span>}
                                                </div>
                                                {image && <div className="flex items-center w-full">{image}</div>}
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
