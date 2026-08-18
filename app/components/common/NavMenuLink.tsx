"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import clsx from "clsx";
import { Locale } from "@/i18n";
import { isActivePath } from "./navActive";
import { useLocale } from "next-intl";
import { getExplicitLinkLocale } from "@/app/lib/i18n/linkLocale.mjs";

type Props = {
    href: string;
    locale: Locale;
    children: React.ReactNode;
    className?: string;
    activeMatch?: string[];
    matchPrefix?: boolean;
};

export const NavMenuLink = ({ href, locale, children, className, activeMatch, matchPrefix = true }: Props) => {
    const pathname = usePathname();
    const currentLocale = useLocale() as Locale;
    const matchList = activeMatch && activeMatch.length > 0 ? activeMatch : [href];
    const isActive = matchList.some((match) => isActivePath(pathname, match, matchPrefix));

    return (
        <Link
            href={href}
            locale={getExplicitLinkLocale(currentLocale, locale)}
            aria-current={isActive ? "page" : undefined}
            className={clsx("header-nav-trigger", className, isActive && "current")}
        >
            {children}
        </Link>
    );
};
