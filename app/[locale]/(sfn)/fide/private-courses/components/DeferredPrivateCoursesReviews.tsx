"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { NextIntlClientProvider, useLocale, useMessages } from "next-intl";

function ReviewsPlaceholder() {
    return <div className="w-full min-h-[560px] rounded-2xl bg-neutral-200/70" />;
}

const ReviewsFide = dynamic(() => import("../../components/ReviewsFide").then((module) => module.ReviewsFide), {
    ssr: false,
    loading: () => <ReviewsPlaceholder />,
});

export function DeferredPrivateCoursesReviews() {
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
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ReviewsFide />
                </NextIntlClientProvider>
            ) : (
                <ReviewsPlaceholder />
            )}
        </div>
    );
}
