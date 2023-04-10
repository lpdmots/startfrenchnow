import { LayoutProps } from "@/app/types/stories/state";
import Image from "next/image";
import { useStoryStore } from "@/stores/storiesStore";
import { HeroCard } from "../selectHero/HeroCard";
import { Inventory } from "./Inventory";
import { AnimatePresence, motion } from "framer-motion";
import { useTabsContentData } from "@/app/hooks/stories/commonHooks";

export const DesktopTabsContent = ({ data }: { data: LayoutProps }) => {
    const { heros, selectedStoryTabsIndex } = useStoryStore();
    const { selectedTab, skills, objects } = useTabsContentData("desktop");

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
                {selectedTab.label === "image" && data.image ? (
                    <Image
                        src={data.image}
                        width={610}
                        height={400}
                        alt={data.title || "image"}
                        className="rounded-xl shadow-1 simple-border"
                        style={{ objectFit: "cover" }}
                        priority={selectedStoryTabsIndex ? false : true}
                    />
                ) : selectedTab.label === "héros" ? (
                    <HeroCard hero={heros} skills={skills} />
                ) : (
                    <Inventory objects={objects} />
                )}
            </motion.div>
        </AnimatePresence>
    );
};
