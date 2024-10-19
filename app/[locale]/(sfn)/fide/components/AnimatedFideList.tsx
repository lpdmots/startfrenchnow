"use client";

import { AnimatedList } from "@/app/components/ui/animated-list";
import { cn } from "@/app/lib/schadcn-utils";

let COMPETENCES = [
    {
        description: "6+ years of experience as a FIDE expert.",
        icon: "🎓",
        color: "#00C9A7",
    },
    {
        description: "100+ students who passed successfully their FIDE.",
        icon: "🎉",
        color: "#FF3D71",
    },
    {
        description: "15 years of teaching French for Foreigners.",
        icon: "📚",
        color: "#FFB800",
    },
    {
        description: "Top Udemy Instructor of French.",
        icon: "🏅",
        color: "#1E86FF",
    },
];

COMPETENCES = Array.from({ length: 10 }, () => COMPETENCES).flat();

interface Competence {
    description: string;
    icon: string;
    color: string;
}

const CompetenceCard = ({ description, icon, color }: Competence) => {
    return (
        <figure className="border-2 border-solid border-neutral-500 shadow-md p-4 lg:p-8 rounded-xl relative mx-auto w-full cursor-pointer overflow-hidden m-0 transition-all duration-200 ease-in-out hover:scale-[103%] h-[110px] lg:h-[132px] bg-neutral-800 color-neutral-100">
            <div className="grid grid-cols-4 w-full gap-4 place-items-center">
                <div
                    className="flex size-16 items-center justify-center rounded-2xl col-span-1"
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <span className="text-xl lg:text-3xl">{icon}</span>
                </div>
                <p className="text-md lg:text-lg col-span-3 mb-0 h-full flex items-center w-full">{description}</p>
            </div>
        </figure>
    );
};

export function AnimatedListDemo({ className }: { className?: string }) {
    return (
        <div className={cn("relative flex h-[238px] lg:h-[285px] w-full flex-col overflow-hidden", className)}>
            <AnimatedList delay={3000}>
                {COMPETENCES.map((item, idx) => (
                    <CompetenceCard {...item} key={idx} />
                ))}
            </AnimatedList>
        </div>
    );
}
