import type { PortableText, TaskType } from "./mock-exam";
import type { Image } from "../sfn/blog";

export type RunnerTaskMediaBlock = {
    text?: PortableText;
    videoUrl?: string;
    image?: Image;
    layout?: "vertical" | "horizontal";
};

export type RunnerActivity = {
    _key: string;
    image?: Image;
    audioUrl?: string;
    promptText?: PortableText;
    aiContext?: string;
    maxPoints: number;
};

export type RunnerTask = {
    _id: string;
    taskType: TaskType;
    introBlocks: RunnerTaskMediaBlock[];
    aiTaskContext?: string;
    activities: RunnerActivity[];
    correctionBlocks: RunnerTaskMediaBlock[];
};

