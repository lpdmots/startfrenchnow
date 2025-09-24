"use client";
import { useLocale } from "next-intl";

export const NatureLang = ({ natureLang }: { natureLang: { french: string; english: string } }) => {
    const locale = useLocale() as "fr" | "en";

    const natureString = locale === "fr" ? natureLang.french : natureLang.english;
    return <span>{natureString && "(" + natureString + ")"}</span>;
};
