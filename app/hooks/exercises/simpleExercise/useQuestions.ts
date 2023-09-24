import { ExerciseTheme, SimpleExercise as SimpleExerciseProps, SimpleQuestion } from "@/app/types/sfn/blog";
import { useEffect } from "react";
import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import { useSimpleExerciseStore } from "@/app/stores/simpleExerciseStore";
import { shuffleArray } from "@/app/lib/utils";

const queryTheme = groq`
        *[_type=='exerciseTheme' && _id in $themeIds]
    `;

const MAX_LOOP_COUNT = 10;

export const useQuestions = (simpleExercise: SimpleExerciseProps) => {
    const { _key, themes, exerciseTypes } = simpleExercise;
    const { setQuestions, setStatus } = useSimpleExerciseStore();

    const fetchThemeData = async (themeIds: string[]): Promise<ExerciseTheme[]> => {
        return client.fetch(queryTheme, { themeIds });
    };

    const fetchAllQuestions = async () => {
        let themeIds = themes.map((theme) => theme._ref);
        let potentialQuestions: SimpleQuestion[] = [];
        let loop = 0;

        while (themeIds.length && loop < MAX_LOOP_COUNT) {
            try {
                const themeData = await fetchThemeData(themeIds);
                const newQuestions = themeData
                    .map((theme) => theme.questions || [])
                    .flat()
                    .filter((question) => question.exerciseTypes.some((type) => exerciseTypes.includes(type)));
                potentialQuestions.push(...newQuestions);

                themeIds = themeData
                    .map((theme) => theme.children?.map((child) => child._ref) || [])
                    .flat()
                    .filter(Boolean);

                loop++;
            } catch (error) {
                console.error("Error fetching theme data:", error);
                break;
            }
        }

        const nberOfQuestions = potentialQuestions.length < simpleExercise.nbOfQuestions ? potentialQuestions.length : simpleExercise.nbOfQuestions;
        setQuestions(_key, shuffleArray(potentialQuestions).slice(0, nberOfQuestions));
        setStatus(_key, "inGame");
    };

    useEffect(() => {
        fetchAllQuestions();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
