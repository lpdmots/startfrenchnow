"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { NextIntlClientProvider, useLocale, useMessages } from "next-intl";

function HowClassLookPlaceholder() {
    return <div className="w-full min-h-[820px] rounded-2xl bg-neutral-700/40" />;
}

const HowClassLook = dynamic(() => import("../../components/HowClassLook"), {
    ssr: false,
    loading: () => <HowClassLookPlaceholder />,
});

export function DeferredPrivateCoursesHowClassLook() {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const locale = useLocale();
    const messages = useMessages() as Record<string, unknown>;

    useEffect(() => {
        const node = containerRef.current;
        if (!node || isVisible) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "450px 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [isVisible]);

    return (
        <div ref={containerRef}>
            {isVisible ? (
                <NextIntlClientProvider locale={locale} messages={{ ...messages, Fide: messages }}>
                    <HowClassLook />
                </NextIntlClientProvider>
            ) : (
                <HowClassLookPlaceholder />
            )}
        </div>
    );
}
