"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next-intl/client";
import { useLocale } from "next-intl";

const BlogLangFixedButton: React.FC = () => {
    const locale = useLocale() as "fr" | "en";
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const onScroll = () => setIsVisible(window.scrollY > 300);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleToggleLanguage = () => {
        const nextLocale: "fr" | "en" = locale === "fr" ? "en" : "fr";
        router.replace(pathname, { locale: nextLocale });
    };

    if (!isVisible) return null;

    return (
        <button
            className="fixed bottom-14 md:bottom-20 right-4 roundButton small z-50"
            style={{
                backgroundColor: "transparent",
                boxShadow: "0px 0px 5px 0 var(--neutral-500)",
                opacity: 1,
                padding: 0,
                overflow: "hidden",
            }}
            onClick={handleToggleLanguage}
            aria-label="Changer la langue"
        >
            {locale === "fr" ? (
                <Image src="/images/royaume-uni.png" height={70} width={70} alt="UK flag" style={{ height: "100%", objectFit: "cover" }} />
            ) : (
                <Image src="/images/france.png" height={70} width={70} alt="French flag" style={{ height: "100%", objectFit: "cover" }} />
            )}
        </button>
    );
};

export default BlogLangFixedButton;
