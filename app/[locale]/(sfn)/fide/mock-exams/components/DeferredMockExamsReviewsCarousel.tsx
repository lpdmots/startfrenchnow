"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { sharedFideReviews } from "../../components/ReviewsFide";

const CarouselReviews = dynamic(() => import("@/app/components/common/CarouselReviews.tsx/CarouselReviews").then((module) => module.CarouselReviews), {
    ssr: false,
    loading: () => <div className="h-[470px] w-full rounded-2xl bg-neutral-200/70" />,
});

export function DeferredMockExamsReviewsCarousel() {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

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
            { rootMargin: "500px 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [isVisible]);

    const sortedComments = useMemo(() => [...sharedFideReviews].sort((a, b) => (b.date ?? 0) - (a.date ?? 0)), []);

    return (
        <div ref={containerRef} className="relative mt-8 min-h-[470px]">
            {isVisible ? <CarouselReviews comments={sortedComments} /> : <div className="h-[470px] w-full rounded-2xl bg-neutral-200/70" />}
            <div className="h-20 lg:hidden" />
        </div>
    );
}
