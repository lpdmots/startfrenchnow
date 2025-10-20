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
    permissions?: Permission[];
    alias?: string[];
    learningProgress?: Progress[];
}

export interface Permission {
    referenceKey: string;
    grantedAt: string;
    expiresAt: string;
}

export interface Progress {
    _key: string;
    type: string; // "pack_fide"
    videoLogs?: VideoLog[];
    examLogs?: ExamLog[];
}

export interface VideoLog {
    _key: string;
    post: Reference; // Post (vidéo)
    status: "watched" | "unwatched" | "in-progress";
    lastSeenAt?: string; // ISO
    lastCompletedAt?: string; // ISO (quand 'watched' devient vrai)
    updatedAt: string;
    progress: number; // 0..1
    lastMilestone: number; // ex: 0.2, 0.4, ..., 1
}

export interface ExamLog {
    _key: string;
    exam: Reference;
    bestScore: number;
    scores: number[];
    bestScoreAt?: string;
    lastCompletedAt?: string; // ISO (fin de la dernière tentative)
    updatedAt: string;
}

/* 
export interface Log {
    _key: string;
    exam: Reference;
    score: number;
    date: string;
}
*/

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
