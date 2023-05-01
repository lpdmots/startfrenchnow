import { useValidation } from "@/app/hooks/stories/useValidation";
import { ELEMENTDATA } from "@/app/lib/constantes";
import { sortByCode } from "@/app/lib/utils";
import { Block } from "@/app/types/sfn/blog";
import { Condition } from "@/app/types/stories/effect";
import { PortableText } from "@portabletext/react";
import { useMemo } from "react";
import { RichTextStory } from "../RichTextStory";

export interface BlockConditions {
    code: string;
    conditions: Condition[];
    content: Block;
}

interface ConditionsProps {
    value: {
        conditionsBlock: BlockConditions[];
        default: Block;
        options: string;
    };
}

export const Conditions = (value: ConditionsProps) => {
    const { checkConditions } = useValidation();
    const { conditionsBlock, default: defaultContent, options } = value.value;
    let sortedConditionsBlock = sortByCode(conditionsBlock);
    if (options === "last") sortedConditionsBlock = sortedConditionsBlock.reverse();
    let validatedConditions: BlockConditions[] = [];

    for (const conditionBlock of sortedConditionsBlock) {
        const isValid = checkConditions({ validation: { conditions: conditionBlock.conditions, operator: "and" } }, { ...JSON.parse(JSON.stringify(ELEMENTDATA)) });
        if (!isValid) continue;
        if (isValid && ["first", "last"].includes(options)) {
            validatedConditions.push(conditionBlock);
            break;
        }
        validatedConditions.push(conditionBlock);
    }
    if (options === "random") validatedConditions = validatedConditions.splice(Math.floor(Math.random() * validatedConditions.length), 1);

    const text = useMemo(
        () => (
            <span>
                {validatedConditions.length > 0 ? (
                    validatedConditions.map((conditionBlock, index) => {
                        const isLastIndex = index === validatedConditions.length - 1;
                        return (
                            <span key={index}>
                                <PortableText value={conditionBlock.content} components={RichTextStory(true)} />
                                <span>{!isLastIndex && " "}</span>
                            </span>
                        );
                    })
                ) : (
                    <PortableText value={defaultContent} components={RichTextStory(true)} />
                )}
            </span>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return text;
};
