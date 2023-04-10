import { LayoutProps } from "@/app/types/stories/state";
import { useStoryStore } from "@/stores/storiesStore";
import { HeroCard } from "../selectHero/HeroCard";
import { Inventory } from "./Inventory";
import { AnimatePresence, motion } from "framer-motion";
import { useTabsContentData } from "@/app/hooks/stories/commonHooks";
import { MobileLayout } from "./MobileLayout";

export const MobileTabsContent = ({ data }: { data: LayoutProps }) => {
    const { heros } = useStoryStore();
    const { selectedTab, skills, objects } = useTabsContentData("mobile");

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={selectedTab ? selectedTab.label : "empty"}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full flex justify-center items-center"
            >
                {selectedTab.label === "story" ? <MobileLayout data={data} /> : selectedTab.label === "héros" ? <HeroCard hero={heros} skills={skills} /> : <Inventory objects={objects} />}
            </motion.div>
        </AnimatePresence>
    );
};
