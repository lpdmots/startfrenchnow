"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next-intl/link";
import { useSfnStore } from "@/app/stores/sfnStore";
import { m } from "framer-motion";
import { HiOutlineArrowRight } from "react-icons/hi";
import { CATEGORIESTEXTCOLORS } from "@/app/lib/constantes";
import { cn } from "@/app/lib/schadcn-utils";

type PackageMap = { title: string; referenceKey: string };

type Props = {
    className?: string;
    children?: React.ReactNode;
    packagesMap?: PackageMap[];
    defaultKey?: string;
};

export default function LinkToFideVideos({ className = "", children = "", packagesMap, defaultKey = "all" }: Props) {
    const selectedKey = useSfnStore((s) => s.fideVideosSelectedPackage);
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    const packageKey = useMemo(() => {
        if (!hydrated) return undefined;
        return selectedKey ?? defaultKey;
    }, [hydrated, selectedKey, defaultKey, packagesMap]);

    const href = useMemo(() => {
        if (!packageKey || packageKey === "all") return "/fide/videos";
        const sp = new URLSearchParams({ package: packageKey });
        return `/fide/videos?${sp.toString()}`;
    }, [packageKey]);

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

export function LinkArrowToFideVideos({ children, target, rel, category, className = "" }: LinkArrowProps) {
    const ParentVariants = { visible: { transition: { delayChildren: 0 } } };
    const childrenVariant = { visible: { x: 3, transition: { duration: 0.5 } } };
    const hoverColor = "hover:!" + CATEGORIESTEXTCOLORS[(category || "tips") as keyof typeof CATEGORIESTEXTCOLORS];

    // valeur stockée (souvent un label localisé comme "Toutes" / "Gratuites")
    const selectedTitle = useSfnStore((s) => s.fideVideosSelectedPackage);

    // éviter le mismatch SSR/CSR
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    // mappe quelques cas courants titre -> key ; si tu stockes déjà la key, on la reprend telle quelle
    const toPackageKey = (val?: string): string | undefined => {
        if (!val) return undefined;
        const t = val.trim().toLowerCase();
        if (t === "all" || t === "toutes") return "all";
        if (t === "free" || t === "gratuites") return "free";
        // si le store contient déjà une key (ex: "core", "essentials"), on la renvoie
        return t;
    };

    const href = useMemo(() => {
        const base = "/fide/videos";
        if (!hydrated) return base;
        const key = toPackageKey(selectedTitle);
        if (!key || key === "all") return base;
        return `${base}?package=${encodeURIComponent(key)}`;
    }, [hydrated, selectedTitle]);

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
