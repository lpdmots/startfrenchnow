import { ElementDataProps } from "../types/stories/state";

export const LEVELDATA = {
    a1: { label: "A1", color: "var(--secondary-5)" },
    a2: { label: "A2", color: "var(--secondary-5)" },
    b1: { label: "B1", color: "var(--secondary-1)" },
    b2: { label: "B2", color: "var(--secondary-6)" },
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
    //"tips", "vocabulary", "grammar", "orthography", "culture", "expressions"
    tips: "heading-span-secondary-1",
    vocabulary: "heading-span-secondary-2",
    grammar: "heading-span-secondary-4",
    orthography: "heading-span-secondary-6",
    culture: "heading-span-secondary-5",
    expressions: "heading-span-secondary-3",
    video: "heading-span-secondary-1",
    toLoad: "heading-span-secondary-1",
    exercise: "heading-span-secondary-1",
};

export const HIGHLIGHTCOLORS = {
    tips: "hightlightYellow",
    vocabulary: "hightlightBlue",
    grammar: "hightlightRed",
    orthography: "hightlightOrange",
    culture: "hightlightGreen",
    expressions: "hightlightPurple",
};

export const CATEGORIESCOLORS = {
    tips: "var(--secondary-1)",
    vocabulary: "var(--secondary-2)",
    grammar: "var(--secondary-4)",
    orthography: "var(--secondary-6)",
    culture: "var(--secondary-5)",
    expressions: "var(--secondary-3)",
};

export const CATEGORIESCOLORSSHADES = {
    tips: "var(--primaryShades)",
    vocabulary: "var(--secondaryShades-2)",
    grammar: "var(--secondaryShades-4)",
    expressions: "var(--secondaryShades-3)",
    culture: "var(--secondaryShades-5)",
    orthography: "var(--secondaryShades-6)",
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

export const ADVENTUREID = "18d88b4c-e3ce-4471-a66e-0d1fec1437e1";

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
    es: {
        abreviation: "ES",
        image: "/images/espagne.png",
        alt: "España",
    },
    pt: {
        abreviation: "PT",
        image: "/images/portugal.png",
        alt: "Português",
    },
    tr: {
        abreviation: "TR",
        image: "/images/turquie.png",
        alt: "Türkçe",
    },
};

export const CATEGORIES = ["tips", "vocabulary", "grammar", "orthography", "culture", "expressions"];

export const RESPONSESLAYOUTS = ["true-false", "buttons", "checkbox", "select", "input", "imgMap", "link", "order"];
export const EXERCISETYPES = ["true-false", "buttons", "checkbox", "select", "input", "image", "sound", "imgMap", "link", "order"];
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
