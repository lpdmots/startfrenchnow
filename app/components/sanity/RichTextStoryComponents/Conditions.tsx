import { useValidation } from "@/app/hooks/stories/useValidation";
import { ELEMENTDATA } from "@/app/lib/constantes";
import { sortByCode } from "@/app/lib/utils";
import { Block } from "@/app/types/sfn/blog";
import { Condition } from "@/app/types/stories/effect";
import { PortableText } from "@portabletext/react";
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
    const validatedConditions = [];

    for (const conditionBlock of sortedConditionsBlock) {
        const isValid = checkConditions({ validation: { conditions: conditionBlock.conditions } }, { ...JSON.parse(JSON.stringify(ELEMENTDATA)) });
        if (!isValid) continue;
        if (isValid && ["first", "last"].includes(options)) {
            return <PortableText value={conditionBlock.content} components={RichTextStory(true)} />;
        }
        validatedConditions.push(conditionBlock);
    }

    if (options === "all") validatedConditions.map((conditionBlock) => <PortableText value={conditionBlock.content} components={RichTextStory(true)} />).join(" ");
    if (options === "random") return <PortableText value={validatedConditions[Math.floor(Math.random() * validatedConditions.length)].content} components={RichTextStory(true)} />;

    return <PortableText value={defaultContent} components={RichTextStory(true)} />;
};
