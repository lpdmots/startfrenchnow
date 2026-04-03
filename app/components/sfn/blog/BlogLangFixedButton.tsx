"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useConsentBannerOffset } from "@/app/hooks/useConsentBannerOffset";

interface Props {
    suppressed?: boolean;
}

const BlogLangFixedButton: React.FC<Props> = ({ suppressed = false }) => {
    const locale = useLocale() as "fr" | "en";
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const consentOffset = useConsentBannerOffset();
    const stickyBottom = consentOffset + 16;

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
            className="fixed bottom-4 right-4 roundButton small z-50"
            style={{
                backgroundColor: "transparent",
                boxShadow: "0px 0px 5px 0 var(--neutral-500)",
                opacity: suppressed ? 0 : 1,
                padding: 0,
                overflow: "hidden",
                transform: suppressed ? "translateY(8px)" : "translateY(0)",
                pointerEvents: suppressed ? "none" : "auto",
                transition: "opacity 200ms ease, transform 200ms ease",
                bottom: stickyBottom,
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
