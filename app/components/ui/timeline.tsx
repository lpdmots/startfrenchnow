"use client";
import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { cn } from "@/app/lib/schadcn-utils";

interface TimelineEntry {
    title: string;
    subtitle: React.ReactNode;
    content: React.ReactNode;
    color: string;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (ref.current) {
                setHeight(ref.current.offsetHeight);
            }
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [ref]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 10%", "end 50%"],
    });

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    return (
        <div className="w-full" ref={containerRef}>
            <div className="max-w-3xl">
                <h2 className="display-2">
                    Add <span className="heading-span-secondary-4">some self learning</span> to your study
                </h2>
                <p>
                    Got some extra time? Want to boost your French between lessons and maximize your chances of acing the FIDE exam? With every booking of{" "}
                    <b className="underline">at least 5 lessons</b>, you’ll receive <b className="underline">full access to all my Udemy courses</b>.
                </p>
            </div>

            <div ref={ref} className="relative pb-20">
                {data.map((item, index) => (
                    <div key={index} className="flex justify-start pt-10 md:pt-20 md:gap-10">
                        <div className="sticky flex flex-col md:flex-row z-40 items-start top-40 self-start max-w-lg lg:max-w-xl md:w-full">
                            <div className="h-10 absolute -left-[2px] md:left-[13px] w-10 rounded-full flex items-center justify-center">
                                <div className={cn("bullet", item.color)}></div>
                            </div>
                            <div className="hidden md:block md:pl-20">
                                <h3 className="display-4">{item.title}</h3>
                                <div>{item.subtitle}</div>
                            </div>
                        </div>

                        <div className="relative pl-12 pr-4 md:pl-4 w-full">
                            <div className="md:hidden block mb-4 text-left">
                                <h3 className="display-4">{item.title}</h3>
                                <div>{item.subtitle}</div>
                            </div>
                            {item.content}
                        </div>
                    </div>
                ))}
                <div
                    style={{
                        height: height + "px",
                    }}
                    className="absolute md:left-8 left-4 top-0 overflow-hidden timeline-line"
                >
                    <motion.div
                        style={{
                            height: heightTransform,
                            opacity: opacityTransform,
                        }}
                        className="absolute inset-x-0 top-0 timeline-progress"
                    />
                </div>
            </div>
        </div>
    );
};
