"use client";
import React from "react";
// 1. Importing framer-motion
import { m } from "framer-motion";

// 2. Defining Variants
const marqueeInitiialVariants = {
    animate: {
        x: "-110vw",
        transition: {
            x: {
                duration: 25,
                ease: "linear",
            },
        },
    },
};
const marqueeVariants = {
    animate: {
        x: ["0vw", "-220vw"],
        transition: {
            x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 50,
                ease: "linear",
            },
        },
    },
};
const marqueeVariants2 = {
    animate: {
        x: ["0vw", "-220vw"],
        transition: {
            x: {
                delay: 25,
                repeat: Infinity,
                repeatType: "loop",
                duration: 50,
                ease: "linear",
            },
        },
    },
};

const Marquee = ({ content }: { content: JSX.Element }) => {
    return (
        <section className="section pd-top-5---bottom-5 wf-section">
            <div className="logo-strip-wrapper text-neutral-100 p-3">
                <div className="marquee">
                    <m.div className="trackInitial h-full flex items-center" variants={marqueeInitiialVariants} animate="animate">
                        {content}
                    </m.div>
                    <m.div className="track h-full flex items-center" variants={marqueeVariants} animate="animate">
                        {content}
                    </m.div>
                    <m.div className="track h-full flex items-center" variants={marqueeVariants2} animate="animate">
                        {content}
                    </m.div>
                </div>
            </div>
        </section>
    );
};

export default Marquee;
