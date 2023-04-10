"use client";
import { useEffect } from "react";
import { LayoutProps } from "@/app/types/stories/state";
import { useStoryStore } from "@/stores/storiesStore";
import { DesktopTabsContent } from "./DesktopTabsContent";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { MobileTabsContent } from "./MobileTabsContent";
import { StoryNavbar } from "./StoryNavbar";

export const Tabs = ({ data }: { data: LayoutProps }) => {
    const { setSelectedStoryTabsIndex } = useStoryStore();
    const isDesktop = useMediaQuery("(min-width: 992px)");

    useEffect(() => {
        setSelectedStoryTabsIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-full w-full flex flex-col justify-between">
            <div className="flex justify-center items-between grow">
                {isDesktop ? (
                    <div className="flex flex-col w-full">
                        <DesktopTabsContent data={data} />
                        <StoryNavbar layout="desktop" />
                    </div>
                ) : (
                    <MobileTabsContent data={data} />
                )}
            </div>
        </div>
    );
};
