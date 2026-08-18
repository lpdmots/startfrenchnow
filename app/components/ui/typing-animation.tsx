import { cn } from "@/app/lib/schadcn-utils";

interface TypingAnimationProps {
    text: string;
    duration?: number;
    className?: string;
    as?: "p" | "span";
}

export default function TypingAnimation({ text, duration = 200, className, as: Component = "p" }: TypingAnimationProps) {
    const animationDuration = `${Math.max(400, duration * text.length)}ms`;

    return (
        <Component className={cn("font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm", className)}>
            <span
                className="inline-block motion-reduce:![animation:none]"
                style={{
                    animationName: "typing-reveal",
                    animationDuration,
                    animationTimingFunction: `steps(${Math.max(text.length, 1)}, end)`,
                    animationFillMode: "both",
                }}
            >
                {text}
            </span>
        </Component>
    );
}
