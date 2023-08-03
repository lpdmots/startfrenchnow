import { ElementDataProps } from "../types/stories/state";

export const LEVELDATA = {
    a1: { label: "A1", color: "var(--secondary-5)" },
    a2: { label: "A2", color: "var(--secondary-1)" },
    b1: { label: "B1", color: "var(--secondary-4)" },
    b2: { label: "B2", color: "var(--secondary-3)" },
};

export const COLORVARIABLES = {
    yellow: "var(--primary)",
    blue: "var(--secondary-2)",
    red: "var(--secondary-4)",
    purple: "var(--secondary-3)",
    green: "var(--secondary-5)",
};

export const COLORVARIABLESLIGHT = {
    yellow: "#FFF3CB",
    blue: "#D8EEFF",
    red: "#FFC2CA",
    purple: "#E8E1FB",
    green: "#7FDCA4",
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
