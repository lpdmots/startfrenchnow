"use client";
import { motion } from "framer-motion";

interface Props {
    children: JSX.Element;
    delayChildren?: number;
    staggerChildren?: number;
}

export const ParentToChildrens = ({ delayChildren, staggerChildren, children }: Props) => {
    const parentToChildrens = {
        visible: {
            transition: {
                delayChildren: delayChildren || 0.1,
                staggerChildren: staggerChildren || 0.1,
            },
        },
    };

    return (
        <motion.div className="h-full" variants={parentToChildrens} whileHover="visible" viewport={{ once: true }}>
            {children}
        </motion.div>
    );
};

interface ScaleProps {
    scale?: number;
    children: JSX.Element;
    duration?: number;
}

export const ScaleChildren = ({ scale, duration, children }: ScaleProps) => {
    const parentScaleChildren = {
        hidden: { scale: 1 },
        visible: {
            scale: scale || 1.1,
            transition: {
                duration: duration || 0.3,
            },
        },
    };

    return <motion.div variants={parentScaleChildren}>{children}</motion.div>;
};
