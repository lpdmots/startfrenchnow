"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const usePostLang = () => {
    const [lang, setLang] = useState<"fr" | "en">("en");
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        const langParam = searchParams?.get("postLang");
        const langPath = pathname?.split("/")[1];
        setLang(langParam ? (langParam as "fr" | "en") : langPath === "fr" ? "fr" : "en");
    }, [searchParams, pathname]);

    return lang;
};
