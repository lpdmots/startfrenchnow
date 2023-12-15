"use client";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { shuffleArray } from "@/app/lib/utils";
import Image from "next/image";
import { m } from "framer-motion";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import urlFor from "@/app/lib/urlFor";
import { AiOutlineSound } from "react-icons/ai";
import SimpleButton from "../../animations/SimpleButton";
import QuestionPrompt from "./QuestionPrompt";
import ValidationButton from "./ValidationButton";
import { COLORVARIABLES } from "@/app/lib/constantes";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export const CheckboxLayout = ({ _key }: { _key: string }) => {
    const { updateScore, getExercise } = useExerciseStore();
    const { questions, questionIndex, showAnswers } = getExercise(_key);
    const [disabled, setDisabled] = useState(true);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps

    const showResponses = showAnswers[currentQuestion._key];
    const [isCorrect, setIsCorrect] = useState<boolean>(false);

    const responses = useMemo(() => shuffleArray(currentQuestion.responses), [currentQuestion.responses]);
    const [checkboxes, setCheckboxes] = useState({} as { [key: string]: boolean });
    const scoreCalculation = currentQuestion.options?.scoreCalculation || 1;

    const handleCheck = (responseText: string | number) => {
        setCheckboxes({ ...checkboxes, [responseText]: !checkboxes[responseText] });
    };

    useEffect(() => {
        // si l'une des valeurs de checkboxes est true, on peut valider.
        if (Object.values(checkboxes).some((value) => value)) setDisabled(false);
        else setDisabled(true);
    }, [checkboxes]);

    const handleClick = () => {
        const isCorrect = responses.every((response, index) => !!response.isCorrect === !!checkboxes[response.text || index]);
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
            <div className="flex justify-center items-center w-full pt-4 sm:pt-6">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {responses.map((response, index) => {
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

                                const backgroundColor = getCheckboxeColor(response, !!showResponses, checkboxes, responses);

                                return (
                                    <div key={index} className="col-span-2 sm:col-span-1">
                                        <SlideInOneByOneChild duration={0.3}>
                                            <div className="w-checkbox checkbox-field-wrapper mb-0">
                                                <label className="w-stars-label flex items-center cursor-pointer mb-0 w-full gap-2" onClick={() => handleCheck(response.text || index)}>
                                                    <div
                                                        id="checkbox"
                                                        className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${
                                                            checkboxes[response.text || index] ? "w--redirected-checked" : undefined
                                                        }`}
                                                        style={{ backgroundColor }}
                                                    ></div>
                                                    {response.text && <p className="mb-0">{response.text}</p>}
                                                    {audio && <div className="flex items-center">{audio}</div>}
                                                    {image && <div className="flex items-center">{image}</div>}
                                                </label>
                                            </div>
                                        </SlideInOneByOneChild>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                </SlideInOneByOneParent>
            </div>
            <ValidationButton _key={_key} handleValidation={handleClick} disabled={disabled} isCorrect={isCorrect} />
        </div>
    );
};

const getCheckboxeColor = (response: any, showAnswers: boolean, checkboxes: { [key: string]: boolean }, responses: any[]) => {
    if (showAnswers) {
        if (response.isCorrect) return COLORVARIABLES["green"];
        else if (!response.isCorrect && checkboxes[response.text || responses.indexOf(response)]) return COLORVARIABLES["red"];
    } /* else {
        if (checkboxes[response.text || responses.indexOf(response)]) return undefined;
        else return undefined;
    } */
    return undefined;
};
