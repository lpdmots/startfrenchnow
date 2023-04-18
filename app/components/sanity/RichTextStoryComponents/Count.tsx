import { rangeFromString } from "@/app/lib/utils";
import { useStoryStore } from "@/app/stores/storiesStore";
import { Block, Reference } from "@/app/types/sfn/blog";
import { PortableText } from "@portabletext/react";
import { RichTextStory } from "../RichTextStory";

interface CountProps {
    value: {
        component: Reference;
        contents: { count: string; storyContent: Block }[];
    };
}

export const Count = ({ value }: CountProps) => {
    const { count } = useStoryStore();
    const { component, contents } = value;
    const counter = count[component._ref] - 1 || 0;
    const validatedContents = [];

    for (const content of contents) {
        const countStr = content.count;
        const countStrList = countStr.split(",").map((c) => c.trim());
        let countList: number[] = [];
        for (const countStr of countStrList) {
            if (countStr.includes("-")) {
                countList = countList.concat(rangeFromString(countStr));
            } else {
                countList.push(parseInt(countStr));
            }
        }
        if (countList.includes(counter)) {
            validatedContents.push(content.storyContent);
        }
    }

    if (!validatedContents.length) {
        return <></>;
    }
    return <PortableText value={validatedContents[Math.floor(Math.random() * validatedContents.length)]} components={RichTextStory(true)} />;
};
