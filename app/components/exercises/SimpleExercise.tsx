"use client";
import { ExerciseTypes, ResponsesLayouts, SimpleExercise as SimpleExerciseProps, SimpleQuestion } from "@/app/types/sfn/blog";
import Spinner from "../common/Spinner";
import { COLORVARIABLES, COLORVARIABLESSHADES, RESPONSESLAYOUTS } from "@/app/lib/constantes";
import { RichTextComponents } from "../sanity/RichTextComponents";
import { PortableText } from "@portabletext/react";
import { useQuestions } from "@/app/hooks/exercises/simpleExercise/useQuestions";
import { ChangeEvent, createElement, ReactElement, useEffect, useMemo, useState } from "react";
import { formatStringToNoWrap, getRandomItem, shuffleArray, splitAndKeepMultipleKeywords } from "@/app/lib/utils";
import { usePostLang } from "@/app/hooks/usePostLang";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { useSimpleExerciseStore } from "@/app/stores/simpleExerciseStore";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../animations/Slides";
import urlFor from "@/app/lib/urlFor";
import { AiOutlineSound } from "react-icons/ai";
import SimpleButton from "../animations/SimpleButton";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

interface Props {
    data: SimpleExerciseProps;
}

const DEFAULTCONTENT = {
    fr: {
        title: "Entrainement",
        instruction: "Répondez aux questions pour tester vos connaissances.",
        startButton: "Commencer",
        restartButton: "Recommencer",
        loading: "Chargement...",
        yourScore: "Votre score :",
    },
    en: {
        title: "Exercise",
        instruction: "Answer the questions to test your knowledge.",
        startButton: "Start",
        restartButton: "Restart",
        loading: "Loading...",
        yourScore: "Your score:",
    },
};

export default function SimpleExercise({ data: simpleExercise }: Props) {
    const { _key, color } = simpleExercise;
    const { getExercise, initializeExercise } = useSimpleExerciseStore();
    const { status, questionIndex } = getExercise(_key) || {};
    const colorVar = COLORVARIABLES[color || "blue"];
    const postLang = usePostLang();
    const { title, instruction } = useMemo(() => getContent(simpleExercise, postLang), [simpleExercise, postLang]);

    useEffect(() => {
        initializeExercise(_key);
    }, [initializeExercise, _key]);

    return (
        <div className="my-12">
            <div className="flex flex-col">
                <h2>{title}</h2>
                {instruction}
            </div>
            <div className="card flex flex-col justify-center overflow-hidden p-2 sm:p-4 md:p-12" style={{ backgroundColor: colorVar, minHeight: 500 }}>
                {!status || status === "off" ? (
                    <CarouselLayout currentQuestionIndex={questionIndex || 0}>
                        <StartLayout _key={_key} />
                    </CarouselLayout>
                ) : status === "fetching" ? (
                    <FetchLayout simpleExercise={simpleExercise} />
                ) : status === "finished" ? (
                    <CarouselLayout currentQuestionIndex={questionIndex || 0}>
                        <EndLayout _key={_key} />
                    </CarouselLayout>
                ) : (
                    <QuestionLayouts simpleExercise={simpleExercise} />
                )}
            </div>
        </div>
    );
}

