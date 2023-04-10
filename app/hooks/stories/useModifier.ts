import { Variable, VariableState } from "@/app/types/stories/adventure";
import { Effect, Modifier, ModifierWithRef } from "@/app/types/stories/effect";
import { ElementProps } from "@/app/types/stories/element";
import { ElementDataProps, VariablesToUpdateProps } from "@/app/types/stories/state";
import fetchData from "@/lib/apiStories";
import { sortByCode } from "@/lib/utils";
import { useStoryStore } from "@/stores/storiesStore";
import { useValidation } from "./useValidation";
import { useVariable } from "./useVariable";

export const useModifier = () => {
    const { comonValidation } = useValidation();
    const { getOrCreateStaticVariable, getOrCreateDynamiqueVariable } = useVariable();
    const { access } = useStoryStore();

    const effectsTreatment = async (element: ElementProps, elementData: ElementDataProps) => {
        const { effects } = element;
        const validatedEffects = await comonValidation("effect", effects || [], elementData);
        elementData.countIds.push(...validatedEffects.map((effect) => effect._id));

        for (let i = 0; i < validatedEffects.length; i++) {
            const effect = validatedEffects[i];
            await applyModifier(effect, elementData);
        }
    };

    const applyModifier = async (effect: Effect, elementData: ElementDataProps) => {
        const { modifiers: modifiersWithRef } = effect;
        if (!modifiersWithRef || !modifiersWithRef.length) return;

        // Fetch les variables si nécessaire puis sort les modifiers par code
        const modifiers = await getModifiers(modifiersWithRef);

        const sortedModifiers = sortByCode(modifiers);

        sortedModifiers.forEach((modifier) => {
            switch (modifier.operator) {
                case "addition":
                case "replace":
                case "multiplication":
                    applyOperation(modifier.operator, modifier, elementData);
                    break;
                case "access":
                    applyAccess(modifier, elementData);
                    break;
                case "step":
                    applyStep(modifier, elementData);
                    break;
                default:
                    break;
            }
        });
    };

    const applyOperation = (operation: "addition" | "multiplication" | "replace", modifier: Modifier, elementData: ElementDataProps) => {
        const args = modifier.arguments;
        const statics = modifier.variables || [];
        const dynamicsOrHeros = modifier.references || [];

        statics.forEach((staticComponent) => {
            const defaultValue = !args ? staticComponent.defaultValue : isNaN(parseInt(args)) ? "" : "0";
            const staticVariable = elementData.variablesToUpdate[staticComponent._id] || getOrCreateStaticVariable(staticComponent as unknown as Variable, defaultValue);
            staticVariable.value = getNewValue(staticVariable, operation, args);
            elementData.variablesToUpdate[staticComponent._id] = staticVariable;
        });

        dynamicsOrHeros.forEach((dynamicOrHero) => {
            const defaultValue = isNaN(parseInt(args)) ? "" : "0";
            const dynamicVariable = elementData.variablesToUpdate[dynamicOrHero] || getOrCreateDynamiqueVariable(dynamicOrHero, defaultValue);
            dynamicVariable.value = getNewValue(dynamicVariable, operation, args);
            elementData.variablesToUpdate[dynamicOrHero] = dynamicVariable;
        });
    };

    const applyAccess = (modifier: Modifier, elementData: ElementDataProps) => {
        const { arguments: args, access: accessRefs } = modifier;
        console.log({ modifier });
        accessRefs.forEach((accessRef) => {
            const noChangePossible = elementData.access[accessRef._ref]?.persistant || access[accessRef._ref]?.persistant;
            if (noChangePossible) return;
            const argsList = args.split(",").map((arg) => arg.trim());
            const newValue = (argsList.length && argsList[0] === "false") || "" ? false : true;
            const persistant = argsList.length > 1 && argsList[1] !== "false";
            console.log({ argsList, newValue, persistant });
            elementData.access[accessRef._ref] = { value: newValue, persistant };
        });
    };

    const applyStep = (modifier: Modifier, elementData: ElementDataProps) => {
        const { arguments: args, access: stepRef } = modifier;
        if (!stepRef || !stepRef.length) return;
        elementData.step = { _id: "step", elementId: stepRef[0]._ref, label: args || "arrow", code: "step" };
    };

    return { effectsTreatment };
};

const getModifiers = async (modifiersWithRef: ModifierWithRef[]) => {
    const modifiers: Modifier[] = [];
    for (let i = 0; i < modifiersWithRef.length; i++) {
        const modifierWithRef = modifiersWithRef[i];

        if (!modifierWithRef.variables || !modifierWithRef.variables.length) {
            modifiers.push(modifierWithRef as Modifier);
            continue;
        }

        const variables = [];
        for (let j = 0; j < modifierWithRef.variables.length; j++) {
            const variableRef = modifierWithRef.variables[j];
            const variable = await fetchData<Variable>("variable", variableRef._ref);
            if (!variable) continue;
            variables.push(variable);
        }
        const modifier = { ...modifierWithRef, variables };
        modifiers.push(modifier);
    }
    return modifiers;
};

const getNewValue = (variable: VariableState, operation: "addition" | "multiplication" | "replace", args: string) => {
    const valueNum = parseInt(variable.value);
    const argsNum = parseInt(args);

    if (isNaN(valueNum)) {
        return operation === "addition" ? variable.value + args : operation === "multiplication" ? variable.value.repeat(argsNum || 0) : args;
    } else {
        if (isNaN(argsNum)) return variable.value;

        let newValueRaw: number = parseInt(variable.value);
        if (operation === "addition") newValueRaw = valueNum + (argsNum || 0);
        if (operation === "multiplication") newValueRaw = valueNum * (argsNum || 0);
        if (operation === "replace") newValueRaw = argsNum || 0;
        const newValue = Math.max(Math.min(newValueRaw, variable.data?.maximum || 9999999999), variable.data?.minimum || -9999999999);
        return newValue.toString();
    }
};
