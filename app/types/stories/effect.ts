import { Reference } from "../sfn/blog";
import { Base, Variable } from "./adventure";
import { Choice, ElementForChoice, Extract, Success } from "./element";

export type Operator = "isNotNull" | "isNull" | "compare";
export type AllowedComponents = Extract | ElementForChoice | Choice | Effect | Success;

export interface Effect extends Base {
    adventure: Reference[];
    name: string;
    validation: Validation;
    modifiers: ModifierWithRef[];
    modifierOptions: {
        limit: number;
        pickRule: "random" | "start" | "end";
        distribution: number[];
    };
    antagonistes: Reference[];
    code: string;
    duration?: string;
    priority?: boolean;
}

export interface Condition {
    nature: "variable" | "roll" | "hero" | "count" | "step" | "eval";
    component: Reference;
    reference: string;
    arguments: string;
    operator: Operator;
    code: string;
}

export interface Validation {
    initialAccess: boolean;
    maxCount: number;
    conditions: Condition[];
    operator: "and" | "or";
}

export interface ModifierWithRef {
    variables: Reference[] | null;
    references: string[];
    operator: "addition" | "replace" | "multiplication" | "access" | "step";
    access: Reference[];
    arguments: string;
    code: string;
    information?: string;
}

export interface Modifier {
    variables: Variable[] | null;
    references: string[];
    operator: "addition" | "replace" | "multiplication" | "access" | "step";
    access: Reference[];
    arguments: string;
    code: string;
    information?: string;
}
