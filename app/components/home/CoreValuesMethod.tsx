"use client";
import React from "react";
import { motion } from "framer-motion";
import { fadeInOneByOneItem, fadeInOneByOneParent } from "@/lib/framerVariants";

const coreValuesData = [
    {
        image: "/images/hard-work-image-paperfolio-webflow-template.png",
        title: "Serious",
        content: "A structured and serious method where the student feel guided and supported all along.",
    },
    {
        image: "/images/innovation-image-paperfolio-webflow-template.png",
        title: "Smart learning",
        content: "New concepts are well identified, difficulties are isolated, explained, worked on and gradually integrated with your current knowledge.",
    },
    {
        image: "/images/fun-image-paperfolio-webflow-template.png",
        title: "Fun",
        content: "Serious but fun! The courses are interactive and entertaining with attractive and modern visuals. Be prepared to actively participate.",
    },
    {
        image: "/images/growth-image-paperfolio-webflow-template.png",
        title: "A full method",
        content:
            "A complete method with access to extensive resources: extra exercises, vocabulary sheets and a quality blog. Quizzes, and amazing French stories where you are the hero are coming soon.",
    },
];

function CoreValuesMethod() {
    return (
        <motion.div className="container-default w-container" variants={fadeInOneByOneParent} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inner-container _600px---tablet center">
                <div className="inner-container _500px---mbl center">
                    <div className="mg-bottom-54px">
                        <div className="text-center---tablet">
                            <div className="w-layout-grid grid-2-columns title-and-paragraph">
                                <div className="inner-container _525px">
                                    <div className="inner-container _400px---mbl center">
                                        <div className="inner-container _350px---mbp center">
                                            <h2 className="display-2 mg-bottom-0">
                                                The core values of <span className="heading-span-secondary-4">my method</span>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="inner-container _525px">
                                    <p className="mg-bottom-0 text-neutral-700">
                                        A <span className="underline underline-offset-2">well structured</span> method with <span className="underline underline-offset-2">bite-sized lessons</span>{" "}
                                        that enables you to acquire the <span className="underline underline-offset-2">fundamental</span> French language skills.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-layout-grid grid-2-columns values-grid">
                        {coreValuesData.map(({ image, title, content }) => (
                            <motion.div key={title} variants={fadeInOneByOneItem} className="card image-left---text-rigth">
                                <div className="image-wrapper card-value-image-left-wrapper">
                                    <img src={image} loading="eager" alt={title} className="image fit-cover" />
                                </div>
                                <div className="card-value-conter-left">
                                    <h3>{title}</h3>
                                    <p className="mg-bottom-0">{content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default CoreValuesMethod;
