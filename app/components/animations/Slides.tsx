"use client";
import { m } from "framer-motion";

interface Props {
    children: JSX.Element;
    duration?: number;
    delay?: number;
    delayChildren?: number;
    width?: string;
    onVisible?: (visible: boolean) => void;
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
        <m.div className="w-full h-full" variants={slidefromBottom} initial="hidden" whileInView="visible" viewport={{ once: true }}>
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
        <m.div className="w-full h-full" variants={slidefromRight} initial="hidden" whileInView="visible" viewport={{ once: true }}>
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

export const SlideInOneByOneParent = ({ duration = 0.5, delay = 0.3, delayChildren = 1, onVisible, children }: Props) => {
    const fadeInOneByOneParent = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay,
                duration,
                delayChildren,
                staggerChildren: 0.1,
                onComplete: () => {
                    if (onVisible) {
                        onVisible(true);
                    }
                },
            },
        },
    };

    return (
        <m.div className="w-full" variants={fadeInOneByOneParent} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {children}
        </m.div>
    );
};

export const SlideInOneByOneChild = ({ duration = 0.5, width = "100%", children }: Props) => {
    const fadeInOneByOneItem = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration,
                ease: "easeOut",
            },
        },
    };

    return (
        <m.div variants={fadeInOneByOneItem} className="h-full" style={{ width }}>
            {children}
        </m.div>
    );
};
