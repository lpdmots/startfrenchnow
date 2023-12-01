import { Exercise as ExerciseProps, Question, Theme } from "@/app/types/sfn/blog";
import { useEffect } from "react";
import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { shuffleArray } from "@/app/lib/utils";

const queryTheme = groq`
        *[_type=='theme' && _id in $themeIds] {
            ...,
            vocabItems[]->,
        }
    `;

const MAX_LOOP_COUNT = 10;

export const useQuestions = (exercise: ExerciseProps) => {
    const { _id, themes, exerciseTypes, questions } = exercise;
    const { setQuestions, setStatus } = useExerciseStore();

    const fetchThemeData = async (themeIds: string[]): Promise<Theme[]> => {
        return client.fetch(queryTheme, { themeIds });
    };

    const fetchAllQuestions = async () => {
        let themeIds = themes.map((theme) => theme._ref);
        let potentialQuestions: Question[] = questions || [];
        let loop = 0;

        while (themeIds.length && loop < MAX_LOOP_COUNT) {
            try {
                const themeData = await fetchThemeData(themeIds);
                const newQuestions = themeData
                    .map((theme) => theme.questions || [])
                    .flat()
                    .filter((question) => question.exerciseTypes.some((type) => exerciseTypes.includes(type)) && !potentialQuestions.some((q) => q._key === question._key));
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

        const nberOfQuestions = Math.min(potentialQuestions.length, exercise.nbOfQuestions);
        setQuestions(_id, shuffleArray(potentialQuestions).slice(0, nberOfQuestions));
        setStatus(_id, "inGame");
    };

    useEffect(() => {
        fetchAllQuestions();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
