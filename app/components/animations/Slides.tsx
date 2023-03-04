"use client";
import { m } from "framer-motion";

interface Props {
    children: JSX.Element;
    duration?: number;
    delay?: number;
}

export const SlideFromBottom = ({ duration, delay, children }: Props) => {
    const slidefromBottom = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: delay || 0.3,
                ease: "easeOut",
                duration: duration || 0.3,
            },
        },
    };

    return (
        <m.div variants={slidefromBottom} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {children}
        </m.div>
    );
};

export const SlideFromRight = ({ duration, delay, children }: Props) => {
    const slidefromRight = {
        hidden: { x: 50, opacity: 0 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: delay || 0.3,
                ease: "easeOut",
                duration: duration || 0.3,
            },
        },
    };

    return (
        <m.div variants={slidefromRight} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {children}
        </m.div>
    );
};

export const SlideFromLeft = ({ duration, delay, children }: Props) => {
    const slidefromRight = {
        hidden: { x: -50, opacity: 0 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: delay || 0.3,
                ease: "easeOut",
                duration: duration || 0.3,
            },
        },
    };

    return (
        <m.div variants={slidefromRight} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {children}
        </m.div>
    );
};
