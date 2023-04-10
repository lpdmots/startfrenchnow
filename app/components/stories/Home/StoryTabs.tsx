"use client";
import { StoryCard } from "@/app/types/stories/adventure";
import { STORYCATEGORIES } from "@/lib/constantes";
import { removeDuplicates } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { StoriesAccordion } from "./StoriesAccordion";

export function StoryTabs({ stories }: { stories: StoryCard[] }) {
    const categories = useMemo(() => ["Toutes", ...removeDuplicates(stories.map((story) => STORYCATEGORIES[story.category]).sort())], [stories]);
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
        <div className="container-default w-container">
            <section className="w-layout-grid grid-2-columns blog-left-sidebar wf-section">
                <div className="sticky-top _48px-top sticky-tbl">
                    <div className="inner-container _380">
                        <div className="text-center---tablet">
                            <div id="storiesTab" className="card categories-card">
                                <div className="w-dyn-list">
                                    <div role="list" className="collection-list categories w-dyn-items">
                                        {categories.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => handleCategoryClick(category)}
                                                className={`blog-categories-item-wrapper ${selectedCategory === category ? "current pointer-events-none" : "bg-neutral-100"} w-full`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid gap-12">{filtredStories && <StoriesAccordion filtredStories={filtredStories} />}</div>
            </section>
        </div>
    );
}
