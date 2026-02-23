"use client";

import React from "react";
import Link from "next-intl/link";
import { usePathname } from "next-intl/client";
import clsx from "clsx";
import { Locale } from "@/i18n";
import { isActivePath } from "./navActive";

type Props = {
    href: string;
    locale: Locale;
    children: React.ReactNode;
    className?: string;
    activeMatch?: string[];
};

export const NavMenuLink = ({ href, locale, children, className, activeMatch }: Props) => {
    const pathname = usePathname();
    const matchList = activeMatch && activeMatch.length > 0 ? activeMatch : [href];
    const isActive = matchList.some((match) => isActivePath(pathname, match, true));

    return (
        <Link
            href={href}
            locale={locale}
            aria-current={isActive ? "page" : undefined}
            className={clsx("header-nav-trigger", className, isActive && "current")}
        >
            {children}
        </Link>
    );
};
