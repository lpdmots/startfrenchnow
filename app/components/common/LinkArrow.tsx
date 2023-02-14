"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";

function LinkArrow({ children }: { children: string | JSX.Element }) {
    const ParentVariants = {
        visible: {
            transition: {
                delayChildren: 0,
            },
        },
    };

    const childrenVariant = {
        visible: {
            x: 3,
            transition: { duration: 0.5 },
        },
    };

    return (
        <motion.span variants={ParentVariants} whileHover="visible">
            <Link href="https://www.udemy.com/course/french-for-beginners-a1/" className="link-wrapper w-inline-block">
                <span className="flex items-center justify-between">
                    <span className="link-text underline mr-1">{children}</span>
                    <motion.span variants={childrenVariant} style={{ width: 10 }}>
                        <HiOutlineArrowRight />
                    </motion.span>
                    <span style={{ width: 15 }}></span>
                </span>
            </Link>
        </motion.span>
    );
}

export default LinkArrow;
