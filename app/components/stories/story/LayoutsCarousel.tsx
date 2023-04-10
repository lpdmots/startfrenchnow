"use client";
import { useElementTreatment } from "@/app/hooks/stories/useElement";
import { removeDuplicates } from "@/lib/utils";
import { useStoryStore } from "@/stores/storiesStore";
import { AnimatePresence, m } from "framer-motion";
import React, { useEffect, useMemo } from "react";
import { DesktopLayout } from "@/app/components/stories/story/DesktopLayout";
import { MobileTabsContent } from "./MobileTabsContent";
import useMediaQuery from "@/app/hooks/useMediaQuery";

export const LayoutsCarousel = () => {
    const { layouts, slideIndex } = useStoryStore();
    const { choicesTreatment } = useElementTreatment();
    const isDesktop = useMediaQuery("(min-width: 992px)");

    useEffect(() => {
        choicesTreatment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layouts]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const dateKey = useMemo(() => new Date().getTime(), [layouts]); // Force re-render when layouts change but not the slideIndex or it will not animate

    return (
        <div className="slider-wrapper w-slider flex justify-center items-center pb-0 grow">
            <AnimatePresence mode="wait">
                <m.div
                    className="h-full w-full flex justify-center items-around"
                    key={dateKey + slideIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {isDesktop ? (
                        <DesktopLayout data={layouts[slideIndex]} />
                    ) : (
                        <div className="flex grow justify-center items-center">
                            <MobileTabsContent data={layouts[slideIndex]} />
                        </div>
                    )}
                </m.div>
            </AnimatePresence>
        </div>
    );
};
