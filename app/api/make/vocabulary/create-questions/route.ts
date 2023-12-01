import { NextRequest, NextResponse } from "next/server";
import { DataTypes, VocabularyDataTypes } from "../types";
import clientOpenai from "@/app/lib/openAi.client";
import { SYSTEMCONTENT, SYSTEMQUESTIONSONLY, userPrompt, userPromptQuestionsJson } from "./prompts";
import { extractAndParseJson } from "@/app/lib/utils";
import { Question } from "@/app/types/sfn/blog";
import { Format } from "./types";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    const { theme, vocabulary }: DataTypes = await request.json();
    const vocabularyData = getVocabularyData(theme, vocabulary);
    const wordsToLearn = vocabularyData.lines.map((line: any) => `${line.french} (${line.english})`).join(", ");
    /* const exerciseGroups = [
        ["true-false", "buttons", "checkbox", "select"],
        ["link", "order", "sound", "input"],
        ["input", "select"],
    ]; */
    const exerciseGroups = [["link", "select"]];

    try {
        let questions: Question[] = [];
        for (let i = 0; i < exerciseGroups.length; i++) {
            const exerciseGroup = exerciseGroups[i];
            for (let j = 0; j < exerciseGroup.length; j++) {
                const exerciseType = exerciseGroup[j] as keyof Format;
                const newQuestions = await getQuestions(exerciseType, theme, wordsToLearn);
                questions.push(...newQuestions);
            }
        }
        return NextResponse.json({ questions }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

const getVocabularyData = (theme: string, vocabulary: string) => {
    const vocaJson = JSON.parse(vocabulary);
    return {
        theme: theme,
        lines: vocaJson,
    } as VocabularyDataTypes;
};

const getQuestions = async (exerciseType: keyof Format, theme: string, words: string) => {
    let a = 0;
    let questions: Question[] = [];

    while (a < 5) {
        const questionsOnly = await getQuestionsOnly(theme, exerciseType, words);
        const newQuestions = await getQuestionsJson(exerciseType, theme, words, questionsOnly);

        if (questions) {
            questions.push(...(newQuestions || []));
            a = 10;
        } else {
            a++;
        }
    }
    return questions || [];
};

const getQuestionsOnly = async (theme: string, exerciseType: keyof Format, words: string) => {
    const chatCompletion = await clientOpenai.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEMQUESTIONSONLY },
            { role: "user", content: userPrompt(theme, words, exerciseType) },
        ],
        model: "gpt-3.5-turbo",
    });
    console.log(chatCompletion.choices[0]?.message?.content);
    return chatCompletion.choices[0]?.message?.content;
};

const getQuestionsJson = async (exerciseType: keyof Format, theme: string, words: string, questionsOnly: string | null) => {
    const chatCompletion = await clientOpenai.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEMCONTENT },
            { role: "user", content: userPromptQuestionsJson(theme, exerciseType, questionsOnly || "") },
        ],
        model: "gpt-3.5-turbo",
    });
    const questions = extractAndParseJson(chatCompletion.choices[0]?.message?.content || "");
    console.log(questions);
    return questions as Question[] | null;
};
