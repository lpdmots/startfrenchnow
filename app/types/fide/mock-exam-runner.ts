import type { AIVoiceGender, PortableText, TaskType } from "./mock-exam";
import type { Image } from "../sfn/blog";

export type RunnerReadWriteItemType = "instruction" | "single_choice" | "numbered_fill" | "text_extract" | "long_text";

export type RunnerReadWriteAnswerOption = {
    _key?: string;
    label?: string;
    isCorrect?: boolean;
};

export type RunnerReadWriteItem = {
    _key: string;
    itemType?: RunnerReadWriteItemType;
    contentText?: PortableText;
    question?: string;
    image?: Image;
    imageAlternativeText?: PortableText;
    answerOptions?: RunnerReadWriteAnswerOption[];
    aiCorrectionContext?: string;
    maxPoints?: number;
};

export type RunnerActivity = {
    _key: string;
    title?: string;
    image?: Image;
    audioUrl?: string;
    promptText?: PortableText;
    aiContext?: string;
    aiCorrectionContext?: string;
    aiVoiceGender?: AIVoiceGender;
    maxPoints?: number;
    items?: RunnerReadWriteItem[];
};

export type RunnerTask = {
    _id: string;
    title?: string;
    taskType: TaskType;
    supportPdfUrl?: string;
    activities: RunnerActivity[];
};
