"use client";
import { motion } from "framer-motion";

interface Props {
    children: JSX.Element;
    duration?: number;
    delay?: number;
}

export const Fade = ({ duration, delay, children }: Props) => {
    const slidefromBottom = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: delay || 0.3,
                duration: duration || 0.3,
            },
        },
    };

    return (
        <motion.div variants={slidefromBottom} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {children}
        </motion.div>
    );
};
