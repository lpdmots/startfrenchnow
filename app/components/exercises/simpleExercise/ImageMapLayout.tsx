"use client";
import { Response } from "@/app/types/sfn/blog";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { shuffleArray } from "@/app/lib/utils";
import Image from "next/image";
import { m } from "framer-motion";
import { useSimpleExerciseStore } from "@/app/stores/simpleExerciseStore";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import urlFor from "@/app/lib/urlFor";
import { AiOutlineSound } from "react-icons/ai";
import SimpleButton from "../../animations/SimpleButton";
import { BsCheck2Square, BsQuestionSquare } from "react-icons/bs";
import QuestionPrompt from "./QuestionPrompt";
import { CarouselLayout } from "./CarouselLayout";
import { FaCheck, FaQuestion } from "react-icons/fa";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export function ImageMapLayout({ _key }: { _key: string }) {
    const { getExercise } = useSimpleExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const { responses, options } = currentQuestion;
    const filtredResponses = useMemo(() => filterResponses(responses), [responses]);
    const { addFalseAnswer, addTrueAnswer } = useScoreManagement(_key, filtredResponses.length);
    const shuffledResponses = useMemo(() => shuffleArray(filtredResponses), [filtredResponses]); // eslint-disable-line react-hooks/exhaustive-deps
    const [clickedAreas, setClickedAreas] = useState([] as string[]);
    const responsesMonitoring = options?.responsesMonitoring || "all";
    const clickedAreasRef = useRef<string[]>([]);
    const [_, setNewRender] = useState(0);

    useEffect(() => {
        clickedAreasRef.current = clickedAreas;
    }, [clickedAreas]);

    const handleAreaClickAll = (_: number, area: any) => {
        if (!area) {
            setClickedAreas((prev) => [...prev, "false"]);
            addFalseAnswer();
            return;
        }

        if (clickedAreasRef.current.includes(area.title)) {
            return;
        }

        addTrueAnswer();
        setClickedAreas((prev) => [...prev, area.title]);
    };

    const responsesIndexRef = useRef(0);
    const actualResponse = shuffledResponses[responsesIndexRef.current];

    const handleAreaClickOneByOne = (_: number, area: any) => {
        const responsesIndex = responsesIndexRef.current;
        const actualResponse = shuffledResponses[responsesIndex];
        if (area?.name === JSON.parse(actualResponse.isCorrect || "")?.name) {
            setClickedAreas((prev) => [...prev, area.name]);
            addTrueAnswer();
        } else {
            setClickedAreas((prev) => [...prev, "false"]);
            addFalseAnswer();
        }

        setTimeout(() => {
            if (responsesIndex < filtredResponses.length - 1) {
                responsesIndexRef.current = responsesIndex + 1;
                setNewRender((prev) => prev + 1);
            }
        }, 1000);
    };

    const handler = responsesMonitoring === "oneByOne" ? handleAreaClickOneByOne : handleAreaClickAll;

    return (
        <form className="flex-col flex justify-around items-center gap-8 grow w-full">
            <QuestionPrompt currentQuestion={currentQuestion} htmlElement="disabledInput" handler={handler} />
            <div className="flex justify-center items-center w-full">
                <SlideInOneByOneParent delayChildren={0.1}>
                    {responsesMonitoring === "all" ? (
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {shuffledResponses.map((response, index) => (
                                <ImageMapResponse key={index} response={response} clickedAreas={clickedAreas} />
                            ))}
                        </div>
                    ) : responsesMonitoring === "oneByOne" ? (
                        <CarouselLayout currentQuestionIndex={responsesIndexRef.current}>
                            <ImageMapResponse response={actualResponse} clickedAreas={clickedAreas} isSolo={true} />
                        </CarouselLayout>
                    ) : (
                        <p></p>
                    )}
                </SlideInOneByOneParent>
            </div>
        </form>
    );
}

interface ImageMapResponseProps {
    response: Response;
    clickedAreas: string[];
    isSolo?: boolean;
}

