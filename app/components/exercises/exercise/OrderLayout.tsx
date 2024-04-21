import urlFor from "@/app/lib/urlFor";
import { shuffleArray } from "@/app/lib/utils";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { Response, Question } from "@/app/types/sfn/blog";
import Image from "next/image";
import React, { MouseEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SimpleButton from "../../animations/SimpleButton";
import QuestionPrompt from "./QuestionPrompt";
import { motion } from "framer-motion";
import { AiOutlineSound } from "react-icons/ai";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import ValidationButton from "./ValidationButton";
import { COLORVARIABLESSHADES } from "@/app/lib/constantes";
import { on } from "events";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

const OrderLayout = ({ _key }: { _key: string }) => {
    const { updateScore, getExercise } = useExerciseStore();
    const { questions, questionIndex, showAnswers } = getExercise(_key);
    const currentQuestion: Question = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const showResponses = showAnswers[currentQuestion._key];
    const { responses } = currentQuestion;
    const [disabled, setDisabled] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);

    const shuffledResponses = useMemo(() => shuffleArray(responses), [responses]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const selectedRef = useRef<HTMLDivElement>(null);
    const unselectedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!selectedKeys.length) setDisabled(true);
        else setDisabled(false);
    }, [selectedKeys]);

    useEffect(() => {
        if (showResponses) {
            const correctAnswers = responses
                .filter((response) => response.isCorrect)
                .sort((a, b) => (parseInt(a.isCorrect || "0") > parseInt(b.isCorrect || "0") ? 1 : -1))
                .map((response) => response._key);
            setSelectedKeys(correctAnswers);
        }
    }, [showResponses, responses]);

    useLayoutEffect(() => {
        const updateHeight = () => {
            if (unselectedRef.current && selectedRef.current) {
                const unselectedHeight = unselectedRef.current.offsetHeight + 36;
                selectedRef.current.style.minHeight = `${unselectedHeight}px`;
            }
        };

        updateHeight();

        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    const handleSelect = (response: Response) => {
        if (selectedKeys.includes(response._key)) {
            setSelectedKeys((prev) => [...prev.filter((item) => item !== response._key)]);
        } else {
            setSelectedKeys((prev) => [...prev, response._key]);
        }
    };

    const handleValidation = () => {
        const scoreCalculation = currentQuestion.options.scoreCalculation || 1;
        const selectedResponses = selectedKeys.map((key) => responses.find((response) => response._key === key) as Response);
        const isCorrect = getVerdict(selectedResponses, responses);
        setIsCorrect(isCorrect);
        const scoreToAdd = isCorrect ? scoreCalculation : 0;
        updateScore(_key, scoreToAdd, scoreCalculation);
    };

    return (
        <div className="flex flex-col justify-between w-full h-full grow">
            <SlideInOneByOneParent>
                <>
                    <div className="flex flex-col justify-around items-center w-full gap-4">
                        <SlideInOneByOneChild>
                            <QuestionPrompt currentQuestion={currentQuestion} htmlElement="disabledInput" />
                        </SlideInOneByOneChild>
                        <div
                            ref={selectedRef}
                            id={`order-selected-${currentQuestion._key}`}
                            className="w-full py-4"
                            style={{ borderTop: "2px solid rgba(0, 0, 0, 0.2)", borderBottom: "2px solid rgba(0, 0, 0, 0.2)" }}
                        >
                            <SlideInOneByOneChild>
                                <div className="w-full flex gap-2 flex-wrap">
                                    {selectedKeys.map((responseKey) => {
                                        const response = responses.find((response) => response._key === responseKey) as Response;
                                        return <ButtonOrder key={responseKey} response={response} handleSelect={handleSelect} showResponses={showResponses} isCorrect={isCorrect} />;
                                    })}
                                </div>
                            </SlideInOneByOneChild>
                        </div>
                        <div ref={unselectedRef} id={`order-unselected-${currentQuestion._key}`} className="w-full">
                            <SlideInOneByOneChild>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {shuffledResponses.map((response) => {
                                        const isSelected = selectedKeys.includes(response._key);
                                        return <ButtonOrder key={response._key} response={response} handleSelect={handleSelect} isSelected={isSelected} />;
                                    })}
                                </div>
                            </SlideInOneByOneChild>
                        </div>
                    </div>
                </>
            </SlideInOneByOneParent>

            <ValidationButton _key={_key} handleValidation={handleValidation} disabled={disabled} isCorrect={isCorrect} />
        </div>
    );
};

export default OrderLayout;

interface ButtonOrderProps {
    response: Response;
    handleSelect: (response: Response) => void;
    showResponses?: boolean;
    isCorrect?: boolean;
    isSelected?: boolean;
}

const ButtonOrder = ({ response, handleSelect, showResponses = false, isCorrect = false, isSelected = false }: ButtonOrderProps) => {
    const { text, image, sound } = response;
    const handleSound = (sound: string, e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        new Audio(cloudFrontDomain + sound).play();
    };

    const imageRender = response.image && (
        <Image src={urlFor(image).url()} alt="image" height={100} width={200} className="object-cover rounded-xl mb-2" style={{ maxWidth: "100%", maxHeight: 100 }} />
    );

    const backgroundColor = showResponses && isCorrect ? COLORVARIABLESSHADES["green"] : showResponses && !isCorrect ? COLORVARIABLESSHADES["red"] : undefined;

    const audio = sound && (
        <div className="flex w-full justify-center">
            <SimpleButton>
                <motion.div onClick={(e) => handleSound(sound, e)} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <AiOutlineSound className="text-4xl lg:text-5xl" />
                </motion.div>
            </SimpleButton>
        </div>
    );

    const whileHover = { y: -2 };
    const whileTap = { scale: 0.97 };
    const layoutId = response._key + (isSelected ? "-ghost" : "");

    return (
        <motion.button
            layoutId={layoutId}
            className="badge-secondary shadow-1 small flex flex-col items-center justify-center font-bold"
            onClick={() => handleSelect(response)}
            style={{ backgroundColor }}
            initial={{ visibility: "visible" }}
            animate={{ visibility: isSelected ? "hidden" : "visible" }}
            whileHover={whileHover}
            whileTap={whileTap}
            transition={{ duration: 0.3 }}
            layout
        >
            {imageRender}
            {audio}
            {text}
        </motion.button>
    );
};

const getVerdict = (selectedKeys: Response[], responses: Response[]) => {
    const isFalseBadge = selectedKeys.find((response) => !response.isCorrect);

    if (isFalseBadge) return false;
    const nberOfBadge = responses.filter((response) => response.isCorrect).length;
    const isNberOfBadgeCorrect = selectedKeys.length === nberOfBadge;

    if (!isNberOfBadgeCorrect) return false;

    const order = selectedKeys.map((response) => parseInt(response.isCorrect?.trim() as string));
    const isOrderCorrect = order.every((value, index) => value === index + 1);

    if (!isOrderCorrect) return false;

    return true;
};
