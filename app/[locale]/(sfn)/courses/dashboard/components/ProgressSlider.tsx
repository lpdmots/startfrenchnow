"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/app/lib/schadcn-utils";

// Ajout de la prop personnalisée `displayValue`
interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    displayValue?: boolean;
    color?: string;
    hours?: {
        single: string;
        plural: string;
    };
}

const ProgressSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(({ className, displayValue, color, ...props }, ref) => (
    <SliderPrimitive.Root ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-neutral-400">
            <SliderPrimitive.Range className={cn("absolute h-full", `bg-${color}` || "bg-secondary-2")} />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
            className="relative block h-5 w-5 rounded-full bg-neutral-200 transition-colors pointer-events-none focus-visible:outline-none"
            style={{ border: "2px solid var(--neutral-800)" }}
        >
            {props.value && displayValue && (
                <div
                    className="absolute -top-16 left-[10px] bg-neutral-100 px-2 py-2 rounded-xl text-sm"
                    style={{
                        transform: "translateX(-50%)",
                        border: "2px solid var(--neutral-800)",
                    }}
                >
                    <p className="mb-0 text-xl text-center font-bold">{props.value[0]}%</p>
                </div>
            )}
        </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
));
ProgressSlider.displayName = SliderPrimitive.Root.displayName;

export { ProgressSlider };
