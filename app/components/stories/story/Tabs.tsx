"use client";
import { useEffect } from "react";
import { LayoutProps } from "@/app/types/stories/state";
import { useStoryStore } from "@/app/stores/storiesStore";
import { DesktopTabsContent } from "./DesktopTabsContent";
import { MobileTabsContent } from "./MobileTabsContent";
import { StoryNavbar } from "./StoryNavbar";
import { IsDesktop, IsMobile } from "../WithMediaQuery";

export const Tabs = ({ data }: { data: LayoutProps }) => {
    const { setSelectedStoryTabsIndex } = useStoryStore();

    useEffect(() => {
        setSelectedStoryTabsIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-full w-full flex flex-col justify-between">
            <div className="flex justify-center items-between grow">
                <IsDesktop>
                    <div className="flex flex-col w-full">
                        <DesktopTabsContent data={data} />
                        <StoryNavbar layout="desktop" />
                    </div>
                </IsDesktop>
                <IsMobile>
                    <MobileTabsContent data={data} />
                </IsMobile>
            </div>
        </div>
    );
};
