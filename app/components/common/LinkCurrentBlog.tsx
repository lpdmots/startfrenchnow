"use client";
import React from "react";
import { usePathname } from "next-intl/client";
import Link from "next-intl/link";
import { Locale } from "@/i18n";
import LinkToFideVideos from "./LinkToFideVideos";
import LinkToFideExams from "./LinkToFideExams";
import clsx from "clsx";
import { isActivePath } from "./navActive";

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
    const isActive = isActivePath(pathname, href, matchPrefix);

    if (withParams === "fide-videos") {
        return <LinkToFideVideos className={clsx(className, isActive && "current")}>{children}</LinkToFideVideos>;
    } else if (withParams === "fide-exams") {
        return <LinkToFideExams className={clsx(className, isActive && "current")}>{children}</LinkToFideExams>;
    }

    return (
        <Link href={href} className={clsx(className, isActive && "current")} locale={locale}>
            {children}
        </Link>
    );
};
