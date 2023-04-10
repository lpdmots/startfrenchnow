import React, { useMemo } from "react";
import { BsImage } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { MdBackpack } from "react-icons/md";
import { motion } from "framer-motion";
import { useStoryStore } from "@/stores/storiesStore";

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
    const respTabs = useMemo(() => tabs[layout], [layout]);
    const selectedTab = useMemo(() => respTabs[selectedStoryTabsIndex], [selectedStoryTabsIndex, respTabs]);

    if (layout === "desktop")
        return (
            <nav style={{ marginBottom: "10vh" }}>
                <ul className="list-none flex justify-center m-0 mt-4 p-0 h-18">
                    {respTabs.map((item, index) => (
                        <li
                            key={item.label}
                            className="flex items-center justify-center m-0 p-4 relative cursor-pointer select-none rounded rounded-tl-none rounded-tr-none"
                            onClick={() => setSelectedStoryTabsIndex(index)}
                        >
                            <button className={`roundButton ${item === selectedTab && "bg-neutral-800"}`}>{item.icon}</button>
                            {item === selectedTab ? (
                                <motion.div className="absolute left-0 right-0 -bottom-3 bs font-bold" layoutId="underline">
                                    {selectedTab.label}
                                </motion.div>
                            ) : null}
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
                        {index === selectedStoryTabsIndex ? <motion.div className="absolute left-0 right-0 -bottom-3 bs font-bold bg-neutral-700 h-1" layoutId="underline"></motion.div> : null}
                    </li>
                ))}
            </ul>
        </nav>
    );
};
