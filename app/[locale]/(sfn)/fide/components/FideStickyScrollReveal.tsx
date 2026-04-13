"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type FideStickyRevealItem = {
    id: string;
    content: ReactNode;
    media: ReactNode;
    mobileMedia?: ReactNode;
};

export function FideStickyScrollReveal({
    items,
    sectionTitle,
    sectionSubtitle,
    activationOffset = 0.08,
}: {
    items: FideStickyRevealItem[];
    sectionTitle: ReactNode;
    sectionSubtitle: ReactNode;
    activationOffset?: number;
}) {
    const reduceMotion = useReducedMotion();
    const [activeCard, setActiveCard] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;
        if (items.length === 0) return;

        const mql = window.matchMedia("(min-width: 1024px)");
        const getTargetRatio = () => {
            const base = mql.matches ? 0.34 : 0.26;
            return Math.min(0.6, Math.max(0.15, base + activationOffset));
        };
        const getRootMargin = () => (mql.matches ? "-20% 0px -55% 0px" : "-10% 0px -65% 0px");

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((entry) => entry.isIntersecting);
                if (visible.length === 0) return;

                const targetY = window.innerHeight * getTargetRatio();
                const closest = visible.reduce((acc, entry) => {
                    if (!acc) return entry;
                    const distance = Math.abs(entry.boundingClientRect.top - targetY);
                    const bestDistance = Math.abs(acc.boundingClientRect.top - targetY);
                    return distance < bestDistance ? entry : acc;
                }, null as IntersectionObserverEntry | null);

                if (!closest) return;
                const index = itemRefs.current.findIndex((ref) => ref === closest.target);
                if (index >= 0) {
                    setActiveCard((previous) => (previous === index ? previous : index));
                }
            },
            {
                root: null,
                rootMargin: getRootMargin(),
                threshold: [0, 0.25, 0.5, 0.75, 1],
            }
        );

        itemRefs.current.forEach((el) => el && observer.observe(el));

        const handleResize = () => {
            observer.disconnect();
            itemRefs.current.forEach((el) => el && observer.observe(el));
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            observer.disconnect();
        };
    }, [items.length, activationOffset]);

    return (
        <div className="max-w-7xl m-auto px-4 lg:px-8">
            <div className="text-center mb-10">
                <h2 className="display-2 mb-4 lg:mb-8">{sectionTitle}</h2>
                <p className="mb-0">{sectionSubtitle}</p>
            </div>

            <div ref={containerRef} className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-20 lg:gap-24">
                    {items.map((item, index) => {
                        const isActive = activeCard === index;
                        return (
                            <article
                                id={item.id}
                                key={item.id}
                                className="scroll-mt-28"
                                ref={(el) => {
                                    itemRefs.current[index] = el;
                                }}
                            >
                                <div className="mb-5 lg:hidden">{item.mobileMedia ?? item.media}</div>

                                <motion.div
                                    initial={false}
                                    animate={{
                                        opacity: isActive ? 1 : 0.45,
                                        y: reduceMotion ? 0 : isActive ? 0 : 6,
                                    }}
                                    transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
                                    className={`pl-4 md:pl-6 border-l-4 ${isActive ? "border-secondary-6" : "border-neutral-300"}`}
                                >
                                    {item.content}
                                </motion.div>
                            </article>
                        );
                    })}
                </div>

                <div className="hidden lg:block">
                    <div className="sticky top-24">
                        <motion.div
                            key={items[activeCard]?.id}
                            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
                        >
                            {items[activeCard]?.media}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
