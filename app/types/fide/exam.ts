import { Image } from "../sfn/blog";

export interface Exam {
    description: string;
    title: string;
    image: Image;
    level: "A1" | "A2" | "B1";
    _id: string;
    tracks: Track[];
    responses: Response[];
    responsesB1: ResponseB1[];
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