const QuestionLayouts = ({ simpleExercise }: { simpleExercise: SimpleExerciseProps }) => {
    const { getExercise, setQuestionIndex, setStatus, addScore } = useSimpleExerciseStore();
    const { _key } = simpleExercise;
    const { questions, questionIndex } = getExercise(_key);
    const currentQuestion = questions[questionIndex];
    const responsesLayout = getResponseLayout(currentQuestion, simpleExercise.exerciseTypes);

    const handleError = () => {
        addScore(_key);
        if (questionIndex === questions.length - 1) setStatus(_key, "finished");
        else setQuestionIndex(_key, questionIndex + 1);
    };

    const getQuestionLayout = () => {
        switch (responsesLayout) {
            case "true-false":
                return <ButtonsLayout responsesLayout="true-false" _key={_key} />;
            case "buttons":
                return <ButtonsLayout responsesLayout="buttons" _key={_key} />;
            case "checkbox":
                return <CheckboxLayout _key={_key} />;
            case "input":
                return <InputLayout _key={_key} />;
            case "select":
                return <SelectLayout _key={_key} />;
            default:
                return (
                    <div className="flex flex-col justify-between items-center h-full p-2 sm:p-4 md:p-12 gap-6 md:gap-12">
                        <p>Cette question contient une erreur, elle ne peut être traitée...</p>
                        <button className="btn-secondary small col-span-2 sm:col-span-1" style={{ maxWidth: 300 }} onClick={handleError}>
                            Question suivante
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col grow justify-between items-center h-full gap-8 md:gap-12">
            {questions.length > 1 && <ProgressBar nbreOfQuestions={questions.length} questionIndex={questionIndex} simpleExercise={simpleExercise} />}
            <CarouselLayout currentQuestionIndex={questionIndex}>{getQuestionLayout()}</CarouselLayout>
        </div>
    );
};

const CarouselLayout = ({ currentQuestionIndex, children, delay = 0 }: { currentQuestionIndex: number; children: JSX.Element; delay?: number }) => {
    const [initialKey] = useState(Date.now()); // pour éviter l'animationn à chaque rerender.

    return (
        <AnimatePresence mode="wait">
            <m.div
                className="w-full grow flex-col flex justify-around items-center gap-8"
                key={currentQuestionIndex ? currentQuestionIndex : initialKey}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, type: "spring", delay }}
            >
                {children}
            </m.div>
        </AnimatePresence>
    );
};

const StartLayout = ({ _key }: { _key: string }) => {
    const postLang = usePostLang();
    const { setStatus } = useSimpleExerciseStore();

    const handleClick = () => {
        setStatus(_key, "fetching");
    };

    return (
        <div className="flex flex-col justify-between items-center h-full gap-6 md:gap-12">
            <Image src="/images/learning.png" alt="learning" width={100} height={100} />
            <button className="btn-secondary small col-span-2 sm:col-span-1" style={{ maxWidth: 300, minWidth: 250 }} onClick={handleClick}>
                {DEFAULTCONTENT[postLang].startButton}
            </button>
        </div>
    );
};

const FetchLayout = ({ simpleExercise }: { simpleExercise: SimpleExerciseProps }) => {
    const postLang = usePostLang();
    useQuestions(simpleExercise);

    return (
        <div className="flex justify-center items-center w-full">
            <Spinner radius maxHeight="40px" message={DEFAULTCONTENT[postLang].loading} />
        </div>
    );
};

const EndLayout = ({ _key }: { _key: string }) => {
    const postLang = usePostLang();
    const { restart, getExercise } = useSimpleExerciseStore();
    const { questions, score } = getExercise(_key);
    const percentage = useMemo(() => Math.round((score / questions.length) * 100), []); // eslint-disable-line react-hooks/exhaustive-deps
    const { scoreColor, imageUrl, prompt } = useMemo(() => getContentFromScore(percentage, postLang), [percentage, postLang]);

    const handleClick = () => {
        restart(_key);
    };

    return (
        <div className="flex flex-col justify-between items-center h-full gap-6 md:gap-12">
            <Image src={imageUrl} alt="learning" width={150} height={150} />
            <p className="text-center w-full">{prompt}</p>
            <p className="font-bold text-2xl sm:text-4xl" style={{ color: scoreColor }}>
                {DEFAULTCONTENT[postLang].yourScore} {percentage}%
            </p>
            <button className="btn-secondary small col-span-2 sm:col-span-1" style={{ maxWidth: 300, minWidth: 250 }} onClick={handleClick}>
                {DEFAULTCONTENT[postLang].restartButton}
            </button>
        </div>
    );
};

