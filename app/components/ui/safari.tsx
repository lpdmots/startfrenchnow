import Image from "next/image";
import { cn } from "@/app/lib/schadcn-utils";

type SafariProps = {
    imageSrc: string;
    alt?: string;
    url?: string;
    className?: string;
    imageClassName?: string;
    sizes?: string;
    priority?: boolean;
};

export function Safari({ imageSrc, alt = "Browser preview", url = "startfrenchnow.com", className, imageClassName, sizes = "100vw", priority = false }: SafariProps) {
    return (
        <div className={cn("relative w-full overflow-hidden rounded-[1.35rem] border border-neutral-400 bg-neutral-100 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.45)]", className)}>
            <div className="flex h-10 items-center gap-2 border-b border-neutral-400 bg-neutral-200 px-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div className="ml-2 flex h-6 flex-1 items-center rounded-md border border-neutral-400 bg-neutral-100 px-2">
                    <p className="mb-0 truncate text-[11px] font-medium text-neutral-600">{url}</p>
                </div>
            </div>
            <Image src={imageSrc} alt={alt} width={1600} height={1000} sizes={sizes} priority={priority} className={cn("h-auto w-full object-cover object-top", imageClassName)} />
        </div>
    );
}
