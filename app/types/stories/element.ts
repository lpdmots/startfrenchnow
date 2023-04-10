import { Block, Image, Reference } from "../sfn/blog";
import { Base } from "./adventure";
import { Effect, Modifier, Validation } from "./effect";

export interface ElementProps extends Base {
    adventure: string;
    code: string;
    validation: Validation;
    name: string;
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
        inherit: string;
    };
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
    label?: string;
    antagonistes: Reference[];
    extracts?: Extract[];
    modifiers?: Modifier[];
}

export interface ElementForChoice extends Base {
    _id: string;
    nature: string;
    name: string;
    code: string;
    validation: Validation;
}
