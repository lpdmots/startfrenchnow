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
    _key?: string;
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
    filters: TabelVocFilters;
    themes: Reference[];
    options: {
        shuffle: boolean;
        swapFaces: boolean;
        withSound: boolean;
    };
}

export interface Theme extends Base {
    name: string;
    image: Image;
    category: PrimaryCategory;
    level: string;
    children: Reference[];
    vocabItems: Reference[];
    questions: Question[];
}

export interface ThemeWithVocab extends Base {
    name: string;
    image: Image;
    category: PrimaryCategory;
    level: string;
    children: Reference[];
    vocabItems: VocabItem[];
    questions: Question[];
}

export interface VocabItem extends Base {
    french: string;
    alternatives?: string[];
    english: string;
    relatedThemes: Reference[];
    soundFr: string;
    soundEn: string;
    noteFr?: Block[];
    noteEn?: Block[];
    example: string;
    soundExample?: string;
    nature: string;
    tags: string[];
    status: "primary" | "secondary" | "translationOnly";
    image?: Image;
    exerciseData?: {
        chooseCorrectSpelling?: string[];
        riddle?: string;
        inputAnswers?: string[];
    };
}

export interface VocabItemNew extends VocabItem {
    instruction: "new" | "keep" | "update" | undefined; // undefined ou new --> on créera un nouveau vocabItem, keep --> on prendra le vocabItem existant, update --> on mettra à jour le vocabItem existant
}

export type Category = "tips" | "video" | "grammar" | "vocabulary" | "culture" | "expressions" | "exercise" | "toLoad" | "fide";
export type PrimaryCategory = "tips" | "grammar" | "vocabulary" | "culture" | "expressions" | "fide";
export type ResponsesLayouts = "true-false" | "buttons" | "checkbox" | "select" | "input" | "imgMap" | "link" | "order";
export type ExerciseType = "true-false" | "buttons" | "checkbox" | "select" | "input" | "image" | "sound" | "imgMap" | "link" | "order";
export type ColorsTypes = "yellow" | "blue" | "red" | "purple" | "green";
export type AutomatedType =
    | "levelChoice"
    | "translateFrToEn"
    | "translateEnToFr"
    | "translateEnToFrInput"
    | "translateSoundToFrInput"
    | "soundFrToEn"
    | "enToSoundFr"
    | "soundFrToFr"
    | "chooseCorrectSpelling"
    | "pairedWords"
    | "orderWords"
    | "orderWordsEasy"
    | "riddleButtons"
    | "riddleInput"
    | "imageButtons"
    | "imageInput";
export type LevelChoice = "level1" | "level2" | "level3";
export type QuestionPriority = "automated" | "manual" | "mixed";
export interface TabelVocFilters {
    status: "all" | "primary" | "secondary";
    nature: "all" | "words" | "expressions";
    tags: string[];
}

export interface Exercise extends Base {
    _key: string;
    name: string;
    category: PrimaryCategory;
    title: string;
    title_en: string;
    instruction: Block[];
    instruction_en: Block[];
    filters: TabelVocFilters;
    time: number;
    ready: boolean;
    themes: Reference[];
    automatedTypes: AutomatedType[];
    questionsPriority: QuestionPriority;
    exerciseTypes?: ExerciseType[];
    nbOfQuestions: number;
    questions: Question[];
}

export interface Question {
    _key: string;
    exerciseTypes: ExerciseType[];
    defaultLayout?: ResponsesLayouts;
    prompt: {
        text?: string;
        images?: Image[];
        sounds?: string[];
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
    isCorrect?: string | undefined;
    image?: Image;
    onlyTypes?: ExerciseType[];
    sound?: string;
}

export interface TabelVocProps {
    data: {
        filters: TabelVocFilters;
        tags?: string[];
        category: PrimaryCategory;
        themes: Reference[];
        isArticle?: boolean;
        isOnlyFrench?: boolean;
    };
}
