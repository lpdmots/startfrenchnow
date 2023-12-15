"use client";
import { usePostLang } from "@/app/hooks/usePostLang";

export const NaturePostLang = ({ natureLang }: { natureLang: { french: string; english: string } }) => {
    const postLang = usePostLang();
    const natureString = postLang === "fr" ? natureLang.french : natureLang.english;
    return <span>{natureString && "(" + natureString + ")"}</span>;
};
