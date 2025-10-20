"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next-intl/link";
import { useSfnStore } from "@/app/stores/sfnStore";
import { m } from "framer-motion";
import { HiOutlineArrowRight } from "react-icons/hi";
import { CATEGORIESTEXTCOLORS } from "@/app/lib/constantes";
import { cn } from "@/app/lib/schadcn-utils";

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function LinkToFideExams({ className = "", children = "" }: Props) {
    const selectedLevel = useSfnStore((s) => s.fideExamsSelectedLevel);
    const selectedType = useSfnStore((s) => s.fideExamsSelectedType);

    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    const href = useMemo(() => {
        const base = "/fide/exams";
        if (!hydrated) return base;
        const sp = new URLSearchParams();
        if (selectedLevel && selectedLevel !== "all") sp.set("level", selectedLevel);
        if (selectedType && selectedType !== "all") sp.set("type", selectedType);
        const str = sp.toString();
        return str ? `${base}?${str}` : base;
    }, [selectedLevel, selectedType, hydrated]);

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}

interface LinkArrowProps {
    children: React.ReactNode;
    target?: string;
    rel?: string;
    category?: string;
    className?: string;
}

export function LinkArrowToFideExams({ children, target, rel, category, className = "" }: LinkArrowProps) {
    const ParentVariants = { visible: { transition: { delayChildren: 0 } } };
    const childrenVariant = { visible: { x: 3, transition: { duration: 0.5 } } };
    const hoverColor = "hover:!" + CATEGORIESTEXTCOLORS[(category || "tips") as keyof typeof CATEGORIESTEXTCOLORS];

    // valeurs stockées (souvent un label localisé comme "Toutes" / "Gratuites")
    const selectedLevel = useSfnStore((s) => s.fideExamsSelectedLevel);
    const selectedType = useSfnStore((s) => s.fideExamsSelectedType);

    // éviter le mismatch SSR/CSR
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    const href = useMemo(() => {
        const base = "/fide/exams";
        if (!hydrated) return base;
        const sp = new URLSearchParams();
        if (selectedLevel && selectedLevel !== "all") sp.set("level", selectedLevel);
        if (selectedType && selectedType !== "all") sp.set("type", selectedType);
        const str = sp.toString();
        return str ? `${base}?${str}` : base;
    }, [hydrated, selectedLevel, selectedType]);

    return (
        <m.span variants={ParentVariants} whileHover="visible">
            <Link href={href} className={cn("link-wrapper w-inline-block", hoverColor, className)} target={target} rel={rel} onClick={(e) => e.stopPropagation()}>
                <span className="flex items-center justify-between">
                    <span className="link-text underline mr-1">{children}</span>
                    <m.span className="flex items-center" variants={childrenVariant} style={{ width: 20 }}>
                        <HiOutlineArrowRight />
                    </m.span>
                    <span style={{ width: 15 }} />
                </span>
            </Link>
        </m.span>
    );
}
