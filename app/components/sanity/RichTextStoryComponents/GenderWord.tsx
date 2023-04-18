"use client";

import { useStoryStore } from "@/app/stores/storiesStore";

interface PopoverProps {
    male: React.ReactNode;
    female: React.ReactNode;
}

export const GenderWord: React.FC<PopoverProps> = ({ male, female }) => {
    const { heros } = useStoryStore();
    const content = heros?.sex === "male" ? male : female;
    return <span>{content}</span>;
};
