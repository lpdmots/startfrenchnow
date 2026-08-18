"use client";
import React from "react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Locale } from "@/i18n";
import LinkToFideVideos from "./LinkToFideVideos";
import LinkToFideExams from "./LinkToFideExams";
import clsx from "clsx";
import { isActivePath } from "./navActive";
import { useLocale } from "next-intl";
import { getExplicitLinkLocale } from "@/app/lib/i18n/linkLocale.mjs";

interface Props {
    href: string;
    className: string;
    children: React.ReactNode;
    locale: Locale;
    withParams?: "fide-videos" | "fide-exams";
    matchPrefix?: boolean;
}

export const LinkCurrentBlog = ({ href, className, children, locale, withParams, matchPrefix = true }: Props) => {
    const pathname = usePathname();
    const currentLocale = useLocale() as Locale;
    const isActive = isActivePath(pathname, href, matchPrefix);

    if (withParams === "fide-videos") {
        return <LinkToFideVideos className={clsx(className, isActive && "current")}>{children}</LinkToFideVideos>;
    } else if (withParams === "fide-exams") {
        return <LinkToFideExams className={clsx(className, isActive && "current")}>{children}</LinkToFideExams>;
    }

    return (
        <Link href={href} locale={getExplicitLinkLocale(currentLocale, locale)} className={clsx(className, isActive && "current")}>
            {children}
        </Link>
    );
};
