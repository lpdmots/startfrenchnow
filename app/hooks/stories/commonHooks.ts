import { tabs } from "@/app/components/stories/story/StoryNavbar";
import { useStoryStore } from "@/app/stores/storiesStore";
import React, { useMemo } from "react";

export const useTabsContentData = (layout: "desktop" | "mobile") => {
    const respTabs = useMemo(() => tabs[layout], [layout]);
    const { variables, selectedStoryTabsIndex } = useStoryStore();
    const selectedTab = useMemo(() => respTabs[selectedStoryTabsIndex], [selectedStoryTabsIndex, respTabs]);
    const variablesToList = useMemo(() => Object.values(variables), [variables]);
    const skills = useMemo(() => variablesToList.filter((variable) => variable.data.nature === "skill").map((variable) => variable.data), [variablesToList]);
    const objects = useMemo(() => variablesToList.filter((variable) => variable.data.nature === "object"), [variablesToList]);

    return { selectedTab, skills, objects };
};
