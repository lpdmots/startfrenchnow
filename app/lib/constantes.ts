import { ElementDataProps } from "../types/stories/state";

export const LEVELDATA = {
    none: null,
    a1: { label: "A1", color: "var(--secondary-5)" },
    a2: { label: "A2", color: "var(--secondary-1)" },
    b1: { label: "B1", color: "var(--secondary-4)" },
    b2: { label: "B2", color: "var(--secondary-3)" },
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

export const CATEGORIES = ["tip", "grammar", "vocabulary", "culture", "expression"];

export const RESPONSESLAYOUTS = ["true-false", "buttons", "checkbox", "select", "input"];
export const EXERCISETYPES = ["true-false", "buttons", "checkbox", "select", "input", "image", "sound"];
