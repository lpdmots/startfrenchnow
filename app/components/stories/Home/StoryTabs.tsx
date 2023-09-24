import { intelRich } from "@/app/lib/intelRich";
import { StoryCard } from "@/app/types/stories/adventure";
import { useTranslations } from "next-intl";
import { SlideFromBottom } from "../../animations/Slides";
import { StoryTabsFront } from "../../sfn/stories/StoryTabsFront";

export function StoryTabs({ stories }: { stories: StoryCard[] }) {
    const t = useTranslations("Stories.StoryTabs");
    return (
        <>
            <div className="container-default w-container">
                <section id="storiesTab">
                    <SlideFromBottom>
                        <div className="flex justify-center">
                            <h2 className="display-2 text-center max-w-3xl">{t.rich("title", intelRich())}</h2>
                        </div>
                    </SlideFromBottom>
                    <SlideFromBottom>
                        <div className="flex flex-col items-center pb-16">
                            <p className="w-full text-center max-w-3xl">{t.rich("description1", intelRich())}</p>
                            <p className="w-full text-center max-w-3xl">{t.rich("description2", intelRich())}</p>
                        </div>
                    </SlideFromBottom>

                    <div className="flex justify-center">
                        <StoryTabsFront stories={stories} />
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
