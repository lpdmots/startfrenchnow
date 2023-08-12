import { Block, Image, Reference } from "../sfn/blog";
import { Base } from "./adventure";
import { Effect, ModifierWithRef, Validation } from "./effect";

export interface ElementProps extends Base {
    adventure: string;
    code: string;
    validation: Validation;
    name: string;
    label?: Block[];
    nature: "interaction" | "access";
    rolls: Roll[] | null;
    image: Image;
    extracts: Extract[];
    effects: Effect[] | null;
    choices: Choice[];
    effectOptions: {
        limit: number;
        pickRule: "random" | "start" | "end";
        distribution: number[];
    };
    choiceOptions: {
        interaction: boolean;
        access: boolean;
        inherit: Reference;
    };
    duration?: string;
    reviews?: Review[];
}

export interface Roll {
    attribute: string;
    difficulty: number;
    reference: string;
    variables: string[];
}

export interface Extract extends Base {
    adventure: string;
    validation: Validation;
    image: Image;
    textOnly: boolean;
    content: Block[];
    code: string;
    antagonistes: Reference[];
    timer: {
        duration: number;
        defaultChoice: string;
    };
    title: string;
}

export interface Choice extends Base {
    adventure: string;
    element?: ElementForChoice;
    validation: Validation;
    nature?: "interaction" | "access";
    label?: Block[];
    antagonistes: Reference[];
    extracts?: Extract[];
    effects?: Effect[];
    duration?: string;
    disableNotValid?: boolean;
    disabled?: boolean;
}

export interface ElementForChoice extends Base {
    _id: string;
    nature: string;
    name: string;
    label?: Block[];
    code: string;
    validation: Validation;
    duration?: string;
}

export interface Review {
    title: string;
    order: number;
    color: string;
    scores?: ScoreProps[];
    success?: Success[];
    defaultFilter: "noFilterButton" | "noFilter" | "unlocked";
    orderOption: string;
}

export interface ScoreProps {
    variable: Reference;
    reference: string;
    title: string;
    text: Block[];
    min: number;
    max: number;
    order: number;
    color: string;
    value?: number;
}

export interface Success extends Base {
    title: string;
    text: Block[];
    image: Image;
    order: number;
    alignment: "veryBad" | "bad" | "neutral" | "good" | "veryGood";
    validation: Validation;
    antagonistes: Reference[];
    showLocked: Boolean;
    antagDisplayIfValid: Boolean;
    unlocked?: boolean;
}
