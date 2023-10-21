"use client";
import { ExerciseTypes, ResponsesLayouts, SimpleExercise as SimpleExerciseProps, SimpleQuestion } from "@/app/types/sfn/blog";
import { COLORVARIABLES, RESPONSESLAYOUTS } from "@/app/lib/constantes";
import { RichTextComponents } from "../../sanity/RichTextComponents";
import { PortableText } from "@portabletext/react";
import { Dispatch, ReactElement, SetStateAction, useEffect, useMemo } from "react";
import { formatStringToNoWrap, getRandomItem, listToString } from "@/app/lib/utils";
import { usePostLang } from "@/app/hooks/usePostLang";
import { useSimpleExerciseStore } from "@/app/stores/simpleExerciseStore";
import QuestionPrompt from "./QuestionPrompt";
import { ImageMapLayout } from "./ImageMapLayout";
import { CarouselLayout } from "./CarouselLayout";
import { EndLayout, FetchLayout, StartLayout } from "./StatusLayouts";
import { ProgressBar } from "./ProgressBar";
import { ButtonsLayout } from "./ButtonsLayout";
import { CheckboxLayout } from "./CheckboxLayout";
import { SelectLayout } from "./SelectLayout";
import { InputLayout } from "./InputLayout";
import { LinkLayout } from "./LinkLayout";
import OrderLayout from "./OrderLayout";

interface Props {
    data: SimpleExerciseProps;
}

export const DEFAULTCONTENT = {
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
        initializeExercise(_key, simpleExercise);
    }, [initializeExercise, _key]);

    return (
        <div className="my-12">
            <div className="flex flex-col">
                <h2>{title}</h2>
                {instruction}
            </div>
            <div className="card flex flex-col justify-center overflow-hidden p-2 sm:p-4 md:p-6 relative" style={{ backgroundColor: colorVar, minHeight: "min(550px, 90vh)" }}>
                {!status || status === "off" ? (
                    <CarouselLayout currentQuestionIndex={questionIndex || 0}>
                        <StartLayout _key={_key} simpleExercise={simpleExercise} />
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
    const { getExercise, setQuestionIndex, setStatus, updateScore, setScoreMax } = useSimpleExerciseStore();
    const { _key } = simpleExercise;
    const { questions, questionIndex, scoreMax } = getExercise(_key);
    const currentQuestion = questions[questionIndex];
    const responsesLayout = getResponseLayout(currentQuestion, simpleExercise.exerciseTypes);

    useEffect(() => {
        const scoreMax = questions.reduce((accumulator, currentValue) => {
            const scoreCalculation = currentValue.options?.scoreCalculation || 1;
            return accumulator + scoreCalculation;
        }, 0);
        setScoreMax(_key, scoreMax);
    }, [setScoreMax, _key, questions]);

    const handleError = () => {
        const scoreCalculation = currentQuestion.options?.scoreCalculation || 1;
        updateScore(_key, scoreCalculation, scoreCalculation);
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
            case "imgMap":
                return <ImageMapLayout _key={_key} />;
            case "link":
                return <LinkLayout _key={_key} />;
            case "order":
                return <OrderLayout _key={_key} />;
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
            {scoreMax > 1 && <ProgressBar questionIndex={questionIndex} simpleExercise={simpleExercise} />}
            <CarouselLayout currentQuestionIndex={questionIndex}>{getQuestionLayout()}</CarouselLayout>
        </div>
    );
};

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

interface GetSelectsInputsDataResult {
    prompt: ReactElement;
    correctResponses: Record<string, string[]>;
    isBottomSelect: boolean;
    isError: boolean;
}

type HandlerFunction = (responseNumber: number, e: any) => void;

export const getSelectsInputsData = (currentQuestion: SimpleQuestion, handler: HandlerFunction, htmlElement: "select" | "input"): GetSelectsInputsDataResult => {
    const numResponsesInPrompt = (currentQuestion.prompt.text.match(/RESPONSE/g) || []).length;
    const isBottomSelect = numResponsesInPrompt === 0;

    const [correctResponses, isError] = getCorrectResponses(currentQuestion, numResponsesInPrompt);

    if (isError) {
        return { prompt: <p>Veuillez nous excuser, cette question n'est pas valide...</p>, correctResponses, isBottomSelect: false, isError };
    }

    const prompt = <QuestionPrompt currentQuestion={currentQuestion} htmlElement={htmlElement} handler={handler} />;

    return { prompt, correctResponses, isBottomSelect, isError };
};

export const getSelectPoints = (correctResponses: { [key: string]: string[] }, selects: { [key: string]: string }, scoreCalculation: number) => {
    const keys = Object.keys(correctResponses);
    let rightAnswers = 0;
    for (let i = 0; i < keys.length; i++) {
        const responseNumber = keys[i];
        const isCorrect = correctResponses[responseNumber].map((resp) => resp.toLowerCase()).includes(selects[responseNumber].trim().toLowerCase());
        if (isCorrect) rightAnswers++;
    }

    return (rightAnswers / keys.length) * scoreCalculation;
};

const getContent = (simpleExercise: SimpleExerciseProps, postLang: "en" | "fr") => {
    const title = formatStringToNoWrap(simpleExercise[`title${postLang === "en" ? "_en" : ""}`]) || DEFAULTCONTENT[postLang].title;
    const instructionData = simpleExercise[`instruction${postLang === "en" ? "_en" : ""}`];
    const instruction = instructionData ? <PortableText value={instructionData} components={RichTextComponents} /> : <p>{DEFAULTCONTENT[postLang].instruction}</p>;

    return { title, instruction };
};

const getResponseLayout = (currentQuestion: SimpleQuestion, possibleTypes: ExerciseTypes[]): ResponsesLayouts => {
    const { exerciseTypes } = currentQuestion;
    const exerciseType = getRandomItem(exerciseTypes.filter((type) => possibleTypes.includes(type)));
    if (!RESPONSESLAYOUTS.includes(exerciseType)) {
        return currentQuestion.defaultLayout || "buttons";
    }
    return exerciseType as ResponsesLayouts;
};

interface FeedbackMessageProps {
    isCorrect: boolean;
    correctResponses: Record<string, string[]>;
}

export const FeedbackMessage = ({ isCorrect, correctResponses }: FeedbackMessageProps) => {
    if (isCorrect) return null;

    const feedbackMessage = listToString(Object.values(correctResponses).map((list) => list[0]));
    const multipleResponses = feedbackMessage?.includes(" et ");
    return (
        <p className="mb-0">
            {multipleResponses ? "Réponses attendues" : "Réponse attendue"} : <span className="mb-0 text-secondary-4">{feedbackMessage}.</span>
        </p>
    );
};
