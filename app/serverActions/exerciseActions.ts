"use server";
import { groq } from "next-sanity";
import { SanityServerClient as client } from "../lib/sanity.clientServerDev";
import { Exercise, ThemeWithVocab, VocabItem } from "../types/sfn/blog";

const queryThemes = groq`
        *[_type == "theme" && _id in $refs] 
        {
            ...,
            vocabItems[]->,
        }
    `;

export const getThemes = async (refs: string[]) => {
    try {
        const themes: ThemeWithVocab[] = await client.fetch(queryThemes, { refs });
        return { themes, status: 200 };
    } catch (error: any) {
        return { error: "Something went wrong, please contact us.", status: 500 };
    }
};

const queryVocabItems = groq`
        *[_type == "vocabItem" && _id in $refs] 
        {
            ...,
            vocabItems[]->,
        }
    `;

export const getVocabItems = async (refs: string[]) => {
    try {
        const vocabItems: VocabItem[] = await client.fetch(queryVocabItems, { refs });
        return { vocabItems, status: 200 };
    } catch (error: any) {
        return { error: "Something went wrong, please contact us.", status: 500 };
    }
};

const queryExercise = groq`
    *[_type == "exercise" && _id == $ref][0]
`;

export const fetchExercise = async (ref: string) => {
    try {
        const exercise: Exercise = await client.fetch(queryExercise, { ref });
        if (!exercise) throw new Error("Exercise not found");
        return { exercise, status: 200 };
    } catch (error: any) {
        return { error: "Something went wrong, please contact us.", status: 500 };
    }
};
