import { cn } from "@/app/lib/schadcn-utils";
import React, { CSSProperties } from "react";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    variant?: "primary" | "secondary";
    className?: string;
    children?: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
    (
        {
            shimmerColor = "var(--neutral-100)",
            shimmerSize = "0.05em",
            shimmerDuration = "3s",
            borderRadius = "15px",
            background = "var(--neutral-800)",
            variant = "primary",
            className,
            children,
            ...props
        },
        ref
    ) => {
        const isSecondary = variant === "secondary";
        if (isSecondary) {
            shimmerColor = "var(--neutral-800)";
            background = "var(--neutral-100)";
        }

        return (
            <button
                style={
                    {
                        "--spread": "90deg",
                        "--shimmer-color": shimmerColor,
                        "--radius": borderRadius,
                        "--speed": shimmerDuration,
                        "--cut": shimmerSize,
                        "--bg": background,
                    } as CSSProperties
                }
                className={cn(
                    isSecondary && "border-neutral-100",
                    "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap",
                    "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
                    className,
                    isSecondary ? "btn-secondary hover:bg-secondary-2 hover:border-secondary-2 hover:text-neutral-800 hover:border-2" : "btn-primary"
                )}
                ref={ref}
                {...props}
            >
                {/* spark container */}
                <div className={cn("-z-30 blur-[2px]", "absolute inset-0 overflow-visible [container-type:size]")}>
                    {/* spark */}
                    <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
                        {/* spark before */}
                        <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
                    </div>
                </div>
                {children}

                {/* Highlight */}
                <div
                    className={cn(
                        "insert-0 absolute size-full",

                        "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",

                        // transition
                        "transform-gpu transition-all duration-300 ease-in-out",

                        // on hover
                        "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",

                        // on click
                        "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
                    )}
                />

                {/* backdrop */}
                <div className={cn("absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]")} />
            </button>
        );
    }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
