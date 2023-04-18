import { Block } from "../sfn/blog";
import { VariableState } from "./adventure";
import { Modifier, ModifierWithRef } from "./effect";
import { Choice, Extract } from "./element";

export interface LayoutProps {
    extractId: string;
    fullScreenImage: boolean;
    image?: string;
    title?: string;
    text?: Block[];
    interactionChoices?: ChoiceProps[];
    accessChoices?: ChoiceProps[];
    timer?: { duration: number; defaultChoice: string };
}

export interface ChoiceProps {
    _id: string;
    elementId?: string;
    label?: Block;
    code: string;
    modifiers?: ModifierWithRef[];
    extracts?: Extract[];
}

export interface VariablesToUpdateProps {
    [index: string]: VariableState;
}

export interface AccessState {
    [index: string]: AccessProps;
}

export interface AccessProps {
    value: boolean;
    persistant: boolean;
}

export interface ElementDataProps {
    elementId: string | null;
    variablesToUpdate: VariablesToUpdateProps;
    layouts: LayoutProps[];
    heros: { [index: string]: number };
    countIds: string[];
    access: AccessState;
    step: {
        _id: "step";
        elementId: string;
        label?: Block;
        code: string;
    } | null;
    inheritedChoices: Choice[];
}

export interface ElementsDataProps {
    [index: string]: ElementDataProps;
}
