"use client";

import React from "react";
import { m } from "framer-motion";
import Link from "next-intl/link";
import { HiOutlineArrowRight } from "react-icons/hi";
import { CATEGORIESTEXTCOLORS } from "@/app/lib/constantes";

interface Props {
    children: string | JSX.Element;
    url: string;
    target?: string;
    rel?: string;
    category?: string;
}

function LinkArrow({ children, url, target = "_blank", rel, category }: Props) {
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

    const hoverColor = "hover:!" + CATEGORIESTEXTCOLORS[(category || "tips") as keyof typeof CATEGORIESTEXTCOLORS];
    const className = `link-wrapper w-inline-block ${hoverColor}`;

    return (
        <m.span variants={ParentVariants} whileHover="visible">
            <Link href={url} className={className} target={target} rel={rel} onClick={(event) => event.stopPropagation()}>
                <span className="flex items-center justify-between">
                    <span className="link-text underline mr-1">{children}</span>
                    <m.span variants={childrenVariant} style={{ width: 10 }}>
                        <HiOutlineArrowRight />
                    </m.span>
                    <span style={{ width: 15 }}></span>
                </span>
            </Link>
        </m.span>
    );
}

export default LinkArrow;
