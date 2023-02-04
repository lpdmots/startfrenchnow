"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Comment from "./Comment";
import { comments } from "./Comment";
import Link from "next/link";

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
                                            on{" "}
                                            <Link href="https://www.udemy.com/course/french-for-beginners-a1/" className="link-wrapper w-inline-block">
                                                <span className="link-text underline">Udemy</span>
                                                <span className="line-rounded-icon link-icon-right"></span>
                                            </Link>
                                            .
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="slider-wrapper w-slider">
                    <div className="slider-mask overflow-visible w-slider-mask ">
                        <AnimatePresence mode="wait">
                            <motion.div key={slideIndex ? slideIndex : "empty"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                                <Comment slideIndex={slideIndex} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="btn-circle-secondary slider-arrow left---center-center w-slider-arrow-left" onClick={() => handleSlide(-1)}>
                        <div className="line-rounded-icon"></div>
                    </div>
                    <div className="btn-circle-secondary slider-arrow right---center-center w-slider-arrow-right" onClick={() => handleSlide(1)}>
                        <div className="line-rounded-icon"></div>
                    </div>
                    <div className="hidden-on-desktop w-slider-nav w-round"></div>
                </div>
            </div>
        </section>
    );
}

export default CommentsCarousel;
