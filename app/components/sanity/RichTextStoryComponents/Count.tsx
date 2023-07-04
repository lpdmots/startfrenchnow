import { rangeFromString } from "@/app/lib/utils";
import { useStoryStore } from "@/app/stores/storiesStore";
import { Block, Reference } from "@/app/types/sfn/blog";
import { PortableText } from "@portabletext/react";
import { useMemo } from "react";
import { RichTextStory } from "../RichTextStory";

interface CountProps {
    value: {
        component?: Reference;
        contents: { count: string; storyContent: Block }[];
    };
}

export const Count = ({ value }: CountProps) => {
    const { count, actualElementId } = useStoryStore();
    const { component, contents } = value;
    const counter = component?._ref ? count[component?._ref] || 0 : count[actualElementId] - 1 || 0;
    const validatedContents: Block[] = [];

    parentLoop: for (const content of contents) {
        const countStr = content.count || "";
        const countStrList = countStr.split(",").map((c) => c.trim());
        let countList: number[] = [];

        for (const countStr of countStrList) {
            if (countStr.includes("+")) {
                const isEgalOrMore = parseInt(countStr.replace("+", "")) <= counter;
                if (isEgalOrMore) {
                    validatedContents.push(content.storyContent);
                    continue parentLoop;
                }
            } else if (countStr.includes("-")) {
                const isEgalOrLess = parseInt(countStr.replace("-", "")) <= counter;
                if (isEgalOrLess) {
                    validatedContents.push(content.storyContent);
                    continue parentLoop;
                }
            } else if (countStr.includes("/")) {
                countList = countList.concat(rangeFromString(countStr));
            } else {
                countList.push(parseInt(countStr));
            }
        }
        if (countList.includes(counter)) {
            validatedContents.push(content.storyContent);
        }
    }

    const text = useMemo(
        () => (!validatedContents.length ? <></> : <PortableText value={validatedContents[Math.floor(Math.random() * validatedContents.length)]} components={RichTextStory(true)} />),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    return text;
};
