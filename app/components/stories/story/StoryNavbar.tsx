import React, { useMemo } from "react";
import { BsImage } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { MdBackpack } from "react-icons/md";
import { motion } from "framer-motion";
import { useStoryStore } from "@/app/stores/storiesStore";

export const tabs = {
    desktop: [
        { label: "image", icon: <BsImage className="text-4xl" /> },
        { label: "inventaire", icon: <MdBackpack className="text-4xl" /> },
        { label: "héros", icon: <FaUser className="text-4xl" /> },
    ],
    mobile: [
        { label: "story", icon: <BsImage className="text-2xl sm:text-3xl" /> },
        { label: "inventaire", icon: <MdBackpack className="text-2xl sm:text-3xl" /> },
        { label: "héros", icon: <FaUser className="text-2xl sm:text-3xl" /> },
    ],
};

export const StoryNavbar = ({ layout }: { layout: "desktop" | "mobile" }) => {
    const { selectedStoryTabsIndex, setSelectedStoryTabsIndex } = useStoryStore();
    const [respTabs, selectedTab] = useMemo(() => {
        const tabsArray = tabs[layout];
        return [tabsArray, tabsArray[selectedStoryTabsIndex]];
    }, [layout, selectedStoryTabsIndex]);

    if (layout === "desktop")
        return (
            <nav style={{ marginBottom: "8vh" }}>
                <ul className="list-none flex justify-center m-0 mt-4 p-0 h-18">
                    {respTabs.map((item, index) => (
                        <li
                            key={item.label}
                            className="flex items-center justify-center m-0 p-4 relative cursor-pointer select-none rounded rounded-tl-none rounded-tr-none"
                            onClick={() => setSelectedStoryTabsIndex(index)}
                        >
                            <button className={`roundButton ${item === selectedTab && "bg-neutral-800"}`}>{item.icon}</button>
                            <div>
                                {item === selectedTab ? (
                                    <motion.div
                                        className="absolute left-0 right-0 -bottom-3 bs font-bold"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {selectedTab.label}
                                    </motion.div>
                                ) : null}
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>
        );

    return (
        <nav>
            <ul className="list-none flex justify-center m-0 p-0">
                {respTabs.map((item, index) => (
                    <li
                        key={item.label}
                        className="flex items-center justify-center m-0 px-4 relative cursor-pointer select-none rounded rounded-tl-none rounded-tr-none"
                        onClick={() => setSelectedStoryTabsIndex(index)}
                    >
                        {item.icon}
                        {index === selectedStoryTabsIndex ? <motion.span className="absolute left-0 right-0 -bottom-3 bs font-bold bg-neutral-700 h-1" layoutId="underline"></motion.span> : null}
                    </li>
                ))}
            </ul>
        </nav>
    );
};