const ButtonsLayout = ({ responsesLayout, _key }: { responsesLayout: "buttons" | "true-false"; _key: string }) => {
    const { addScore, setQuestionIndex, setStatus, getExercise } = useSimpleExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const [disabled, setDisabled] = useState(false);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const isFinished = questionIndex === questions.length - 1;
    const responses = useMemo(() => {
        if (responsesLayout === "buttons") return shuffleArray(currentQuestion.responses);
        return currentQuestion.responses;
    }, [currentQuestion.responses, responsesLayout]);

    const handleClick = (isCorrect: string) => {
        setDisabled(true);
        if (isCorrect) addScore(_key);
        if (isFinished) setStatus(_key, "finished");
        else setQuestionIndex(_key, questionIndex + 1);
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center gap-4 md:gap-8 w-full">
                <div className="card shadow-1 flex items-center p-4 w-full font-bold" style={{ minHeight: 100, minWidth: 250 }}>
                    <QuestionPrompt currentQuestion={currentQuestion} htmlElement="disabledInput" />
                </div>
            </div>
            <div className="flex justify-center items-center w-full">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {responses.map((response, index) => {
                            return (
                                <div className="col-span-2 sm:col-span-1" key={index}>
                                    <SlideInOneByOneChild duration={0.3}>
                                        <button className="btn-secondary small w-full" disabled={disabled} onClick={() => handleClick(response.isCorrect)}>
                                            {response.text}
                                        </button>
                                    </SlideInOneByOneChild>
                                </div>
                            );
                        })}
                    </div>
                </SlideInOneByOneParent>
            </div>
        </>
    );
};

