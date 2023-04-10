import { Reference } from "../sfn/blog";
import { Base, Variable } from "./adventure";
import { Choice, ElementForChoice, ElementProps, Extract } from "./element";

export type Operator = "isNotNull" | "isNull" | "=" | "!=" | ">" | "<" | ">=" | "<=";
export type AllowedComponents = Extract | ElementForChoice | Choice | Effect;

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
}

export interface Condition {
    nature: "variable" | "roll" | "heros" | "count" | "step";
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
    algorithm: "string";
}

export interface ModifierWithRef {
    variables: Reference[] | null;
    references: string[];
    operator: "addition" | "replace" | "multiplication" | "access" | "step";
    access: Reference[];
    arguments: string;
    code: string;
}

export interface Modifier {
    variables: Variable[] | null;
    references: string[];
    operator: "addition" | "replace" | "multiplication" | "access" | "step";
    access: Reference[];
    arguments: string;
    code: string;
}
