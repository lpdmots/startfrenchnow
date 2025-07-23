import { EVENT_TYPES } from "@/app/lib/constantes";
import { Base } from "../stories/adventure";
import { Reference } from "./blog";

export interface SignupFormData {
    email: string;
    password1: string;
    password2: string;
    name: string;
}

export interface UserProps extends Base {
    email: string;
    password: string;
    isActive: boolean;
    name: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isPremium: boolean;
    activateToken: string;
    tokenExpiration: string;
    resetPasswordToken: string;
    resetPasswordExpiration: string;
    oAuth?: string;
    stories: UserStory[] | undefined;
    lessons?: Lesson[];
    alias?: string[];
    learningProgress?: Progress[];
}

export interface Progress {
    _key: string;
    type: string;
    logs: Log[];
}

export interface Log {
    _key: string;
    exam: Reference;
    score: number;
    date: string;
}

export interface UserStory {
    story: Reference;
    lastGameDate: number;
    feedback: "done" | "no" | "open";
    gamesStarted: number;
    games: number;
    scores: UserScore[];
    success: string[];
}

export interface UserScore {
    title: string;
    bestScore: number;
    lowestScore: number;
}

export interface Lesson {
    eventType: keyof typeof EVENT_TYPES;
    totalPurchasedMinutes: number;
}
