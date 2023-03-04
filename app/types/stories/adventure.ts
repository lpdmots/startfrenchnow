import { Slug } from "../sfn/blog";

type Base = {
    _createdAt: string;
    _id: string;
    _rev: string;
    _type: string;
    _updatedAt: string;
};

export interface StoryCard extends Base {
    name: string;
    slug: Slug;
    level: "a1" | "a2" | "b1" | "b2";
    category: "fantasy" | "scienceFiction" | "historical" | "adventure" | "culture" | "comedy" | "investigation" | "other";
    duration: number;
    description: string;
    images: AdventureImages;
    isReady: boolean;
    publishedAt: string;
}

export interface AdventureImages {
    primary: string;
    secondary: string[];
}

export interface GameSystem {
    name: string;
    attributes: string[];
    die: number;
    DefaultDifficulty: number;
}
