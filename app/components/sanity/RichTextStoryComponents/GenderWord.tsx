"use client";

import { useStoryStore } from "@/app/stores/storiesStore";
import { Block } from "@/app/types/sfn/blog";
import { PortableText } from "@portabletext/react";
import { useMemo } from "react";
import { RichTextStory } from "../RichTextStory";

interface PopoverProps {
    children: React.ReactNode;
    female: Block;
}

export const GenderWord: React.FC<PopoverProps> = ({ children, female }) => {
    const { heros } = useStoryStore();
    const femaleContent = useMemo(() => <PortableText value={female} components={RichTextStory(true)} />, [female]);
    return heros?.sex === "male" ? <span>{children}</span> : femaleContent;
};
