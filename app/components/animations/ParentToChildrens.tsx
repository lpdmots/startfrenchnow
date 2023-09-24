"use client";
import { m } from "framer-motion";

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
        <m.div className="h-full" variants={parentToChildrens} whileHover="visible" viewport={{ once: true }}>
            {children}
        </m.div>
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

    return <m.div variants={parentScaleChildren}>{children}</m.div>;
};

export const SlideInOneByOneParent = ({ children }: Props) => {
    const fadeInOneByOneParent = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.3,
                duration: 0.5,
                delayChildren: 1,
                staggerChildren: 0.1,
            },
        },
    };
    return (
        <m.div variants={fadeInOneByOneParent} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ maxWidth: "100%" }}>
            {children}
        </m.div>
    );
};

export const SlideInOneByOneChild = ({ children }: Props) => {
    const fadeInOneByOneItem = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
    };
    return (
        <m.div variants={fadeInOneByOneItem} className="h-full" style={{ maxWidth: "100%" }}>
            {children}
        </m.div>
    );
};
