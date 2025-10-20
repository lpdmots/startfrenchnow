import { Image } from "../sfn/blog";

export type ExamLevel = "A1" | "A2" | "B1";

export type ExamCompetence = "Parler" | "Comprendre" | "Lire" | "Écrire";

export interface Exam {
    description: string;
    title: string;
    image: Image;
    level: ExamLevel;
    _id: string;
    competence: ExamCompetence;
    tracks: Track[];
    responses: Response[];
    responsesB1: ResponseB1[];
    isPreview: boolean;
}

export type Track = {
    title: string;
    src: string;
    text: string;
};

export type Response = {
    _key: string;
    image: Image;
    isCorrect: boolean;
};

export type ResponseB1 = {
    _key: string;
    modelAnswer: string;
    correctIf: string;
    partialIf: string;
    incorrectIf: string;
};
