import { Block, Image, Reference, Slug } from "../sfn/blog";
import { Effect, Condition } from "./effect";

export type Base = {
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

export interface Adventure extends Base {
    name: string;
    slug: Slug;
    level: "a1" | "a2" | "b1" | "b2";
    category: "fantasy" | "scienceFiction" | "historical" | "adventure" | "culture" | "comedy" | "investigation" | "other";
    duration: number;
    description: string;
    selectContent: Block[];
    images: AdventureImages;
    variables: Variable[];
    starter: Effect[];
    gameSystem: GameSystem;
    heros: HeroAdventure[];
    isReady: boolean;
    publishedAt: string;
    firstChapter: Reference;
}

export interface AdventureImages {
    primary: Image;
    icon: Image;
    secondary: Image[];
}

export interface GameSystem {
    name: string;
    attributes: string[];
    die: number;
    DefaultDifficulty: number;
}

export interface HeroAdventure {
    name: string;
    sex: "male" | "female";
    statistics: {
        [key: string]: string | number;
    }[];
    description: string;
    images: HeroImages;
    variables: Variable[];
}

interface HerosStats {
    [key: string]: { value: number; modificateur: number };
}

interface HerosBase {
    _key: string;
    name: string;
    sex: "male" | "female";
    description: string;
    images: HeroImages;
}

export type Heros = HerosBase & HerosStats;

export interface HeroImages {
    default: Image;
    happy?: Image;
    sad?: Image;
    angry?: Image;
    scared?: Image;
}

export interface Variable extends Base {
    name: string;
    nature: "static" | "skill" | "object" | "dynamic";
    defaultValue: string;
    minimum?: number;
    maximum?: number;
    onMountEffects: Effect[];
    unMountEffects: Effect[];
    display: DisplayVariable;
}

export interface DisplayVariable {
    name: string;
    image: Image;
    order: number;
    description: string;
    conditions: Condition[];
}

export interface VariableState {
    data: Variable;
    value: string;
}
