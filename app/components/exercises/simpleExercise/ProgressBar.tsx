"use client";
import { SimpleExercise as SimpleExerciseProps } from "@/app/types/sfn/blog";
import { COLORVARIABLESSHADES } from "@/app/lib/constantes";
import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { useSimpleExerciseStore } from "@/app/stores/simpleExerciseStore";

export const ProgressBar = ({ questionIndex, simpleExercise }: { questionIndex: number; simpleExercise: SimpleExerciseProps }) => {
    const { getExercise } = useSimpleExerciseStore();
    const { questions, score, scoreMax, currentMaxScore } = getExercise(simpleExercise._key);
    const [shouldScale, setShouldScale] = useState(false);
    const widthPercentageScore = `${(score / scoreMax) * 100}%`;
    const widthPercentageCurrentMax = `${(currentMaxScore / scoreMax) * 100}%`;

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
                    {Math.round((score / scoreMax) * 100) + "%"}
                </m.p>
            </div>
            <m.div className="w-full rounded-full relative" style={{ height: 5, backgroundColor: COLORVARIABLESSHADES[simpleExercise.color] }}>
                <m.div
                    className="bg-neutral-400 rounded-full"
                    initial={{ width: 0 }} // valeur initiale
                    animate={{ width: widthPercentageCurrentMax }} // valeur finale
                    transition={{ duration: 0.5, ease: "linear" }} // paramètres de la transition
                    style={{ height: 5 }}
                ></m.div>
                <m.div
                    className="bg-neutral-700 rounded-full absolute top-0 left-0 z-10"
                    initial={{ width: 0 }} // valeur initiale
                    animate={{ width: widthPercentageScore }} // valeur finale
                    transition={{ duration: 0.5, ease: "linear" }} // paramètres de la transition
                    style={{ height: 5 }}
                ></m.div>
            </m.div>
            <div className="flex justify-center items-center">
                <p className="text-base font-bold mb-0">{questionIndex + 1}</p>
                <p className="text-base font-bold mb-0">/{questions.length}</p>
            </div>
        </div>
    );
};
