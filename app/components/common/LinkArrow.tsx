"use client";

import React from "react";
import { m } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { HiOutlineArrowRight } from "react-icons/hi";
import { CATEGORIESTEXTCOLORS } from "@/app/lib/constantes";
import { cn } from "@/app/lib/schadcn-utils";

interface Props {
    children: string | JSX.Element;
    url: string;
    target?: string;
    rel?: string;
    category?: string;
    className?: string;
}

function LinkArrow({ children, url, target = "_blank", rel, category, className = "" }: Props) {
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
    const normalizedUrl = (() => {
        if (url.startsWith("#") || url.startsWith("http") || url.startsWith("mailto:") || url.startsWith("tel:")) {
            return url;
        }
        if (url.startsWith("/")) {
            const stripped = url.replace(/^\/(fr|en)(?=\/|$)/, "");
            return stripped === "" ? "/" : stripped;
        }
        return url;
    })();

    return (
        <m.span variants={ParentVariants} whileHover="visible">
            <Link
                href={normalizedUrl}
                className={cn(
                    "inline-block text-[var(--neutral-800)] leading-[20px] font-normal flex items-center text-[var(--neutral-700)] no-underline hover:text-[var(--secondary-2)] w-inline-block",
                    hoverColor,
                    className,
                )}
                target={target}
                rel={rel}
                onClick={(event) => event.stopPropagation()}
            >
                <span className="flex items-center justify-between">
                    <span className="link-text underline mr-1">{children}</span>
                    <m.span className="flex items-center" variants={childrenVariant} style={{ width: 20 }}>
                        <HiOutlineArrowRight />
                    </m.span>
                    <span style={{ width: 15 }}></span>
                </span>
            </Link>
        </m.span>
    );
}

export default LinkArrow;
