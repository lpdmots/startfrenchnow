"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
