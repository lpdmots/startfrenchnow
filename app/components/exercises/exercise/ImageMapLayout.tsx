"use client";
import { Response } from "@/app/types/sfn/blog";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { shuffleArray } from "@/app/lib/utils";
import Image from "next/image";
import { m } from "framer-motion";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import urlFor from "@/app/lib/urlFor";
import { AiOutlineSound } from "react-icons/ai";
import SimpleButton from "../../animations/SimpleButton";
import QuestionPrompt from "./QuestionPrompt";
import { CarouselLayout } from "./CarouselLayout";
import { FaCheck, FaQuestion } from "react-icons/fa";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

// CRÉER UNE QUESTION:
// FAIRE LES MAPS ICI: https://www.image-map.net/
// TRANSFORMER LE CODE POUR UN JSON DANS ISCORRECT: {"name": "un verre", "coords": [952, 71, 1185, 393], "shape": "rect", "title": "un verre"}
// ATTENTION AU FORMAT JSON, ET CHANGER LE STRING COORDS EN LISTE.
// DANS LE TEXT DE PROMPT, METTRE IMAGEMAP POUR L'EMPLACEMENT DE L'IMAGE.

export function ImageMapLayout({ _key }: { _key: string }) {
    const { getExercise } = useExerciseStore();
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
                <m.div className="cursor-pointer" onClick={(e) => handleSound(response?.sound || "", e)} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
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
    const { updateScore, getExercise, setStatus, setQuestionIndex } = useExerciseStore();
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

/* 
[
  {"name": "une table basse", "coords": [445, 374, 293, 286], "shape": "rect", "title": "une table basse"},
  {"name": "un canapé", "coords": [18, 264, 108, 313, 136, 387, 208, 333, 205, 263, 121, 233], "shape": "poly", "title": "un canapé"},
  {"name": "une table basse", "coords": [20, 310, 106, 404], "shape": "rect", "title": "une table basse"},
  {"name": "un fauteuil", "coords": [549, 358, 552, 287, 633, 244, 677, 260, 658, 376, 580, 384], "shape": "poly", "title": "un fauteuil"},
  {"name": "une télévision", "coords": [301, 137, 420, 204], "shape": "rect", "title": "une télévision"},
  {"name": "un meuble TV", "coords": [236, 223, 240, 303, 291, 278, 449, 278, 481, 302, 485, 223], "shape": "poly", "title": "un meuble TV"},
  {"name": "un buffet", "coords": [505, 298, 498, 77, 554, 55, 614, 78, 608, 275], "shape": "poly", "title": "un buffet"},
  {"name": "les étagères", "coords": [157, 73, 221, 169], "shape": "rect", "title": "les étagères"},
  {"name": "une lampe", "coords": [168, 172, 202, 256], "shape": "rect", "title": "une lampe"},
  {"name": "une lampe", "coords": [239, 171, 271, 220], "shape": "rect", "title": "une lampe"},
  {"name": "une lampe", "coords": [447, 157, 489, 220], "shape": "rect", "title": "une lampe"},
  {"name": "un rideau", "coords": [56, 21, 95, 34, 98, 234, 59, 243], "shape": "poly", "title": "un rideau"},
  {"name": "un tapis", "coords": [242, 319, 291, 321, 291, 378, 445, 378, 448, 321, 495, 319, 563, 400, 166, 401], "shape": "poly", "title": "un tapis"},
  {"name": "un luminaire", "coords": [334, 0, 374, 86], "shape": "rect", "title": "un luminaire"},
  {"name": "un luminaire", "coords": [27, 81, 58, 122], "shape": "rect", "title": "un luminaire"}
]


[
  {"name": "un canapé", "coords": [32, 236, 134, 203, 218, 227, 220, 289, 164, 370, 33, 375], "shape": "poly", "title": "un canapé"},
  {"name": "un canapé", "coords": [535, 373, 487, 301, 489, 225, 574, 206, 669, 232, 668, 369], "shape": "poly", "title": "un canapé"},
  {"name": "une table basse", "coords": [276, 269, 418, 348], "shape": "rect", "title": "une table basse"},
  {"name": "un fauteuil", "coords": [413, 216, 472, 273], "shape": "rect", "title": "un fauteuil"},
  {"name": "une chaise", "coords": [248, 182, 288, 245], "shape": "rect", "title": "une chaise"},
  {"name": "un luminaire", "coords": [359, 47, 23], "shape": "circle", "title": "un luminaire"},
  {"name": "un luminaire", "coords": [256, 86, 287, 99], "shape": "rect", "title": "un luminaire"},
  {"name": "un coussin", "coords": [136, 225, 167, 217, 183, 251, 145, 258], "shape": "poly", "title": "un coussin"},
  {"name": "un coussin", "coords": [72, 259, 93, 242, 119, 275, 94, 274], "shape": "poly", "title": "un coussin"},
  {"name": "un coussin", "coords": [555, 221, 577, 230, 562, 261, 536, 252], "shape": "poly", "title": "un coussin"},
  {"name": "un coussin", "coords": [609, 242, 627, 260, 590, 282, 584, 264], "shape": "poly", "title": "un coussin"},
  {"name": "un tapis", "coords": [260, 291, 209, 375, 479, 373, 441, 291, 413, 294, 419, 351, 276, 351, 286, 296], "shape": "poly", "title": "un tapis"}
]

[
  {"name": "un canapé", "coords": [179, 323, 226, 287, 507, 286, 550, 328, 549, 412, 465, 414, 461, 372, 281, 376, 279, 415, 182, 414], "shape": "poly", "title": "un canapé"},
  {"name": "une table basse", "coords": [283, 376, 465, 485], "shape": "rect", "title": "une table basse"},
  {"name": "un tapis", "coords": [184, 419, 284, 419, 378, 488, 463, 419, 530, 421, 588, 512, 113, 511], "shape": "poly", "title": "un tapis"},
  {"name": "une bibliothèque", "coords": [2, 112, 83, 150, 83, 393, 3, 451], "shape": "poly", "title": "une bibliothèque"},
  {"name": "un coussin", "coords": [196, 293, 335, 346], "shape": "rect", "title": "un coussin"},
  {"name": "un coussin", "coords": [413, 293, 527, 346], "shape": "rect", "title": "un coussin"},
  {"name": "une plante", "coords": [490, 199, 645, 201, 634, 341, 581, 385, 560, 288, 497, 278], "shape": "poly", "title": "une plante"},
  {"name": "une plante", "coords": [158, 381, 148, 201, 213, 198, 215, 241, 323, 246, 324, 280, 188, 287, 177, 379], "shape": "poly", "title": "une plante"},
  {"name": "une plante", "coords": [0, 40, 65, 61, 53, 131, 2, 110], "shape": "poly", "title": "une plante"},
  {"name": "une plante", "coords": [392, 308, 459, 308, 446, 386, 403, 387], "shape": "poly", "title": "une plante"}
]


 */
