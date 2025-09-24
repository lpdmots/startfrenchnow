import { useExerciseStore } from "@/app/stores/exerciseStore";
import Image from "next/image";
import { DEFAULTCONTENT } from "./Exercise";
import { Exercise as ExerciseProps, LevelChoice } from "@/app/types/sfn/blog";
import { useQuestions } from "@/app/hooks/exercises/exercise/useQuestions";
import Spinner from "../../common/Spinner";
import { useMemo } from "react";
import { COLORVARIABLES, STARTLAYOUTIMAGE } from "@/app/lib/constantes";
import { useLocale } from "next-intl";

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

export const StartLayout = ({ _key, exercise }: { _key: string; exercise: ExerciseProps }) => {
    const locale = useLocale() as "fr" | "en";
    const { setStatus } = useExerciseStore();
    const imageUrl = STARTLAYOUTIMAGE[exercise.exerciseTypes?.[0] || "buttons"];

    const handleClick = () => {
        setStatus(_key, "fetching");
    };

    return (
        <div className="flex flex-col justify-between items-center h-full gap-6 md:gap-12">
            <Image src={imageUrl} alt="learning" width={100} height={100} />
            <button className="btn-secondary small col-span-2 sm:col-span-1" style={{ maxWidth: 300, minWidth: 250 }} onClick={handleClick}>
                {DEFAULTCONTENT[locale].startButton}
            </button>
        </div>
    );
};

export const FetchLayout = ({ exercise, _id }: { exercise: ExerciseProps; _id: string }) => {
    const locale = useLocale() as "fr" | "en";
    const { getExercise } = useExerciseStore();
    const { levelChoice } = getExercise(_id);
    useQuestions(exercise, levelChoice);

    return (
        <div className="flex justify-center items-center w-full">
            <Spinner radius maxHeight="40px" message={DEFAULTCONTENT[locale].loading} />
        </div>
    );
};

export const EndLayout = ({ _key }: { _key: string }) => {
    const locale = useLocale() as "fr" | "en";
    const { restart, getExercise } = useExerciseStore();
    const { score, scoreMax } = getExercise(_key);
    const percentage = useMemo(() => Math.round((score / scoreMax) * 100), []); // eslint-disable-line react-hooks/exhaustive-deps
    const { scoreColor, imageUrl, prompt } = useMemo(() => getContentFromScore(percentage, locale), [percentage, locale]);

    const handleClick = () => {
        restart(_key);
    };

    return (
        <div className="flex flex-col justify-between items-center h-full gap-6 md:gap-12">
            <Image src={imageUrl} alt="learning" width={150} height={150} />
            <p className="text-center w-full">{prompt}</p>
            <p className="font-bold text-2xl sm:text-4xl" style={{ color: scoreColor }}>
                {DEFAULTCONTENT[locale].yourScore} {percentage}%
            </p>
            <button className="btn-secondary small col-span-2 sm:col-span-1" style={{ maxWidth: 300, minWidth: 250 }} onClick={handleClick}>
                {DEFAULTCONTENT[locale].restartButton}
            </button>
        </div>
    );
};

const getContentFromScore = (score: number, locale: "en" | "fr") => {
    if (score === 100) {
        return {
            scoreColor: "darkgreen",
            imageUrl: "/images/trophee.png",
            prompt: SCOREPROMPTS[locale].success,
        };
    }
    if (score >= 70) {
        return {
            scoreColor: "darkgreen",
            imageUrl: "/images/medaille.png",
            prompt: SCOREPROMPTS[locale].good,
        };
    }
    if (score >= 40) {
        return {
            scoreColor: COLORVARIABLES.yellow,
            imageUrl: "/images/bad2.png",
            prompt: SCOREPROMPTS[locale].ok,
        };
    }
    return {
        scoreColor: "darkred",
        imageUrl: "/images/bad.png",
        prompt: SCOREPROMPTS[locale].fail,
    };
};
