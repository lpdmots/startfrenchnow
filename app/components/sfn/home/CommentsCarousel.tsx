"use client";
import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import Comment from "./Comment";
import { comments } from "./Comment";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { SlideFromBottom } from "../../animations/Slides";
import { Fade } from "../../animations/Fades";
import LinkArrow from "../../common/LinkArrow";

function CommentsCarousel() {
    const [slideIndex, setSlideIndex] = useState(0);

    const handleSlide = (number: 1 | -1) => {
        let newSlideIndex = slideIndex + number;
        if (newSlideIndex >= comments.length) newSlideIndex = 0;
        if (newSlideIndex < 0) newSlideIndex = comments.length - 1;
        setSlideIndex(newSlideIndex);
    };

    return (
        <section className="section overflow-hidden testimonial-section wf-section">
            <div className="container-default w-container">
                <SlideFromBottom>
                    <div className="inner-container _550px center">
                        <div className="inner-container _600px---tablet center">
                            <div className="inner-container _500px---mbl center">
                                <div className="inner-container _400px---mbp center">
                                    <div className="text-center mg-bottom-40px">
                                        <div className="inner-container _400px---mbl center">
                                            <div className="inner-container _350px---mbp center">
                                                <h2 className="display-2">
                                                    What my students say <span className="heading-span-secondary-4">about my work</span>
                                                </h2>
                                            </div>
                                        </div>
                                        <p className="mg-bottom-48px">
                                            Here are some reviews of my classes. You will find many more{" "}
                                            <span className="text-no-wrap">
                                                on <LinkArrow>Udemy</LinkArrow>.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SlideFromBottom>
                <Fade delay={0.6}>
                    <div className="slider-wrapper w-slider">
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
                    </div>
                </Fade>
            </div>
        </section>
    );
}

export default CommentsCarousel;
