import { usePostLang } from "@/app/hooks/usePostLang";
import { useSimpleExerciseStore } from "@/app/stores/simpleExerciseStore";
import Image from "next/image";
import { DEFAULTCONTENT } from "./SimpleExercise";
import { SimpleExercise as SimpleExerciseProps } from "@/app/types/sfn/blog";
import { useQuestions } from "@/app/hooks/exercises/simpleExercise/useQuestions";
import Spinner from "../../common/Spinner";
import { useMemo } from "react";
import { COLORVARIABLES, STARTLAYOUTIMAGE } from "@/app/lib/constantes";

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

export const StartLayout = ({ _key, simpleExercise }: { _key: string; simpleExercise: SimpleExerciseProps }) => {
    const postLang = usePostLang();
    const { setStatus } = useSimpleExerciseStore();
    const imageUrl = STARTLAYOUTIMAGE[simpleExercise.exerciseTypes[0]];

    const handleClick = () => {
        setStatus(_key, "fetching");
    };

    return (
        <div className="flex flex-col justify-between items-center h-full gap-6 md:gap-12">
            <Image src={imageUrl} alt="learning" width={100} height={100} />
            <button className="btn-secondary small col-span-2 sm:col-span-1" style={{ maxWidth: 300, minWidth: 250 }} onClick={handleClick}>
                {DEFAULTCONTENT[postLang].startButton}
            </button>
        </div>
    );
};

export const FetchLayout = ({ simpleExercise }: { simpleExercise: SimpleExerciseProps }) => {
    const postLang = usePostLang();
    useQuestions(simpleExercise);

    return (
        <div className="flex justify-center items-center w-full">
            <Spinner radius maxHeight="40px" message={DEFAULTCONTENT[postLang].loading} />
        </div>
    );
};

export const EndLayout = ({ _key }: { _key: string }) => {
    const postLang = usePostLang();
    const { restart, getExercise } = useSimpleExerciseStore();
    const { score, scoreMax } = getExercise(_key);
    const percentage = useMemo(() => Math.round((score / scoreMax) * 100), []); // eslint-disable-line react-hooks/exhaustive-deps
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
            scoreColor: "darkgreen",
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
