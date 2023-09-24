"use client";
import { STORYCATEGORIES } from "@/app/lib/constantes";
import { removeDuplicates } from "@/app/lib/utils";
import { StoryCard } from "@/app/types/stories/adventure";
import { useEffect, useMemo, useState } from "react";
import { SlideFromBottom } from "../../animations/Slides";
import { StoriesAccordion } from "../../stories/home/StoriesAccordion";

export const StoryTabsFront = ({ stories }: { stories: StoryCard[] }) => {
    //const categories = useMemo(() => ["Toutes", ...removeDuplicates(stories.map((story) => STORYCATEGORIES[story.category]).sort())], [stories]);
    const [selectedCategory, setSelectedCategory] = useState("Toutes");
    const [filtredStories, setFiltredStories] = useState(stories);

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
    };

    useEffect(() => {
        setFiltredStories(() => {
            if (selectedCategory === "Toutes") return stories;
            return stories.filter((story) => STORYCATEGORIES[story.category] === selectedCategory);
        });
    }, [selectedCategory, stories]);

    return (
        <SlideFromBottom delay={0.8}>
            <div className="flex justify-center w-full">
                <div className="w-full" style={{ maxWidth: 808 }}>
                    {filtredStories && <StoriesAccordion filtredStories={filtredStories} />}
                </div>
            </div>
        </SlideFromBottom>
    );
};
