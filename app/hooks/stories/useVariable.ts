import { useStoryStore } from "@/app/stores/storiesStore";
import { Variable, VariableState } from "@/app/types/stories/adventure";

export const useVariable = () => {
    const { variables, heros, updateVariables } = useStoryStore();

    const addVariables = (variablesData: Variable[]) => {
        const newVariables: { [index: string]: VariableState } = {};

        variablesData.forEach((variable) => {
            const variableState = variables[variable._id];
            const value = variable.defaultValue;
            if (!variableState) {
                newVariables[variable._id] = { data: variable, value };
            } else {
                const oldValueNum = parseInt(variableState.value);
                const newValueNum = parseInt(value);
                newVariables[variable._id] = {
                    ...variableState,
                    value: isNaN(oldValueNum) || isNaN(newValueNum) ? variableState.value : (oldValueNum + newValueNum).toString(),
                };
            }
        });

        updateVariables(newVariables);
    };

    const getOrCreateStaticVariable = (variable: Variable, defaultValue: string) => {
        const variableState = structuredClone(variables[variable._id]);

        return variableState || { data: variable, value: defaultValue };
    };

    const getOrCreateDynamiqueVariable = (reference: string, defaultValue: string) => {
        return structuredClone(heros?.[reference]) || structuredClone(variables[reference]) || { value: defaultValue };
    };

    return { addVariables, getOrCreateStaticVariable, getOrCreateDynamiqueVariable };
};
