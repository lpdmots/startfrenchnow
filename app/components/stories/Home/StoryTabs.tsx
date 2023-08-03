"use client";
import { StoryCard } from "@/app/types/stories/adventure";
import { STORYCATEGORIES } from "@/app/lib/constantes";
import { removeDuplicates } from "@/app/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { StoriesAccordion } from "./StoriesAccordion";
import { SlideFromBottom } from "../../animations/Slides";

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
        <>
            <div className="container-default w-container">
                <section id="storiesTab">
                    <SlideFromBottom>
                        <div className="flex justify-center">
                            <h2 className="display-2 text-center max-w-3xl">
                                <span className="heading-span-secondary-1">Test Your French Skills</span> Through An Interactive Story
                            </h2>
                        </div>
                    </SlideFromBottom>
                    <SlideFromBottom>
                        <div className="flex flex-col items-center pb-16">
                            <p className="w-full text-center max-w-3xl">
                                Dive into our interactive story and experience the joy of exploring <span className="heading-span-secondary-4">the myriad possibilities</span> it offers. Don't hesitate
                                to start over and strive for maximum success - but you'll never reach them all! <span style={{ fontSize: 25 }}>😈</span>
                            </p>
                            <p className="w-full text-center max-w-3xl">
                                This journey requires a solid foundation in French, but don't worry if you're not quite there yet. We've got you covered with{" "}
                                <span className="heading-span-secondary-2">helpful translations</span>. With a bit of dedication and a dash of creativity, you'll be making magic in no time.
                            </p>
                        </div>
                    </SlideFromBottom>

                    <div className="flex justify-center">
                        <SlideFromBottom delay={0.8}>
                            <div className="flex justify-center w-full">
                                <div className="w-full" style={{ maxWidth: 808 }}>
                                    {filtredStories && <StoriesAccordion filtredStories={filtredStories} />}
                                </div>
                            </div>
                        </SlideFromBottom>
                    </div>
                </section>
            </div>
        </>
    );
}

/* export function StoryTabs({ stories }: { stories: StoryCard[] }) {
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
            <section id="storiesTab" className="w-layout-grid grid-2-columns blog-left-sidebar wf-section">
                <div className="sticky-top _48px-top sticky-tbl">
                    <div className="inner-container _380">
                        <div className="text-center---tablet">
                            <div className="card categories-card">
                                <div className="w-dyn-list">
                                    <div className="collection-list categories w-dyn-items">
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
} */
