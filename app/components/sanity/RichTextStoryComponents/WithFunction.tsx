import { useStoryStore } from "@/app/stores/storiesStore";
import { Reference } from "@/app/types/sfn/blog";
import React from "react";

interface WithFunctionProps {
    value: {
        functionName: "toBulletList";
        variableName?: string;
        variableComponent?: Reference;
    };
}

function WithFunction({ value }: WithFunctionProps) {
    const { functionName, variableName, variableComponent } = value;
    const { variables, heros } = useStoryStore();
    let variableValue = variables[variableComponent?._ref || ""]?.value || variables[variableName || ""] || heros?.[variableName || ""];
    if (!variableValue) return null;

    switch (functionName) {
        case "toBulletList":
            if (typeof variableValue != "string") return null;
            return (
                <ul className="ml-4 sm:ml-10 py-5 list-disc space-y-5">
                    {variableValue
                        .split("|")
                        .map((x) => x.trim())
                        .filter(Boolean)
                        .map((item: any) => (
                            <li key={item}>{item}</li>
                        ))}
                </ul>
            );
        default:
            return null;
    }
}

export default WithFunction;
