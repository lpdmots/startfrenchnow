"use client";
import { ExerciseType, ResponsesLayouts, Exercise as ExerciseProps, Question, Exercise } from "@/app/types/sfn/blog";
import { CATEGORIESCOLORS, RESPONSESLAYOUTS } from "@/app/lib/constantes";
import { RichTextComponents } from "../../sanity/RichTextComponents";
import { PortableText } from "@portabletext/react";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { formatStringToNoWrap, getRandomItem, listToString, safeInputAnswer } from "@/app/lib/utils";
import { usePostLang } from "@/app/hooks/usePostLang";
import { useExerciseStore } from "@/app/stores/exerciseStore";
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
import { fetchExercise } from "@/app/serverActions/exerciseActions";
import Spinner from "../../common/Spinner";

interface Props {
    _ref: string;
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

export default function Exercise({ _ref }: Props) {
    const [exercise, setExercise] = useState<string | null | Exercise>(null);
    const postLang = usePostLang();

    useEffect(() => {
        (async () => {
            const response = await fetchExercise(_ref);
            if (response.error) return setExercise("error");
            else setExercise(response.exercise!);
        })();
    }, [_ref]);

    if (!exercise)
        return (
            <div className="flex justify-center items-center w-full" style={{ minHeight: "662px" }}>
                <Spinner radius maxHeight="40px" message={DEFAULTCONTENT[postLang].loading} color="var(--neutral-700)" />
            </div>
        );
    if (exercise === "error")
        return (
            <div className="flex justify-center items-center w-full" style={{ minHeight: "662px" }}>
                <p>
                    {postLang === "en"
                        ? "Oops sorry an error has occurred. This exercise is not currently available."
                        : "Oups, désolé une erreur s'est produite. Cet exercice n'est pas disponible pour l'instant."}
                </p>
            </div>
        );
    return <ExerciseContent exercise={exercise as Exercise} />;
}

const ExerciseContent = ({ exercise }: { exercise: Exercise }) => {
    const { _id, category } = exercise;
    const { getExercise, initializeExercise } = useExerciseStore();
    const { status, questionIndex } = getExercise(_id) || {};
    const colorVar = CATEGORIESCOLORS[category || "vocabulary"];
    const postLang = usePostLang();
    const { title, instruction } = useMemo(() => getContent(exercise, postLang), [exercise, postLang]);

    useEffect(() => {
        initializeExercise(_id, exercise);
    }, [_id]);

    return (
        <div className="my-12">
            <div className="flex flex-col">
                <h3>{title}</h3>
                {instruction}
            </div>
            <div className="card flex flex-col justify-center overflow-hidden p-2 sm:p-4 md:p-6 relative" style={{ backgroundColor: colorVar, minHeight: "min(550px, 90vh)" }}>
                {!status || status === "off" ? (
                    <CarouselLayout currentQuestionIndex={questionIndex || 0}>
                        <StartLayout _key={_id} exercise={exercise} />
                    </CarouselLayout>
                ) : status === "fetching" ? (
                    <FetchLayout exercise={exercise} />
                ) : status === "finished" ? (
                    <CarouselLayout currentQuestionIndex={questionIndex || 0}>
                        <EndLayout _key={_id} />
                    </CarouselLayout>
                ) : (
                    <QuestionLayouts exercise={exercise} />
                )}
            </div>
        </div>
    );
};

const QuestionLayouts = ({ exercise }: { exercise: ExerciseProps }) => {
    const { getExercise, setQuestionIndex, setStatus, updateScore, setScoreMax } = useExerciseStore();
    const { _id } = exercise;
    const { questions, questionIndex, scoreMax } = getExercise(_id);
    const currentQuestion = questions[questionIndex];
    const responsesLayout = getResponseLayout(currentQuestion, exercise.exerciseTypes || []);

    useEffect(() => {
        const scoreMax = questions.reduce((accumulator, currentValue) => {
            const scoreCalculation = currentValue.options?.scoreCalculation || 1;
            return accumulator + scoreCalculation;
        }, 0);
        setScoreMax(_id, scoreMax);
    }, [setScoreMax, _id, questions]);

    const handleError = () => {
        const scoreCalculation = currentQuestion.options?.scoreCalculation || 1;
        updateScore(_id, scoreCalculation, scoreCalculation);
        if (questionIndex === questions.length - 1) setStatus(_id, "finished");
        else setQuestionIndex(_id, questionIndex + 1);
    };

    const getQuestionLayout = () => {
        switch (responsesLayout) {
            case "true-false":
                return <ButtonsLayout responsesLayout="true-false" _key={_id} />;
            case "buttons":
                return <ButtonsLayout responsesLayout="buttons" _key={_id} />;
            case "checkbox":
                return <CheckboxLayout _key={_id} />;
            case "input":
                return <InputLayout _key={_id} />;
            case "select":
                return <SelectLayout _key={_id} />;
            case "imgMap":
                return <ImageMapLayout _key={_id} />;
            case "link":
                return <LinkLayout _key={_id} />;
            case "order":
                return <OrderLayout _key={_id} />;
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
            {scoreMax > 1 && <ProgressBar questionIndex={questionIndex} exercise={exercise} />}
            <CarouselLayout currentQuestionIndex={questionIndex}>{getQuestionLayout()}</CarouselLayout>
        </div>
    );
};

const getCorrectResponses = (currentQuestion: Question, numResponsesInPrompt: number): [Record<string, string[]>, boolean] => {
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

export const getSelectsInputsData = (currentQuestion: Question, handler: HandlerFunction, htmlElement: "select" | "input"): GetSelectsInputsDataResult => {
    const numResponsesInPrompt = (currentQuestion?.prompt?.text?.match(/RESPONSE/g) || []).length;
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
        const isCorrect = correctResponses[responseNumber].map((resp) => safeInputAnswer(resp)).includes(safeInputAnswer(selects[responseNumber]));
        if (isCorrect) rightAnswers++;
    }

    return (rightAnswers / keys.length) * scoreCalculation;
};

const getContent = (exercise: ExerciseProps, postLang: "en" | "fr") => {
    const title = formatStringToNoWrap(exercise[`title${postLang === "en" ? "_en" : ""}`]) || DEFAULTCONTENT[postLang].title;
    const instructionData = exercise[`instruction${postLang === "en" ? "_en" : ""}`];
    const instruction = instructionData ? <PortableText value={instructionData} components={RichTextComponents(exercise?.category)} /> : <p>{DEFAULTCONTENT[postLang].instruction}</p>;

    return { title, instruction };
};

const getResponseLayout = (currentQuestion: Question, possibleTypes: ExerciseType[]): ResponsesLayouts => {
    const { exerciseTypes } = currentQuestion;
    const exerciseType = getRandomItem(exerciseTypes.filter((type) => possibleTypes.includes(type)));
    if (!RESPONSESLAYOUTS.includes(exerciseType)) {
        return getRandomItem(exerciseTypes as ResponsesLayouts[]);
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
