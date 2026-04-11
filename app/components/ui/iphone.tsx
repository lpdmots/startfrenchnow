import Image from "next/image";
import { cn } from "@/app/lib/schadcn-utils";

type IphoneProps = {
    src: string;
    alt?: string;
    className?: string;
    imageClassName?: string;
    notchClassName?: string;
    sizes?: string;
    priority?: boolean;
};

export function Iphone({ src, alt = "Mobile preview", className, imageClassName, notchClassName, sizes = "240px", priority = false }: IphoneProps) {
    return (
        <div
            className={cn(
                "relative aspect-[9/20] w-[240px] overflow-hidden rounded-[2.8rem] border-[10px] border-neutral-800 bg-neutral-800 p-1.5 shadow-[0_20px_45px_-24px_rgba(0,0,0,0.55)]",
                className
            )}
        >
            <div className={cn("absolute left-1/2 top-2.5 z-10 h-5 w-28 -translate-x-1/2 rounded-full bg-neutral-800", notchClassName)} />
            <div className="h-full overflow-hidden rounded-[2.2rem] bg-neutral-100">
                <Image src={src} alt={alt} width={700} height={1400} sizes={sizes} priority={priority} className={cn("h-full w-full object-cover object-top", imageClassName)} />
            </div>
        </div>
    );
}
