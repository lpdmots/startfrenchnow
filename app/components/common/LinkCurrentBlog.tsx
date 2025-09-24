"use client";
import React from "react";
import { usePathname } from "next-intl/client";
import Link from "next-intl/link";
import { Locale } from "@/i18n";

interface Props {
    href: string;
    className: string;
    children: React.ReactNode;
    locale: Locale;
}

export const LinkCurrentBlog = ({ href, className, children, locale }: Props) => {
    const pathname = usePathname();

    return (
        <Link href={href} className={`${className} ${pathname === href && "current"}`} locale={locale}>
            {children}
        </Link>
    );
};
