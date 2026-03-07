import type { AIVoiceGender, PortableText, TaskType } from "./mock-exam";
import type { Image } from "../sfn/blog";

export type RunnerActivity = {
    _key: string;
    image?: Image;
    audioUrl?: string;
    promptText?: PortableText;
    aiContext?: string;
    aiVoiceGender?: AIVoiceGender;
    maxPoints: number;
};

export type RunnerTask = {
    _id: string;
    taskType: TaskType;
    activities: RunnerActivity[];
};
