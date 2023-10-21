import urlFor from "@/app/lib/urlFor";
import { shuffleArray } from "@/app/lib/utils";
import { useSimpleExerciseStore } from "@/app/stores/simpleExerciseStore";
import { Response } from "@/app/types/sfn/blog";
import Image from "next/image";
import React, { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import SimpleButton from "../../animations/SimpleButton";
import QuestionPrompt from "./QuestionPrompt";
import { motion, Reorder } from "framer-motion";
import { AiOutlineSound } from "react-icons/ai";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import { set } from "sanity";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

const DragLayout = ({ _key }: { _key: string }) => {
    const { setQuestionIndex, setStatus, updateScore, getExercise } = useSimpleExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const { responses } = currentQuestion;
    const isFinished = questionIndex === questions.length - 1;
    const [disabled, setDisabled] = useState(false);

    const shuffledResponses = useMemo(() => shuffleArray(responses), [responses]);
    const [selectedResponses, setSelectedResponses] = useState<Response[]>([]);

    const selectedRef = useRef<HTMLDivElement>(null);
    const unselectedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!selectedResponses.length) setDisabled(true);
        else setDisabled(false);
    }, [selectedResponses]);

    /* useEffect(() => {
        const updateHeight = () => {
            if (unselectedRef.current && selectedRef.current) {
                const unselectedHeight = unselectedRef.current.offsetHeight;
                selectedRef.current.style.minHeight = `${unselectedHeight}px`;
                unselectedRef.current.style.minHeight = `${unselectedHeight}px`;
            }
        };

        updateHeight();

        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []); */

    const [isDragging, setIsDragging] = useState(false);
    let timer: NodeJS.Timeout;

    const handleMouseDown = () => {
        timer = setTimeout(() => {
            setIsDragging(true);
        }, 200);
    };

    const handleMouseUp = () => {
        clearTimeout(timer);
    };

    const handleSelect = (response: Response) => {
        if (!isDragging) {
            if (selectedResponses.includes(response)) {
                setSelectedResponses((prev) => prev.filter((item) => item._key !== response._key));
            } else {
                setSelectedResponses((prev) => [...prev, response]);
            }
            setIsDragging(false);
        }
        setIsDragging(false);
    };

    const handleReorder = (order: Response[]) => {
        setSelectedResponses(order);
    };

    const handleValidation = () => {
        const scoreCalculation = currentQuestion.options.scoreCalculation || 1;
        const scoreToAdd = getVerdict(selectedResponses, responses) ? scoreCalculation : 0;
        updateScore(_key, scoreToAdd, scoreCalculation);
        if (isFinished) {
            setStatus(_key, "finished");
        } else {
            setQuestionIndex(_key, questionIndex + 1);
        }
    };

    return (
        <div className="flex flex-col justify-around items-center w-full gap-8">
            <QuestionPrompt currentQuestion={currentQuestion} htmlElement="disabledInput" />
            <div
                ref={selectedRef}
                id={`order-selected-${currentQuestion._key}`}
                className="w-full py-4"
                style={{ borderTop: "2px solid rgba(0, 0, 0, 0.2)", borderBottom: "2px solid rgba(0, 0, 0, 0.2)" }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                <Reorder.Group axis="x" as="div" className="w-full flex gap-2 flex-wrap" values={selectedResponses} onReorder={handleReorder}>
                    {selectedResponses.map((response) => (
                        <Reorder.Item as="div" key={response._key} value={response}>
                            <ButtonPair response={response} handleSelect={handleSelect} />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
            <div ref={unselectedRef} id={`order-unselected-${currentQuestion._key}`} className="w-full py-4">
                <div className="flex gap-2 flex-wrap justify-center">
                    {shuffledResponses
                        .filter((response) => !selectedResponses.includes(response))
                        .map((response) => {
                            return <ButtonPair key={response._key} response={response} handleSelect={handleSelect} />;
                        })}
                </div>
            </div>
            <div className="w-full flex justify-center">
                <button type="submit" disabled={disabled} className="btn-secondary small w-full sm:w-60" onClick={handleValidation}>
                    Valider
                </button>
            </div>
        </div>
    );
};

export default DragLayout;

interface ButtonPairProps {
    response: Response;
    handleSelect: (response: Response) => void;
}

const ButtonPair = ({ response, handleSelect }: ButtonPairProps) => {
    const { text, image, sound } = response;

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
                <motion.div onClick={(e) => handleSound(sound, e)} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <AiOutlineSound className="text-4xl lg:text-5xl" />
                </motion.div>
            </SimpleButton>
        </div>
    );

    const whileHover = { y: -2 };
    const whileTap = { scale: 0.97 };

    return (
        <motion.button
            layoutId={response._key} // Supposons que chaque réponse ait un champ unique `_id`
            className="badge-secondary shadow-1 small flex flex-col items-center justify-center font-bold"
            onClick={() => handleSelect(response)}
            whileHover={whileHover}
            whileTap={whileTap}
            transition={{ duration: 0.2 }} // Animation "spring" pour un effet plus naturel
            layout // Ceci activera l'animation de déplacement
        >
            {imageRender}
            {audio}
            {text}
        </motion.button>
    );
};

const getVerdict = (selectedResponses: Response[], responses: Response[]) => {
    const isFalseBadge = selectedResponses.find((response) => !response.isCorrect);
    if (isFalseBadge) return false;

    const nberOfBadge = responses.filter((response) => response.isCorrect).length;
    const isNberOfBadgeCorrect = selectedResponses.length === nberOfBadge;
    if (!isNberOfBadgeCorrect) return false;

    const order = selectedResponses.map((response) => parseInt(response.isCorrect?.trim() as string));
    const isOrderCorrect = order.every((value, index) => value === index + 1);
    if (!isOrderCorrect) return false;

    return true;
};
