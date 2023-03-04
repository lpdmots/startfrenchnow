"use client";
import { m } from "framer-motion";

interface Props {
    children: JSX.Element;
    duration?: number;
    delay?: number;
    className?: string;
}

export const Scale = ({ duration, delay, className, children }: Props) => {
    const slidefromBottom = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                delay: delay || 0.3,
                duration: duration || 0.2,
            },
        },
    };

    return (
        <m.div className={className} variants={slidefromBottom} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {children}
        </m.div>
    );
};
