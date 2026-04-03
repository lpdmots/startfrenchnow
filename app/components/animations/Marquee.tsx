"use client";
import React, { useEffect } from "react";
import { m, useAnimation } from "framer-motion";

// 1. Définition des Variants avec une variante initiale
const marqueeInitialVariants = {
    initial: { x: "0vw" },
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
    initial: { x: "0vw" },
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
    initial: { x: "0vw" },
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
    // Utilisation du hook useAnimation au niveau du parent
    const controls = useAnimation();

    // Démarre l'animation au montage du composant
    useEffect(() => {
        controls.start("animate");
    }, [controls]);

    // Gestionnaires d'événements pour le survol
    const handleMouseEnter = () => {
        controls.stop();
    };

    const handleMouseLeave = () => {
        controls.start("animate");
    };

    return (
        <section className="section overflow-hidden pt-[5%] pb-[5%] wf-section">
            <div className="flex justify-around overflow-hidden w-[110%] pt-[60px] pb-[60px] bg-[var(--neutral-800)] [transform:translate(-15px\,_0px)_rotate(-5deg)] max-[767px]:pt-[50px] max-[767px]:pb-[50px] max-[479px]:pt-[40px] max-[479px]:pb-[40px] text-neutral-100 p-3" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="marquee">
                    <m.div className="trackInitial h-full flex items-center" variants={marqueeInitialVariants} initial="initial" animate={controls}>
                        {content}
                    </m.div>
                    <m.div className="track h-full flex items-center" variants={marqueeVariants} initial="initial" animate={controls}>
                        {content}
                    </m.div>
                    <m.div className="track h-full flex items-center" variants={marqueeVariants2} initial="initial" animate={controls}>
                        {content}
                    </m.div>
                </div>
            </div>
        </section>
    );
};

export default Marquee;
