"use client";
import React from "react";
import Link from "next-intl/link";
import { usePathname } from "next-intl/client";

interface Props {
    href: string;
    className: string;
    children: React.ReactNode;
}

export const LinkCurrent = ({ href, className, children }: Props) => {
    const pathname = usePathname();

    return (
        <Link href={href} className={`${className} ${pathname === href && "current"}`}>
            {children}
        </Link>
    );
};

export const LinkTranslation = ({ href, children }: { href: string; children: JSX.Element }) => {
    return (
        <Link
            href={href}
            target="_blank"
            style={{ lineHeight: 0, display: "inline-block", transition: "transform 0.3s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
            {children}
        </Link>
    );
};
