import { tabs } from "@/app/components/stories/story/StoryNavbar";
import { useStoryStore } from "@/app/stores/storiesStore";
import { Variable } from "@/app/types/stories/adventure";
import { useMemo } from "react";

export const useTabsContentData = (layout: "desktop" | "mobile") => {
    const respTabs = useMemo(() => tabs[layout], [layout]);
    const { variables, selectedStoryTabsIndex } = useStoryStore();
    const selectedTab = useMemo(() => respTabs[selectedStoryTabsIndex], [selectedStoryTabsIndex, respTabs]);
    const variablesToList = useMemo(() => Object.values(variables), [variables]);
    const skills = useMemo(() => variablesToList.filter((variable) => variable?.data?.nature === "skill").map((variable) => variable.data) as unknown as Variable[], [variablesToList]);
    const objects = useMemo(() => variablesToList.filter((variable) => variable?.data?.nature === "object" && !["0", ""].includes(variable?.value)), [variablesToList]);

    return { selectedTab, skills, objects };
};
