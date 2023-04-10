"use client";
import { useStoryStore } from "@/stores/storiesStore";
import { AnimatePresence, m } from "framer-motion";
import React, { useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

export const Carousel = ({ data, inventoryArrows = false }: { data: JSX.Element[]; inventoryArrows?: boolean }) => {
    const [slideIndex, setSlideIndex] = useState(0);
    const { setNewStates } = useStoryStore();

    const handleSlide = (number: 1 | -1) => {
        let newSlideIndex = slideIndex + number;
        if (newSlideIndex >= data.length) newSlideIndex = 0;
        if (newSlideIndex < 0) newSlideIndex = data.length - 1;
        setSlideIndex(newSlideIndex);
        setNewStates({ selectedHerosIndex: newSlideIndex });
    };

    return (
        <>
            <div className={`slider-wrapper w-slider flex flex-col h-full w-full ${inventoryArrows ? "p-0" : "pb-16 sm:pb-24 lg:pb-0"}`}>
                <AnimatePresence mode="wait">
                    <m.div
                        className="h-full w-full flex-col flex justify-center items-center"
                        key={slideIndex ? slideIndex : "empty"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {data[slideIndex]}
                        {inventoryArrows && data.length > 1 && (
                            <div className="flex justify-center gap-12 w-full pt-4">
                                <button className="roundButton small" onClick={() => handleSlide(-1)}>
                                    <AiOutlineArrowLeft className="text-3xl" />
                                </button>
                                <button className="roundButton small" onClick={() => handleSlide(1)}>
                                    <AiOutlineArrowRight className="text-3xl" />
                                </button>
                            </div>
                        )}
                    </m.div>
                </AnimatePresence>
                {!inventoryArrows && (
                    <>
                        <div className="btn-circle-secondary slider-arrow left---center-center w-slider-arrow-left" style={{ zIndex: 0 }} onClick={() => handleSlide(-1)}>
                            <AiOutlineArrowLeft />
                        </div>
                        <div className="btn-circle-secondary slider-arrow right---center-center w-slider-arrow-right" style={{ zIndex: 0 }} onClick={() => handleSlide(1)}>
                            <AiOutlineArrowRight />
                        </div>
                    </>
                )}
                <div className="hidden-on-desktop w-slider-nav w-round"></div>
            </div>
        </>
    );
};
