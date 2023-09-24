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