const ImageMapResponse = ({ response, clickedAreas, isSolo = false }: ImageMapResponseProps) => {
    const [shouldScale, setShouldScale] = useState(false);
    const handleSound = (sound: string, e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        new Audio(cloudFrontDomain + sound).play();
    };
    const audio = response.sound && (
        <div className="flex w-full">
            <SimpleButton>
                <m.div className="cursor-pointer" onClick={(e) => handleSound(response.sound, e)} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <AiOutlineSound className="text-3xl lg:text-4xl" />
                </m.div>
            </SimpleButton>
        </div>
    );
    const image = response.image && (
        <span className="mb-0 mx-2">
            <Image src={urlFor(response.image).url()} alt="image" height={75} width={75} className="object-contain" style={{ maxWidth: "100%" }} />
        </span>
    );
    const isChecked = clickedAreas.includes(JSON.parse(response.isCorrect || "")?.name);

    useEffect(() => {
        if (isChecked) {
            setShouldScale(true);
            setTimeout(() => setShouldScale(false), 300); // Reset après 0.3 secondes
        }
    }, [isChecked]);

    const scaleEffect = shouldScale ? { scale: 1.2 } : { scale: 1 };

    if (isSolo)
        return (
            <m.div className="w-checkbox checkbox-field-wrapper mb-0" animate={scaleEffect} transition={{ duration: 0.3 }}>
                <label className="w-stars-label flex items-center mb-0 w-full gap-2">
                    {response.text && (
                        <p className="mb-0 bl font-bold" style={{ color: "var(--neutral-800)" }}>
                            {response.text}
                        </p>
                    )}
                    {audio && <div className="flex items-center">{audio}</div>}
                    {image && <div className="flex items-center">{image}</div>}
                    {isChecked ? <FaCheck className="text-lg" style={{ color: "teal" }} /> : <FaQuestion className="text-lg pb-1" />}
                </label>
            </m.div>
        );

    return (
        <div>
            <SlideInOneByOneChild duration={0.3}>
                <m.div className="w-checkbox checkbox-field-wrapper mb-0" animate={scaleEffect} initial={{ originX: 0 }} transition={{ duration: 0.3 }}>
                    <label className="w-stars-label flex items-center mb-0 w-full gap-2">
                        {isChecked ? <FaCheck className="text-lg" style={{ color: "teal" }} /> : <div style={{ width: "18px", height: "18px" }}></div>}
                        {response.text && (
                            <p className="mb-0" style={{ color: "var(--neutral-800)" }}>
                                {response.text}
                            </p>
                        )}
                        {audio && <div className="flex items-center">{audio}</div>}
                        {image && <div className="flex items-center">{image}</div>}
                    </label>
                </m.div>
            </SlideInOneByOneChild>
        </div>
    );
};

function filterResponses(responses: Response[]): Response[] {
    const seenNames = new Set<string>();
    const filteredResponses: Response[] = [];

    for (const response of responses) {
        if (!response.isCorrect || response.isCorrect.trim() === "") {
            continue;
        }
        const isCorrectObj: any = JSON.parse(response?.isCorrect || "");
        if (!seenNames.has(isCorrectObj.name)) {
            seenNames.add(isCorrectObj.name);
            filteredResponses.push(response);
        }
    }

    return filteredResponses;
}

function useScoreManagement(_key: string, nbrOfResponses: number) {
    const { updateScore, getExercise, setStatus, setQuestionIndex } = useSimpleExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const isFinished = questionIndex === questions.length - 1;

    const [responseMonitoring, setResponseMonitoring] = useState({ trueResponses: 0, falseResponses: 0, scoreAdded: 0, maxScoreAdded: 0 });
    const { trueResponses, falseResponses, scoreAdded, maxScoreAdded } = responseMonitoring;
    //console.log({ trueResponses, falseResponses, scoreAdded, maxScoreAdded });
    const scoreCalculation = useMemo(() => currentQuestion.options?.scoreCalculation || 1, [currentQuestion]);

    const getPoints = () => (trueResponses / nbrOfResponses) * scoreCalculation;
    const addTrueAnswer = () => setResponseMonitoring((prev) => ({ ...prev, trueResponses: prev.trueResponses + 1 }));
    const addFalseAnswer = () => setResponseMonitoring((prev) => ({ ...prev, falseResponses: prev.falseResponses + 1 }));

    useEffect(() => {
        const newScore = getPoints();
        const adjustement = newScore - scoreAdded;
        const actualMaxScore = ((trueResponses + falseResponses) / nbrOfResponses) * scoreCalculation;
        const maxScoreAdjustement = actualMaxScore - maxScoreAdded;
        //console.log({ newScore, adjustement, actualMaxScore, maxScoreAdjustement });
        setResponseMonitoring((prev) => ({ ...prev, scoreAdded: newScore, maxScoreAdded: actualMaxScore }));
        updateScore(_key, adjustement, maxScoreAdjustement);

        if (trueResponses + falseResponses === nbrOfResponses) {
            setTimeout(() => {
                if (isFinished) setStatus(_key, "finished");
                else setQuestionIndex(_key, questionIndex + 1);
            }, 1000);
        }
    }, [trueResponses, falseResponses]); // eslint-disable-line react-hooks/exhaustive-deps

    return { addTrueAnswer, addFalseAnswer };
}
