"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const ExamsSection = dynamic(() => import("../../components/ExamsSection"), {
    ssr: false,
    loading: () => <div className="h-[980px] w-full bg-neutral-200" />,
});

export function DeferredPackFideExamsSection() {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { data: session } = useSession();
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");

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
            {isVisible ? <ExamsSection hasPack={hasPack} headingSpanClassName="heading-span-secondary-6" /> : <div className="h-[980px] w-full bg-neutral-200" />}
        </div>
    );
}
