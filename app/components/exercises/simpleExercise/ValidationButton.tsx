import { useSimpleExerciseStore } from "@/app/stores/simpleExerciseStore";
import { useEffect, useState } from "react";
import { BiMessageError } from "react-icons/bi";
import { FaArrowRight, FaCheck, FaExclamationCircle } from "react-icons/fa";
import SimpleButton from "../../animations/SimpleButton";
import { SlideFromBottom, SlideInOneByOneChild } from "../../animations/Slides";

interface ValidationButtonProps {
    _key: string;
    handleValidation: () => void;
    disabled: boolean;
    isCorrect: boolean;
    feedbackMessage?: JSX.Element | null;
    control?: undefined | "open" | "close"; // control l'ouverture du feedback programmatiquement
}

const ValidationButton = ({ _key, handleValidation, disabled, isCorrect, feedbackMessage, control }: ValidationButtonProps) => {
    const { setQuestionIndex, setStatus, getExercise, setShowAnswers } = useSimpleExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const isFinished = questionIndex === questions.length - 1;
    const [openFeedback, setOpenFeedback] = useState(false);

    const handleNextQuestion = () => {
        setOpenFeedback(false);
        if (isFinished) {
            setStatus(_key, "finished");
        } else {
            setQuestionIndex(_key, questionIndex + 1);
        }
    };

    useEffect(() => {
        if (control === "open") setOpenFeedback(true);
    }, [control]);

    const validation = () => {
        setShowAnswers(_key, questions[questionIndex]._key, true);
        handleValidation();
        setOpenFeedback(true);
    };

    return (
        <div className="w-full pt-12">
            <SlideInOneByOneChild>
                <div className="w-full flex justify-center" style={{ visibility: control ? "hidden" : undefined }}>
                    <button type="submit" disabled={disabled} className="btn-secondary small w-full sm:w-60 z-20 btn-hover" onClick={openFeedback ? handleNextQuestion : validation}>
                        {openFeedback ? (
                            <div className="w-full flex items-center justify-center gap-2">
                                <p className="mb-0">Continuer</p>
                                <FaArrowRight className="icon-translate" />
                            </div>
                        ) : (
                            "Valider"
                        )}
                    </button>
                </div>
            </SlideInOneByOneChild>
            {openFeedback && (
                <>
                    <div className="absolute w-full h-full bg-transparent bottom-0 left-0" style={{ zIndex: 5 }}></div>
                    <div className="absolute bottom-0 left-0 w-full z-10">
                        <SlideFromBottom delay={0}>
                            <div className="bg-neutral-300 p-2 sm:p-4 flex flex-col gap-1 sm:gap-2" style={{ boxShadow: "0px -5px 10px rgba(0,0,0,0.3)" }}>
                                <div className="flex justify-between">
                                    {isCorrect ? (
                                        <div className="py-2">
                                            <div className="w-full flex items-center gap-2 text-secondary-5">
                                                <FaCheck className="bl" />
                                                <p className="mb-0">Bravo !</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-2">
                                            <div className="w-full flex items-center gap-2 text-secondary-4">
                                                <FaExclamationCircle className="bl" />
                                                <p className="mb-0">Oups</p>
                                            </div>
                                            {feedbackMessage}
                                        </div>
                                    )}
                                    <div>
                                        <SimpleButton>
                                            <BiMessageError className="text-xl sm:text-2xl mt-1" />
                                        </SimpleButton>
                                    </div>
                                </div>
                                <div className="w-full flex justify-center" style={{ visibility: control ? undefined : "hidden" }}>
                                    <button className="btn-secondary small w-full sm:w-60 z-20 btn-hover" onClick={handleNextQuestion}>
                                        <div className="w-full flex items-center justify-center gap-2">
                                            <p className="mb-0">Continuer</p>
                                            <FaArrowRight className="icon-translate" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </SlideFromBottom>
                    </div>
                </>
            )}
        </div>
    );
};

export default ValidationButton;
