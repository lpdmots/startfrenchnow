import { ElementForChoice, ElementProps, Extract } from "@/app/types/stories/element";
import { Choice } from "@/app/types/stories/element";
import { useStoryStore } from "@/app/stores/storiesStore";
import { rangeFromString, sortByCode } from "@/app/lib/utils";
import { AllowedComponents, Condition, Effect, Validation } from "@/app/types/stories/effect";
import fetchData from "@/app/lib/apiStories";
import { ElementDataProps, VariablesToUpdateProps } from "@/app/types/stories/state";
import { Heros } from "@/app/types/stories/adventure";

export const useValidation = () => {
    const { access, count, variables, heros, actualElementId } = useStoryStore();

    const validation = async <T extends AllowedComponents[]>(componentType: string, storyComponents: T, elementData: ElementDataProps): Promise<T> => {
        const validatedComponents = [];
        let queue = [...storyComponents];
        let processedComponents = new Set();

        while (queue.length > 0) {
            const component = queue.shift();
            if (!component || processedComponents.has(component)) {
                continue;
            }

            // Mark component as processed to avoid infinite loop
            processedComponents.add(component);

            // check access
            const isAccessible = checkAccess(component, elementData);

            // check count
            const isCountValid = checkCount(component, count);

            // check conditions
            const areConditionsValid = checkConditions(component, elementData);

            // if not valid, add antagonists to the list
            if (!isAccessible || !isCountValid || !areConditionsValid) {
                const antagonists = await getAntagonistes(componentType, component);
                if (antagonists.length) {
                    // Add antagonists to the beginning of the queue
                    queue = [...antagonists, ...queue];

                    // Reorder the remaining components in the queue
                    queue = sortByCode(queue);
                } else if ("disableNotValid" in component && component.disableNotValid) {
                    validatedComponents.push({ ...component, disabled: true });
                }
                continue;
            }

            validatedComponents.push(component);
        }

        return validatedComponents as T;
    };

    const comonValidation = async <T extends (Extract | Effect | ElementProps)[]>(componentType: string, components: T, elementData: ElementDataProps): Promise<T> => {
        const sorted = sortByCode(components);

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

                // Check if the choice is disabled:
                if (validChoice.disabled) {
                    validatedChoices.push(validChoice);
                    continue;
                }

                // Check if there is a valid element
                const elementValid = await validation("element", validChoice.element ? [validChoice.element] : [], elementData);
                const element = elementValid.length > 0 ? elementValid[0] : undefined;

                // if the element is not valid, check if there are free extracts
                if (!element && !validChoice?.extracts?.length) {
                    //console.warn(`Le choix ${validChoice?.label || validChoice._id} n'a ni élément valide, ni extraits libres`);
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

    const checkConditions = (component: AllowedComponents | { validation: { conditions: Condition[]; operator: string } }, elementData: ElementDataProps) => {
        const { validation } = component;
        const { conditions } = validation || {};
        const operator = validation?.operator || "and";
        if (!conditions) return true;

        let NumberOfvalidated = 0;
        for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];

            switch (condition.nature) {
                case "variable":
                    variableCondition(condition, variables, elementData) && NumberOfvalidated++;
                    break;
                case "roll":
                    NumberOfvalidated++;
                    break;
                case "hero":
                    herosCondition(condition, heros as Heros, elementData) && NumberOfvalidated++;
                    break;
                case "count":
                    countCondition(condition, count, elementData, actualElementId) && NumberOfvalidated++;
                    break;
                case "step":
                    NumberOfvalidated++;
                    break;
                case "eval":
                    evalCondition(condition.arguments, elementData) && NumberOfvalidated++;
                    break;
                default:
                    NumberOfvalidated++;
            }
        }

        return operator === "and" ? NumberOfvalidated === conditions.length : NumberOfvalidated > 0;
    };

    const evalCondition = (args: string, elementData: ElementDataProps) => {
        const regex = /\$\{(.*?)\}/g;

        try {
            const expression = args.replace(regex, (_: string, key: string) => {
                const value = elementData.variablesToUpdate[key]?.value || elementData.heros[key] || variables[key]?.value || heros?.[key];
                return value !== undefined ? value.toString() : "0";
            });
            return !!eval(expression);
        } catch (error) {
            console.error("Error in evalCondition:", error);
            return false;
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
    const comparisonFunctions = {
        isNotNull: () => !!(variableData && value && value !== "0"),
        isNull: () => !variableData || !value,
        compare: () => compareValues(args, value),
    };

    const comparisonFunction = comparisonFunctions[operator];
    return comparisonFunction ? comparisonFunction() : true;
};

const countCondition = (condition: Condition, count: { [index: string]: number }, elementData: ElementDataProps, actualElementId: string) => {
    const { component: componentToCheck, arguments: args } = condition;
    const searchKey = componentToCheck ? componentToCheck._ref : actualElementId;
    const actualCount = count[searchKey] || 0;

    return compareIntValues(args, actualCount);
};

const herosCondition = (condition: Condition, heros: Heros, elementData: ElementDataProps) => {
    const { reference, arguments: args } = condition;
    const herosValue = elementData.heros[reference] || heros[reference];
    if (!herosValue) {
        console.warn(`Heros ${reference} not found`);
        return false;
    }

    return compareValues(args, herosValue as number | string);
};

const compareValues = (args: string, valueToCompare: string | number) => {
    const valueToCompareInt = typeof valueToCompare == "number" ? valueToCompare : parseInt(valueToCompare);
    if (isNaN(valueToCompareInt)) return compareStrValues(args, valueToCompare as string);
    return compareIntValues(args, valueToCompareInt);
};

const compareIntValues = (args: string, valueToCompare: number) => {
    const countStr = args || "";
    const countStrList = countStr.split(",").map((c) => c.trim());
    let countList: number[] = [];

    for (const countStr of countStrList) {
        if (countStr.includes("+")) {
            const isEgalOrMore = parseInt(countStr.replace("+", "")) <= valueToCompare;
            if (isEgalOrMore) return true;
        } else if (countStr.includes("-")) {
            const isEgalOrLess = parseInt(countStr.replace("-", "")) >= valueToCompare;
            if (isEgalOrLess) return true;
        } else if (countStr.includes("/")) {
            countList = countList.concat(rangeFromString(countStr));
            if (countList.includes(valueToCompare)) return true;
        } else {
            const isEgal = parseInt(countStr) === valueToCompare;
            if (isEgal) return true;
        }
    }
    return false;
};

const compareStrValues = (args: string, valueToCompareStr: string) => {
    const argsStr = args || "";
    const argsStrWithOptions = argsStr.split("|").map((c) => c.trim());
    const argsStrList = argsStrWithOptions.length ? argsStrWithOptions[0].split(",").map((c) => c.trim()) : [];
    const count = argsStrWithOptions.length > 1 ? parseInt(argsStrWithOptions[1]) : 1;
    const asList = argsStrWithOptions.length > 2 ? Boolean(argsStrWithOptions[2]) : false;
    const opposite = argsStrWithOptions.length > 3 ? Boolean(argsStrWithOptions[3]) : false;
    let numberOfValidated: number = 0;
    const valueToCompare = asList ? valueToCompareStr.split("|").map((c) => c.trim()) : valueToCompareStr;
    for (const argStr of argsStrList) {
        valueToCompare.includes(argStr) && numberOfValidated++;
    }
    return opposite ? !(numberOfValidated >= count) : numberOfValidated >= count;
};
