import { ElementDataProps } from "../types/stories/state";

export const LEVELDATA = {
    a1: { label: "A1", color: "var(--secondary-5)" },
    a2: { label: "A2", color: "var(--secondary-1)" },
    b1: { label: "B1", color: "var(--secondary-6)" },
    b2: { label: "B2", color: "var(--secondary-4)" },
    c1: { label: "C1", color: "var(--secondary-4)" },
    c2: { label: "C2", color: "var(--secondary-4)" },
};
export const COLORS = ["yellow", "blue", "red", "purple", "green"];

export const COLORVARIABLES = {
    yellow: "var(--primary)",
    blue: "var(--secondary-2)",
    red: "var(--secondary-4)",
    purple: "var(--secondary-3)",
    green: "var(--secondary-5)",
};

export const COLORVARIABLESSHADES = {
    yellow: "var(--primaryShades)",
    blue: "var(--secondaryShades-2)",
    red: "var(--secondaryShades-4)",
    purple: "var(--secondaryShades-3)",
    green: "var(--secondaryShades-5)",
};

export const HEADINGSPANCOLORS = {
    //"tips", "vocabulary", "grammar", "fide", "culture", "expressions"
    tips: "heading-span-secondary-1",
    vocabulary: "heading-span-secondary-2",
    grammar: "heading-span-secondary-4",
    fide: "heading-span-secondary-6",
    pack_fide: "heading-span-secondary-6",
    culture: "heading-span-secondary-5",
    expressions: "heading-span-secondary-3",
};

export const HIGHLIGHTCOLORS = {
    tips: "hightlightYellow",
    vocabulary: "hightlightBlue",
    grammar: "hightlightRed",
    fide: "hightlightOrange",
    culture: "hightlightGreen",
    expressions: "hightlightPurple",
    pack_fide: "hightlightOrange",
};

export const CATEGORIESCOLORS = {
    tips: "var(--secondary-1)",
    vocabulary: "var(--secondary-2)",
    grammar: "var(--secondary-4)",
    fide: "var(--secondary-6)",
    culture: "var(--secondary-5)",
    expressions: "var(--secondary-3)",
    pack_fide: "var(--secondary-6)",
};

export const CATEGORIESTEXTCOLORS = {
    tips: "text-secondary-1",
    vocabulary: "text-secondary-2",
    grammar: "text-secondary-4",
    fide: "text-secondary-6",
    culture: "text-secondary-5",
    expressions: "text-secondary-3",
    pack_fide: "text-secondary-6",
};

export const CATEGORIESCOLORSSHADES = {
    tips: "var(--primaryShades)",
    vocabulary: "var(--secondaryShades-2)",
    grammar: "var(--secondaryShades-4)",
    expressions: "var(--secondaryShades-3)",
    culture: "var(--secondaryShades-5)",
    fide: "var(--secondaryShades-6)",
    pack_fide: "var(--secondaryShades-6)",
};

export const STORYCATEGORIES = {
    fantasy: "Fantasy",
    scienceFiction: "Science Fiction",
    historical: "Historique",
    adventure: "Aventure",
    culture: "Culture française",
    comedy: "Comédie",
    investigation: "Enquête",
    other: "Autre",
};

export const NUMBEROFBUTTONS_MOBILE = 3;
export const NUMBEROFBUTTONS_DESKTOP = 6;

export const ADVENTUREID = "9d9e0112-482c-4a8b-a9a8-c5f70b99d2ce";

export const ELEMENTDATA: ElementDataProps = { elementId: null, variablesToUpdate: {}, layouts: [], heros: {}, countIds: [], access: {}, step: null, inheritedChoices: [], informations: [] };

export const getTokenExpiration = () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(); // 3 days

export const langData = {
    en: {
        abreviation: "EN",
        image: "/images/royaume-uni.png",
        alt: "United Kingdom",
    },
    fr: {
        abreviation: "FR",
        image: "/images/france.png",
        alt: "France",
    },
};

export const BLOGCATEGORIES = ["tips", "vocabulary", "grammar", "culture", "expressions", "fide"];
export const CATEGORIES = [...BLOGCATEGORIES, "pack_fide"];

export const RESPONSESLAYOUTS = ["true-false", "buttons", "checkbox", "select", "input", "imgMap", "link", "order"];
export const EXERCISETYPES = ["true-false", "buttons", "checkbox", "select", "input", "image", "sound", "imgMap", "link", "order"];
export const AUTOMATEDQUESTIONS = ["translateFrToEn"];

export const STARTLAYOUTIMAGE = {
    "true-false": "/images/true-false-start-layout.png",
    buttons: "/images/buttons-start-layout.png",
    checkbox: "/images/checkbox-start-layout.png",
    select: "/images/select-start-layout.png",
    input: "/images/input-start-layout.png",
    image: "/images/image-start-layout.png",
    sound: "/images/sound-start-layout.png",
    imgMap: "/images/imgMap-start-layout.png",
    link: "/images/link-start-layout.png",
    order: "/images/learning.png",
};

export const natures = {
    nounM: {
        french: "Nom masculin",
        english: "Masculine noun",
    },
    nounF: {
        french: "Nom féminin",
        english: "Feminine noun",
    },
    verb: {
        french: "Verbe",
        english: "Verb",
    },
    adjective: {
        french: "Adjectif",
        english: "Adjective",
    },
    adverb: {
        french: "Adverbe",
        english: "Adverb",
    },
    pronoun: {
        french: "Pronom",
        english: "Pronoun",
    },
    preposition: {
        french: "Préposition",
        english: "Preposition",
    },
    conjunction: {
        french: "Conjonction",
        english: "Conjunction",
    },
    interjection: {
        french: "Interjection",
        english: "Interjection",
    },
    article: {
        french: "Article",
        english: "Article",
    },
};

export const NUMBER_OF_POSTS_TO_FETCH = 10;

export const CATEGORY_NAMES = {
    en: {
        tips: "Tip",
        grammar: "Grammar",
        vocabulary: "Vocabulary",
        culture: "Culture",
        expressions: "Expression",
        fide: "Fide",
    },
    fr: {
        tips: "Conseil",
        grammar: "Grammaire",
        vocabulary: "Vocabulaire",
        culture: "Culture",
        expressions: "Expression",
        fide: "Fide",
    },
};

export const SLUG_TO_EVENT_TYPE = {
    "fide-preparation-class": "Fide Preparation Class",
    "your-fide-plan": "Your FIDE Plan",
};

export const EVENT_TYPES = {
    "Fide Preparation Class": { uri: "https://api.calendly.com/event_types/785711d3-abf7-45f8-be99-0539335b613d", url: "https://calendly.com/yohann-startfrenchnow/fide-preparation-class" },
    "Your FIDE Plan": { uri: "https://api.calendly.com/event_types/edc90d62-ffea-4815-96de-d0b537f2da11", url: "https://calendly.com/yohann-startfrenchnow/15min" },
};

export const HOURS_BEFOR_CANCEL = 24;

export const LESSONS = [...Object.keys(EVENT_TYPES)];
export const CREDITS = [];
export const PERMISSIONS = ["pack_fide"];
export const LESSONS_CREDITS_PERMISSIONS = [...LESSONS, ...CREDITS, ...PERMISSIONS];
