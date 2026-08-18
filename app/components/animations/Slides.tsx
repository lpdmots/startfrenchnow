"use client";
import { m, useReducedMotion } from "framer-motion";

interface Props {
    children: JSX.Element;
    duration?: number;
    delay?: number;
    delayChildren?: number;
    width?: string;
    onVisible?: (visible: boolean) => void;
}

export const SlideFromBottom = ({ duration, delay, children }: Props) => {
    const shouldReduceMotion = useReducedMotion();
    const slidefromBottom = {
        hidden: shouldReduceMotion ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: shouldReduceMotion ? 0 : delay || 0.3,
                ease: "easeOut",
                duration: shouldReduceMotion ? 0 : duration || 0.3,
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
    const shouldReduceMotion = useReducedMotion();
    const slidefromRight = {
        hidden: shouldReduceMotion ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: shouldReduceMotion ? 0 : delay || 0.3,
                ease: "easeOut",
                duration: shouldReduceMotion ? 0 : duration || 0.3,
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
    const shouldReduceMotion = useReducedMotion();
    const slidefromRight = {
        hidden: shouldReduceMotion ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: shouldReduceMotion ? 0 : delay || 0.3,
                ease: "easeOut",
                duration: shouldReduceMotion ? 0 : duration || 0.3,
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
    const shouldReduceMotion = useReducedMotion();
    const fadeInOneByOneParent = {
        hidden: { opacity: shouldReduceMotion ? 1 : 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: shouldReduceMotion ? 0 : delay,
                duration: shouldReduceMotion ? 0 : duration,
                delayChildren: shouldReduceMotion ? 0 : delayChildren,
                staggerChildren: shouldReduceMotion ? 0 : 0.1,
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
    const shouldReduceMotion = useReducedMotion();
    const fadeInOneByOneItem = {
        hidden: shouldReduceMotion ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: shouldReduceMotion ? 0 : duration,
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
