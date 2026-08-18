"use client";
import { m, useReducedMotion } from "framer-motion";

interface Props {
    children: JSX.Element;
    duration?: number;
    delay?: number;
}

export const Fade = ({ duration, delay, children }: Props) => {
    const shouldReduceMotion = useReducedMotion();
    const slidefromBottom = {
        hidden: { opacity: shouldReduceMotion ? 1 : 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: shouldReduceMotion ? 0 : delay || 0.3,
                duration: shouldReduceMotion ? 0 : duration || 0.3,
            },
        },
    };

    return (
        <m.div variants={slidefromBottom} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {children}
        </m.div>
    );
};
