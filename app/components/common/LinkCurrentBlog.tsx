"use client";
import React from "react";
import { usePathname } from "next-intl/client";
import Link from "next-intl/link";
import { Locale } from "@/i18n";
import LinkToFideVideos from "./LinkToFideVideos";
import LinkToFideExams from "./LinkToFideExams";

interface Props {
    href: string;
    className: string;
    children: React.ReactNode;
    locale: Locale;
    withParams?: "fide-videos" | "fide-exams";
}

export const LinkCurrentBlog = ({ href, className, children, locale, withParams }: Props) => {
    const pathname = usePathname();

    if (withParams === "fide-videos") {
        return <LinkToFideVideos className={`${className} ${pathname === href && "current"}`}>{children}</LinkToFideVideos>;
    } else if (withParams === "fide-exams") {
        return <LinkToFideExams className={`${className} ${pathname === href && "current"}`}>{children}</LinkToFideExams>;
    }

    return (
        <Link href={href} className={`${className} ${pathname === href && "current"}`} locale={locale}>
            {children}
        </Link>
    );
};
