import { ElementForChoice, Extract } from "@/app/types/stories/element";
import { Choice } from "@/app/types/stories/element";
import { useStoryStore } from "@/app/stores/storiesStore";
import { sortByCode } from "@/app/lib/utils";
import { AllowedComponents, Condition, Effect } from "@/app/types/stories/effect";
import fetchData from "@/app/lib/apiStories";
import { ElementDataProps, VariablesToUpdateProps } from "@/app/types/stories/state";

export const useValidation = () => {
    const { access, count, variables } = useStoryStore();

    const validation = async <T extends AllowedComponents[]>(componentType: string, storyComponents: T, elementData: ElementDataProps): Promise<T> => {
        const validatedComponents = [];
        const queue = [...storyComponents];

        while (queue.length > 0) {
            const component = queue.shift();
            if (!component) continue;

            // check access
            const isAccessible = checkAccess(component, elementData);

            // check count
            const isCountValid = checkCount(component, count);

            // check conditions
            const areConditionsValid = checkConditions(component, elementData);

            // if not valid, add antagonists to the list
            if (!isAccessible || !isCountValid || !areConditionsValid) {
                const antagonists = await getAntagonistes(componentType, component);
                queue.push(...antagonists);
                continue;
            }

            validatedComponents.push(component);
        }

        return validatedComponents as T;
    };

    const comonValidation = async <T extends (Extract | Effect)[]>(componentType: string, component: T, elementData: ElementDataProps): Promise<T> => {
        const sorted = sortByCode(component);

        return (await validation(componentType, sorted, elementData)) as T;
    };

    const choicesValidation = async (choices: Choice[], elementData: ElementDataProps) => {
        const validatedChoices: Choice[] = [];

        for (let i = 0; i < choices.length; i++) {
            const choice = choices[i];

            // check if both the choice and the element are valid
            const validChoices = (await validation("choice", [choice], elementData)) as Choice[];

            // check if elements in validChoices are valid
            for (let j = 0; j < validChoices.length; j++) {
                const validChoice = validChoices[j];
                // Check if there is a valid element
                const elementValid = await validation("element", validChoice.element ? [validChoice.element] : [], elementData);
                const element = elementValid.length > 0 ? elementValid[0] : undefined;

                // if the element is not valid, check if there are free extracts
                if (!element && !validChoice?.extracts?.length) {
                    console.warn(`Le choix ${validChoice?.label || validChoice._id} n'a ni élément valide, ni extraits libres`);
                    continue;
                }

                // if the element is valid, or there are free extracts, add the choice to the list
                validatedChoices.push({ ...validChoice, element });
            }
        }

        return validatedChoices;
    };

    const checkAccess = (component: AllowedComponents, elementData: ElementDataProps) => {
        const initialAccess = component?.validation?.initialAccess !== undefined ? component?.validation?.initialAccess : true;
        const isAccessInElementData = elementData.access[component._id] !== undefined;
        const isAccessInAccess = access[component._id] !== undefined;

        if (!isAccessInElementData && !isAccessInAccess) return initialAccess;
        return isAccessInElementData ? elementData.access[component._id].value : access[component._id].value;
    };

    const checkCount = (component: AllowedComponents, count: { [index: string]: number }) => {
        if (!component.validation || !component.validation.maxCount) return true;

        const counter = count[component._id] || 0;
        if (counter < component.validation.maxCount) return true;
        return false;
    };

    const checkConditions = (component: AllowedComponents | { validation: { conditions: Condition[] } }, elementData: ElementDataProps) => {
        const { validation } = component;
        const { conditions } = validation || {};
        if (!conditions) return true;

        for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];

            switch (condition.nature) {
                case "variable":
                    return variableCondition(condition, variables, elementData);
                case "roll":
                    return true;
                case "heros":
                    return true;
                case "count":
                    return true;
                case "step":
                    return true;
                default:
                    return true;
            }
        }
    };

    return { validation, checkAccess, checkCount, checkConditions, choicesValidation, comonValidation };
};

const getAntagonistes = async (componentType: string, component: any) => {
    const { antagonistes: antagonistesRef } = component;
    if (!antagonistesRef || antagonistesRef.length === 0) return [];

    const antagonistes = [];
    for (let i = 0; i < antagonistesRef.length; i++) {
        const antagonisteRef = antagonistesRef[i];
        if (antagonisteRef._ref === component._id) {
            console.error(`Antagoniste ${componentType} ${component._id} is referencing itself`);
            return [];
        }
        const antagoniste: AllowedComponents = await fetchData(componentType, antagonisteRef._ref);
        if (!antagoniste) {
            console.error(`Antagoniste ${componentType} ${antagonisteRef._ref} not found`);
            return [];
        }
        antagonistes.push(antagoniste);
    }

    return antagonistes;
};

const variableCondition = (condition: Condition, variables: VariablesToUpdateProps, elementData: ElementDataProps) => {
    const { component: componentToCheck, operator, reference, arguments: args } = condition;
    const searchKey = componentToCheck ? componentToCheck._ref : reference;
    const variableData = elementData.variablesToUpdate[searchKey] || variables[searchKey];

    const value = variableData?.value || "";
    const valueToInt = parseInt(value);
    const argsToInt = parseInt(args);

    const comparisonFunctions = {
        isNotNull: () => variableData && value,
        isNull: () => !variableData || !value,
        "=": () => value === args,
        "!=": () => value !== args,
        ">": () => !isNaN(valueToInt) && valueToInt > argsToInt,
        "<": () => !isNaN(valueToInt) && valueToInt < argsToInt,
        ">=": () => !isNaN(valueToInt) && valueToInt >= argsToInt,
        "<=": () => !isNaN(valueToInt) && valueToInt <= argsToInt,
    };

    const comparisonFunction = comparisonFunctions[operator];
    return comparisonFunction ? comparisonFunction() : true;
};
