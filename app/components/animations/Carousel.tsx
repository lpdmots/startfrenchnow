"use client";
import { useStoryStore } from "@/app/stores/storiesStore";
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
            <div className={`h-full bg-[transparent] max-[991px]:pb-[120px] max-[767px]:pb-[110px] max-[479px]:pb-[100px] w-slider flex flex-col h-full w-full ${inventoryArrows ? "p-0" : "pb-16 sm:pb-24 lg:pb-0"}`}>
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
                        <div className="btn-circle-secondary slider-arrow max-[991px]:top-auto max-[991px]:right-[85px] max-[767px]:right-[75px] w-slider-arrow-left" style={{ zIndex: 0 }} onClick={() => handleSlide(-1)}>
                            <AiOutlineArrowLeft />
                        </div>
                        <div className="btn-circle-secondary slider-arrow max-[991px]:left-[85px] max-[991px]:top-auto max-[767px]:left-[75px] w-slider-arrow-right" style={{ zIndex: 0 }} onClick={() => handleSlide(1)}>
                            <AiOutlineArrowRight />
                        </div>
                    </>
                )}
                <div className="hidden w-slider-nav w-round"></div>
            </div>
        </>
    );
};
