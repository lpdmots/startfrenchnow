import { Block, Image } from "../sfn/blog";

export interface Exam {
    description: string;
    title: string;
    image: Image;
    level: "A1" | "A2" | "B1";
    _id: string;
    tracks: Track[];
    responses: Response[];
    responsesB1: {
        response1: string;
        response2: string;
        response3: string;
    };
}

export type Track = {
    title: string;
    src: string;
    text: string;
};

export type Response = {
    image: Image;
    isCorrect: boolean;
};
