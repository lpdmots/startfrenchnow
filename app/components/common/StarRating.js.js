"use client";
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { FaStar, FaRegStar } from "react-icons/fa";

const starVariants = {
    initial: {
        scale: 0,
    },
    animate: (i) => ({
        scale: 1,
        transition: {
            delay: i * 0.04,
            duration: 0.25,
            type: "spring",
            stiffness: 175,
        },
    }),
    exit: (i) => ({
        scale: 0,
        transition: {
            duration: 0.25,
            delay: 0.2 - i * 0.04,
        },
    }),
    hovered: {
        scale: 1.2,
        transition: {
            duration: 0.2,
        },
    },
};

const Star = ({ i, isHoveringWrapper, isClicked }) => {
    const [isHovering, setIsHovering] = useState(false);
    const starControls = useAnimation();
    const backgroundControls = useAnimation();
    useEffect(() => {
        if (isHovering) starControls.start("hovered");
        else if (isClicked) starControls.start("animate");
        else starControls.start("exit");
    }, [isClicked, isHovering]);
    useEffect(() => {
        if (isHoveringWrapper) backgroundControls.start({ background: "var(--primary)" });
        else backgroundControls.start({ background: "var(--neutral-200)" });
    }, [isHoveringWrapper]);
    return (
        <div>
            <motion.div
                whileHover={{
                    scale: 1.2,
                    transition: { duration: 0.2 },
                }}
                className="absolute cursor-pointer"
                style={{ zIndex: !isHovering && !isClicked ? 10 : -5 }}
            >
                <FaRegStar />
            </motion.div>
            <motion.div
                className="cursor-pointer"
                onMouseOver={() => setIsHovering(true)}
                onMouseOut={() => setIsHovering(false)}
                variants={starVariants}
                initial="initial"
                animate={starControls}
                custom={i}
            >
                <FaStar />
            </motion.div>
        </div>
    );
};

export const StarRating = ({ starIndex, handleStarIndex, ObjectKey }) => {
    const [isHovering, setIsHovering] = useState(0);

    return (
        <div className="w-full h-full grid place-items-center">
            <div className="text-primary text-2xl sm:text-3xl lg:text-4xl grid grid-cols-5 gap-2 lg:gap-4">
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div onMouseOver={() => setIsHovering(i)} onClick={() => handleStarIndex(i, ObjectKey)} key={i}>
                        <Star i={i} isHoveringWrapper={isHovering >= i} isClicked={starIndex >= i} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