const CheckboxLayout = ({ _key }: { _key: string }) => {
    const { addScore, setQuestionIndex, setStatus, getExercise } = useSimpleExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const [disabled, setDisabled] = useState(false);
    const currentQuestion = useMemo(() => questions[questionIndex], []); // eslint-disable-line react-hooks/exhaustive-deps
    const isFinished = questionIndex === questions.length - 1;
    const responses = useMemo(() => shuffleArray(currentQuestion.responses), [currentQuestion.responses]);
    const [checkboxes, setCheckboxes] = useState({} as { [key: string]: boolean });
    const moreThan4Responses = responses.length > 4;

    const handleCheck = (responseText: string) => {
        setCheckboxes({ ...checkboxes, [responseText]: !checkboxes[responseText] });
    };

    const handleClick = () => {
        setDisabled(true);
        const isCorrect = responses.every((response) => !!response.isCorrect === !!checkboxes[response.text]);
        if (isCorrect) addScore(_key);
        if (isFinished) setStatus(_key, "finished");
        else setQuestionIndex(_key, questionIndex + 1);
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center gap-4 md:gap-8 w-full">
                <div className="card shadow-1 flex items-center p-4 w-full font-bold" style={{ minHeight: 100, minWidth: 250 }}>
                    <QuestionPrompt currentQuestion={currentQuestion} htmlElement="disabledInput" />
                </div>
            </div>
            <div className="flex justify-center items-center w-full">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {responses.map((response, index) => {
                            return (
                                <div className={`${moreThan4Responses ? "col-span-1" : "col-span-2"} sm:col-span-1`} key={index}>
                                    <SlideInOneByOneChild duration={0.3}>
                                        <div className="w-checkbox checkbox-field-wrapper col-span-2 mb-0">
                                            <label className="w-stars-label flex items-center cursor-pointer" onClick={() => handleCheck(response.text)}>
                                                <div
                                                    id="checkbox"
                                                    className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checkboxes[response.text] ? "w--redirected-checked" : undefined}`}
                                                ></div>
                                                {response.text}
                                            </label>
                                        </div>
                                    </SlideInOneByOneChild>
                                </div>
                            );
                        })}
                        <div className="col-span-2">
                            <SlideInOneByOneChild duration={0.3}>
                                <div className="w-full flex justify-center">
                                    <button className="btn-secondary small w-full sm:w-60" disabled={disabled} onClick={handleClick}>
                                        Valider
                                    </button>
                                </div>
                            </SlideInOneByOneChild>
                        </div>
                    </div>
                </SlideInOneByOneParent>
            </div>
        </>
    );
};

const SelectLayout = ({ _key }: { _key: string }) => {
    const { addScore, setQuestionIndex, setStatus, getExercise } = useSimpleExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const [disabled, setDisabled] = useState(true);
    const currentQuestion = useMemo(() => {
        const currentQuestion = questions[questionIndex];
        currentQuestion.responses = shuffleArray(currentQuestion.responses);
        return currentQuestion;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [selects, setSelects] = useState({} as { [key: string]: string });
    const handleSelect = (responseNumber: number, e: ChangeEvent<HTMLSelectElement>) => {
        console.log({ responseNumber });
        setSelects((prevSelects) => ({ ...prevSelects, [responseNumber]: e.target.value }));
    };

    const { prompt, correctResponses, isBottomSelect, isError } = useMemo(() => getSelectsInputsData(currentQuestion, handleSelect, "select"), [currentQuestion, handleSelect]);

    const isFinished = questionIndex === questions.length - 1;
    console.log({ selects, correctResponses });

    useEffect(() => {
        if (Object.keys(selects).length === Object.keys(correctResponses).length) setDisabled(false);
        else setDisabled(true);
    }, [selects]);

    const handleClick = () => {
        setDisabled(true);
        const isCorrect = isError || getSelectIsCorrect(correctResponses, selects);
        if (isCorrect) addScore(_key);
        if (isFinished) setStatus(_key, "finished");
        else setQuestionIndex(_key, questionIndex + 1);
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center gap-4 md:gap-8 w-full">
                <div className="card shadow-1 flex items-center p-4 w-full font-bold" style={{ minHeight: 100, minWidth: 250 }}>
                    {prompt}
                </div>
            </div>
            <div className="flex justify-center items-center w-full">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <div className="flex flex-col gap-4">
                        {isBottomSelect && (
                            <SlideInOneByOneChild duration={0.3}>
                                <div className="w-full flex justify-center my-1">
                                    <select
                                        className="rounded-xl px-2 text-secondary-2 text-base md:text-lg font-bold w-full sm:w-60 h-12 md:h-14"
                                        onChange={(e) => handleSelect(1, e)}
                                        autoComplete="off"
                                        defaultValue=""
                                    >
                                        <option value="" hidden></option>
                                        {currentQuestion.responses.map((response, index) => {
                                            return (
                                                <option className=" text-base md:text-lg font-bold" key={index} value={response.text}>
                                                    {response.text}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </SlideInOneByOneChild>
                        )}
                        <SlideInOneByOneChild duration={0.3}>
                            <div className="w-full flex justify-center">
                                <button className="btn-secondary small w-full sm:w-60" disabled={disabled} onClick={handleClick}>
                                    Valider
                                </button>
                            </div>
                        </SlideInOneByOneChild>
                    </div>
                </SlideInOneByOneParent>
            </div>
        </>
    );
};

const InputLayout = ({ _key }: { _key: string }) => {
    const { addScore, getExercise, setQuestionIndex, setStatus } = useSimpleExerciseStore();
    const { questions, questionIndex } = getExercise(_key);
    const [disabled, setDisabled] = useState(true);
    const currentQuestion = questions[questionIndex];
    const [inputs, setInputs] = useState({} as { [key: string]: string });

    const handleChange = (responseNumber: number, e: ChangeEvent<HTMLInputElement>) => {
        console.log({ responseNumber });
        setInputs((prevInputs) => ({ ...prevInputs, [responseNumber]: e.target.value }));
    };

    const { prompt, correctResponses, isBottomSelect, isError } = useMemo(() => getSelectsInputsData(currentQuestion, handleChange, "input"), [currentQuestion, handleChange]);

    const isFinished = questionIndex === questions.length - 1;
    console.log({ inputs, correctResponses });

    useEffect(() => {
        if (Object.keys(inputs).length === Object.keys(correctResponses).length) setDisabled(false);
        else setDisabled(true);
    }, [inputs]);

    const handleValidation = () => {
        setDisabled(true);
        const isCorrect = isError || getSelectIsCorrect(correctResponses, inputs);
        if (isCorrect) addScore(_key);
        if (isFinished) setStatus(_key, "finished");
        else setQuestionIndex(_key, questionIndex + 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!disabled) {
            handleValidation();
        }
    };

    return (
        <form className="flex-col flex justify-around items-center gap-8 grow" onSubmit={handleSubmit}>
            <div className="flex flex-col justify-center items-center gap-4 md:gap-8 w-full">
                <div className="card shadow-1 flex items-center p-4 w-full font-bold" style={{ minHeight: 100, minWidth: 250 }}>
                    {prompt}
                </div>
            </div>
            <div className="flex justify-center items-center w-full">
                <SlideInOneByOneParent delayChildren={0.1}>
                    <div className="flex flex-col gap-4">
                        {isBottomSelect && (
                            <SlideInOneByOneChild duration={0.3}>
                                <div className="w-full flex justify-center my-1">
                                    <input
                                        type="text"
                                        className="rounded-xl px-2 text-secondary-2 my-1 focus:border-secondary-2 w-full sm:w-60 h-12 md:h-14"
                                        onChange={(e) => handleChange(1, e)}
                                        name="response"
                                        placeholder="..."
                                        autoComplete="off"
                                    />
                                </div>
                            </SlideInOneByOneChild>
                        )}
                        <SlideInOneByOneChild duration={0.3}>
                            <div className="w-full flex justify-center">
                                <button type="submit" className="btn-secondary small w-full sm:w-60" disabled={disabled}>
                                    Valider
                                </button>
                            </div>
                        </SlideInOneByOneChild>
                    </div>
                </SlideInOneByOneParent>
            </div>
        </form>
    );
};

const ProgressBar = ({ nbreOfQuestions, questionIndex, simpleExercise }: { nbreOfQuestions: number; questionIndex: number; simpleExercise: SimpleExerciseProps }) => {
    const { getExercise } = useSimpleExerciseStore();
    const { questions, score } = getExercise(simpleExercise._key);
    const [shouldScale, setShouldScale] = useState(false);
    const widthPercentage = `${(score / nbreOfQuestions) * 100}%`;

    useEffect(() => {
        setShouldScale(true);
        const timer = setTimeout(() => setShouldScale(false), 200); // Reset après 0.3 secondes
        return () => clearTimeout(timer);
    }, [score]);

    const scaleEffect = shouldScale ? { scale: 1.2, color: "rgb(0, 128, 0)" } : { scale: 1 };

    return (
        <div className="flex w-full items-center gap-4 py-2 sm:py-0">
            <div className="flex justify-center items-center">
                <m.p className="text-base font-bold mb-0" animate={scaleEffect} transition={{ duration: 0.2 }}>
                    {Math.round((score / questions.length) * 100) + "%"}
                </m.p>
            </div>
            <m.div className="w-full rounded-full" style={{ height: 5, backgroundColor: COLORVARIABLESSHADES[simpleExercise.color] }}>
                <m.div
                    className="bg-neutral-700 rounded-full"
                    initial={{ width: 0 }} // valeur initiale
                    animate={{ width: widthPercentage }} // valeur finale
                    transition={{ duration: 0.5, ease: "linear" }} // paramètres de la transition
                    style={{ height: 5 }}
                ></m.div>
            </m.div>
            <div className="flex justify-center items-center">
                <p className="text-base font-bold mb-0">{questionIndex + 1}</p>
                <p className="text-base font-bold mb-0">/{nbreOfQuestions}</p>
            </div>
        </div>
    );
};

const RenderImageBlock = ({ imageData }: { imageData: string }) => {
    if (!imageData) return null;
    return (
        <div className="w-full flex items-center justify-center my-2 rounded-xl overflow-hidden">
            <Image src={urlFor(imageData).url()} alt="image" height={500} width={500} className="object-contain h-auto rounded-xl" />
        </div>
    );
};

const RenderImageSpan = ({ imageData }: { imageData: string }) => {
    if (!imageData) return null;
    return (
        <span className="mb-0 mx-2">
            <Image src={urlFor(imageData).url()} alt="image" height={75} width={75} className="object-contain" />
        </span>
    );
};

const RenderSoundBlock = ({ soundString }: { soundString: string }) => {
    if (!soundString) return null;
    const audio = new Audio(cloudFrontDomain + soundString);
    return (
        <div className="flex justify-center w-full">
            <SimpleButton>
                <m.div onClick={() => audio.play()} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <AiOutlineSound className="text-5xl lg:text-6xl" />
                </m.div>
            </SimpleButton>
        </div>
    );
};

const RenderSoundSpan = ({ soundString }: { soundString: string }) => {
    if (!soundString) return null;
    const audio = new Audio(cloudFrontDomain + soundString);
    return (
        <m.span className="cursor-pointer mx-2 " onClick={() => audio.play()} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
            <AiOutlineSound className="text-3xl lg:text-4xl " />
        </m.span>
    );
};

const renderers: any = {
    IMGBLOCK: RenderImageBlock,
    IMGSPAN: RenderImageSpan,
    SNDBLOCK: RenderSoundBlock,
    SNDSPAN: RenderSoundSpan,
};

const QuestionPrompt = ({ currentQuestion, htmlElement, handler }: { currentQuestion: SimpleQuestion; htmlElement: "disabledInput" | "select" | "input"; handler?: HandlerFunction }) => {
    const chunks = useMemo(() => splitAndKeepMultipleKeywords(currentQuestion.prompt.text, keywordPairs(htmlElement === "disabledInput")), [currentQuestion.prompt]);

    let imgIndex = 0;
    let sndIndex = 0;
    let respIndex = 0;

    return (
        <div className="my-1 w-full flex items-center flex-wrap">
            {chunks.map((chunk) => {
                if (chunk === "RESP") {
                    respIndex++;
                    if (htmlElement === "disabledInput") {
                        return (
                            <input
                                key={respIndex}
                                type="text"
                                className="rounded-lg px-2 text-secondary-2 text-center my-1"
                                style={{ width: 150, minHeight: 40 }}
                                disabled
                                name="response"
                                placeholder="?"
                                autoComplete="off"
                            />
                        );
                    }
                    if (htmlElement === "select") {
                        return <SelectInput key={respIndex} index={respIndex} responses={currentQuestion.responses} handler={handler as HandlerFunction} />;
                    }
                    return <TextInput key={respIndex} index={respIndex} handler={handler as HandlerFunction} />;
                }
                if (chunk in renderers) {
                    return createElement(renderers[chunk], {
                        key: chunk,
                        imageData: currentQuestion.prompt.images?.[imgIndex++],
                        soundString: currentQuestion.prompt.sounds?.[sndIndex++],
                    });
                }
                return <span key={chunk}>{chunk}</span>;
            })}
        </div>
    );
};

type HandlerFunction = (responseNumber: number, e: any) => void;
interface GetSelectsInputsDataResult {
    prompt: ReactElement;
    correctResponses: Record<string, string[]>;
    isBottomSelect: boolean;
    isError: boolean;
}

const getCorrectResponses = (currentQuestion: SimpleQuestion, numResponsesInPrompt: number): [Record<string, string[]>, boolean] => {
    const correctResponses: Record<string, string[]> = {};
    let isError = false;
    let loopIndex = 1;

    const maxResponses = numResponsesInPrompt || 1;

    while (loopIndex <= maxResponses) {
        const correctAnswers = currentQuestion.responses.filter((response) => response.isCorrect?.toString().split(",").includes(loopIndex.toString())).map((response) => response.text);

        if (correctAnswers.length === 0) {
            isError = true;
        }

        correctResponses[loopIndex.toString()] = correctAnswers;
        loopIndex++;
    }

    return [correctResponses, isError];
};

const getSelectsInputsData = (currentQuestion: SimpleQuestion, handler: HandlerFunction, htmlElement: "select" | "input"): GetSelectsInputsDataResult => {
    const numResponsesInPrompt = (currentQuestion.prompt.text.match(/RESPONSE/g) || []).length;
    const isBottomSelect = numResponsesInPrompt === 0;

    const [correctResponses, isError] = getCorrectResponses(currentQuestion, numResponsesInPrompt);

    if (isError) {
        return { prompt: <p>Veuillez nous excuser, cette question n'est pas valide...</p>, correctResponses, isBottomSelect: false, isError };
    }

    const prompt = <QuestionPrompt currentQuestion={currentQuestion} htmlElement={htmlElement} handler={handler} />;

    return { prompt, correctResponses, isBottomSelect, isError };
};

const SelectInput: React.FC<{ index: number; responses: { text: string }[]; handler: HandlerFunction }> = ({ index, responses, handler }) => (
    <select
        key={index}
        className="rounded-lg px-2 text-secondary-2 text-base md:text-lg mx-1 font-bold my-1"
        style={{ minHeight: 40 }}
        onChange={(e) => handler(index, e)}
        autoComplete="off"
        defaultValue=""
    >
        <option value="" hidden></option>
        {responses.map((response, index) => (
            <option className="text-base md:text-lg font-bold mx-6" key={index} value={response.text}>
                {response.text}
            </option>
        ))}
    </select>
);

const TextInput: React.FC<{ index: number; handler: HandlerFunction }> = ({ index, handler }) => (
    <input
        key={index}
        type="text"
        className="rounded-lg px-2 text-secondary-2 my-1 mx-1 focus:border-secondary-2"
        style={{ width: 150, minHeight: 40 }}
        onChange={(e) => handler(index, e)}
        name="response"
        placeholder="..."
        autoComplete="off"
    />
);

const getSelectIsCorrect = (correctResponses: { [key: string]: string[] }, selects: { [key: string]: string }) => {
    let isCorrect = true;
    const keys = Object.keys(correctResponses);
    for (let i = 0; i < keys.length; i++) {
        const responseNumber = keys[i];
        isCorrect = correctResponses[responseNumber].map((resp) => resp.toLowerCase()).includes(selects[responseNumber].trim().toLowerCase());
        if (!isCorrect) break;
    }
    return isCorrect;
};

const getContent = (simpleExercise: SimpleExerciseProps, postLang: "en" | "fr") => {
    const title = formatStringToNoWrap(simpleExercise[`title${postLang === "en" ? "_en" : ""}`]) || DEFAULTCONTENT[postLang].title;
    const instructionData = simpleExercise[`instruction${postLang === "en" ? "_en" : ""}`];
    const instruction = instructionData ? <PortableText value={instructionData} components={RichTextComponents} /> : <p>{DEFAULTCONTENT[postLang].instruction}</p>;

    return { title, instruction };
};

const SCOREPROMPTS = {
    fr: {
        success: "Bravo ! Tu maîtrises parfaitement le sujet.",
        fail: "Tu as fait trop d'erreurs, entraine-toi davantage et tu vas y arriver.",
        ok: "Pas mal, mais tu peux faire mieux.",
        good: "Bien joué ! Tu as presque tout bon.",
    },
    en: {
        success: "Well done! You master the subject perfectly.",
        fail: "You made too many mistakes, train more and you will succeed.",
        ok: "Not bad, but you can do better.",
        good: "Well done! You almost got it all right.",
    },
};

const getContentFromScore = (score: number, postLang: "en" | "fr") => {
    if (score === 100) {
        return {
            scoreColor: "darkgreen",
            imageUrl: "/images/trophee.png",
            prompt: SCOREPROMPTS[postLang].success,
        };
    }
    if (score >= 70) {
        return {
            scoreColor: COLORVARIABLES.green,
            imageUrl: "/images/medaille.png",
            prompt: SCOREPROMPTS[postLang].good,
        };
    }
    if (score >= 40) {
        return {
            scoreColor: COLORVARIABLES.yellow,
            imageUrl: "/images/bad2.png",
            prompt: SCOREPROMPTS[postLang].ok,
        };
    }
    return {
        scoreColor: "darkred",
        imageUrl: "/images/bad.png",
        prompt: SCOREPROMPTS[postLang].fail,
    };
};

const getResponseLayout = (currentQuestion: SimpleQuestion, possibleTypes: ExerciseTypes[]): ResponsesLayouts => {
    const { exerciseTypes } = currentQuestion;
    const exerciseType = getRandomItem(exerciseTypes.filter((type) => possibleTypes.includes(type)));
    if (!RESPONSESLAYOUTS.includes(exerciseType)) {
        return currentQuestion.defaultLayout || "buttons";
    }
    return exerciseType as ResponsesLayouts;
};

const keywordPairs = (isForPrompt: boolean) => {
    return [
        { keyword: "RESPONSE", keywordReplace: "RESP", maxKeyword: isForPrompt ? 1 : Infinity },
        { keyword: "IMAGEBLOCK", keywordReplace: "IMGBLOCK", maxKeyword: Infinity },
        { keyword: "IMAGESPAN", keywordReplace: "IMGSPAN", maxKeyword: Infinity },
        { keyword: "SOUNDBLOCK", keywordReplace: "SNDBLOCK", maxKeyword: Infinity },
        { keyword: "SOUNDSPAN", keywordReplace: "SNDSPAN", maxKeyword: Infinity },
    ];
};
