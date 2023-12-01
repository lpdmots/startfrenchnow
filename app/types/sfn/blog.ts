type Base = {
    _createdAt: string;
    _id: string;
    _rev: string;
    _type: string;
    _updatedAt: string;
};

type Level = "a1" | "a2" | "b1" | "b2" | "c1" | "c2";

export interface Post extends Base {
    langage: "both" | "en" | "fr";
    author: Author;
    body: Block[];
    body_en: Block[];
    categories: Category[];
    mainImage: Image;
    mainVideo: VideoBlog;
    slug: Slug;
    title: string;
    title_en: string;
    description: string;
    description_en: string;
    metaDescription: string;
    metaDescription_en: string;
    level: Level[];
    help: boolean;
    publishedAt: string;
    externLinks: { url: string; title: string }[];
    internLink: string;
}

export interface Author extends Base {
    bio: Block[];
    image: Image;
    name: string;
    slug: Slug;
}

export interface Image {
    _type: "image";
    asset: Reference;
}

export interface Reference {
    _ref: string;
    _type: "reference" | string;
}

export interface Slug {
    _type: "slug";
    current: string;
}

export interface Block {
    _key: string;
    _type: "block";
    children: Span[];
    markDefs: any[];
    style: "normal" | "h1" | "h2" | "h3" | "h4" | "blockquote";
}

interface Span {
    _key: string;
    _type: "span";
    marks: string[];
    text: string;
}

export interface MainImage {
    _type: "image";
    asset: Reference;
}

export interface Title {
    _type: "string";
    current: string;
}

export interface VideoBlog {
    _type: "videoBlog";
    title: string;
    url: string;
}

export interface FlashcardsProps {
    category: PrimaryCategory;
    title: string;
    title_en: string;
    instruction: Block[];
    instruction_en: Block[];
    themes: Reference[];
}

export interface Theme extends Base {
    name: string;
    translationOnly: boolean;
    image: Image;
    category: PrimaryCategory;
    level: string;
    children: Reference[];
    vocabItems: Reference[];
    questions: Question[];
}

export interface ThemeWithVocab extends Base {
    name: string;
    translationOnly: boolean;
    image: Image;
    category: PrimaryCategory;
    level: string;
    children: Reference[];
    vocabItems: VocabItem[];
    questions: Question[];
}

export interface VocabItem extends Base {
    french: string;
    english: string;
    soundFr: string;
    soundEn: string;
    note: string;
    example: string;
    nature: string;
    translationOnly: boolean;
    exerciseData: string;
}

export type Category = "tips" | "video" | "grammar" | "vocabulary" | "culture" | "expressions" | "orthography" | "exercise" | "toLoad";
export type PrimaryCategory = "tips" | "grammar" | "vocabulary" | "culture" | "expressions" | "orthography";
export type ResponsesLayouts = "true-false" | "buttons" | "checkbox" | "select" | "input" | "imgMap" | "link" | "order";
export type ExerciseTypes = "true-false" | "buttons" | "checkbox" | "select" | "input" | "image" | "sound" | "imgMap" | "link" | "order";
export type ColorsTypes = "yellow" | "blue" | "red" | "purple" | "green";

export interface Exercise extends Base {
    _key: string;
    name: string;
    category: PrimaryCategory;
    title: string;
    title_en: string;
    instruction: Block[];
    instruction_en: Block[];
    time: number;
    ready: boolean;
    themes: Reference[];
    exerciseTypes: ExerciseTypes[];
    nbOfQuestions: number;
    questions: Question[];
}

export interface Question {
    _key: string;
    exerciseTypes: ExerciseTypes[];
    defaultLayout: ResponsesLayouts | undefined;
    prompt: {
        text: string;
        images: Image[];
        sounds: string[];
    };
    options: {
        responsesMonitoring?: "all" | "oneByOne" | "hidde";
        scoreCalculation?: number;
    };
    responses: Response[];
}

export interface Response {
    _key: string;
    text: string;
    isCorrect: string | undefined;
    image: Image;
    onlyTypes: ExerciseTypes[];
    sound: string;
}
