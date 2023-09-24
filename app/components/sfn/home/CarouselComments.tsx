"use client";
import { m, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Comment from "./Comment";
import { comments } from "./Comment";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

export const CarouselComments = () => {
    const [slideIndex, setSlideIndex] = useState(0);

    const handleSlide = (number: 1 | -1) => {
        let newSlideIndex = slideIndex + number;
        if (newSlideIndex >= comments.length) newSlideIndex = 0;
        if (newSlideIndex < 0) newSlideIndex = comments.length - 1;
        setSlideIndex(newSlideIndex);
    };
    return (
        <>
            <div className="slider-mask overflow-visible w-slider-mask ">
                <AnimatePresence mode="wait">
                    <m.div key={slideIndex ? slideIndex : "empty"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <Comment slideIndex={slideIndex} />
                    </m.div>
                </AnimatePresence>
            </div>
            <div className="btn-circle-secondary slider-arrow left---center-center w-slider-arrow-left" onClick={() => handleSlide(-1)}>
                <AiOutlineArrowLeft />
            </div>
            <div className="btn-circle-secondary slider-arrow right---center-center w-slider-arrow-right" onClick={() => handleSlide(1)}>
                <AiOutlineArrowRight />
            </div>
            <div className="hidden-on-desktop w-slider-nav w-round"></div>
        </>
    );
};
