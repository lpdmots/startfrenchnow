type Base = {
    _createdAt: string;
    _id: string;
    _rev: string;
    _type: string;
    _updatedAt: string;
};

type Level = "none" | "a1" | "a2" | "b1" | "b2";

export interface Post extends Base {
    langage: "both" | "en" | "fr";
    author: Author;
    body: Block[];
    body_en: Block[];
    categorie: Category;
    mainImage: Image;
    mainVideo: VideoBlog;
    slug: Slug;
    title: string;
    title_en: string;
    description: string;
    description_en: string;
    metaDescription: string;
    metaDescription_en: string;
    level: Level;
    translation: boolean;
    publishedAt: string;
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
    color: ColorsTypes;
    title: string;
    title_en: string;
    instruction: Block[];
    instruction_en: Block[];
    vocabulary: Reference;
}

export interface Vocabulary extends Base {
    theme: string;
    lines: Line[];
}

export interface Line {
    french: string;
    english: string;
    sound: string;
    note: string;
}

export type Category = "tip" | "grammar" | "vocabulary" | "culture" | "expression";
export type ResponsesLayouts = "true-false" | "buttons" | "checkbox" | "select" | "input";
export type ExerciseTypes = "true-false" | "buttons" | "checkbox" | "select" | "input" | "image" | "sound";
export type ColorsTypes = "yellow" | "blue" | "red" | "purple" | "green";

export interface SimpleExercise {
    _key: string;
    name: string;
    color: ColorsTypes;
    title: string;
    title_en: string;
    instruction: Block[];
    instruction_en: Block[];
    time: number;
    ready: boolean;
    themes: Reference[];
    exerciseTypes: ExerciseTypes[];
    nbOfQuestions: number;
}

export interface ExerciseTheme {
    name: string;
    categories: Category[];
    level: Level;
    children: Reference[] | undefined;
    questions: SimpleQuestion[] | undefined;
}

export interface SimpleQuestion {
    exerciseTypes: ExerciseTypes[];
    defaultLayout: ResponsesLayouts | undefined;
    prompt: {
        text: string;
        images: Image[];
        sounds: string[];
    };
    responses: {
        text: string;
        isCorrect: string | undefined;
        image: Image;
        onlyTypes: ExerciseTypes[];
        sound: string;
    }[];
}
