"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

function Placeholder() {
    return (
        <div className="flex justify-center">
            <div className="relative w-full overflow-hidden bg-neutral-200 h-[500px] max-[768px]:h-[800px]" style={{ maxWidth: 1300 }} />
        </div>
    );
}

const MarqueeSocial = dynamic(() => import("./MarqueeSocial").then((module) => module.MarqueeSocial), {
    ssr: false,
    loading: () => <Placeholder />,
});

export function DeferredMarqueeSocial({ locale }: { locale: string }) {
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
            { rootMargin: "600px 0px" },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [isVisible]);

    return <div ref={containerRef}>{isVisible ? <MarqueeSocial locale={locale} /> : <Placeholder />}</div>;
}
