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
    isAdmin: boolean;
    isPremium: boolean;
    activateToken: string;
    tokenExpiration: string;
    resetPasswordToken: string;
    resetPasswordExpiration: string;
    oAuth?: string;
    stories: UserStory[] | undefined;
}

export interface UserStory {
    story: Reference;
    lastGameDate: number;
    feedback: "done" | "no" | "open";
    games: number;
    scores: UserScore[];
    success: string[];
}

export interface UserScore {
    title: string;
    bestScore: number;
    lowestScore: number;
}
