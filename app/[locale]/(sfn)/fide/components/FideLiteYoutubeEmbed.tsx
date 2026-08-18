"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

type FideLiteYoutubeEmbedProps = {
    id: string;
    title: string;
};

export function FideLiteYoutubeEmbed({ id, title }: FideLiteYoutubeEmbedProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const locale = useLocale();
    const playAction = locale === "fr" ? "Lire la vidéo" : "Play video";

    return (
        <div className="cms-featured-image-wrapper image-wrapper relative mx-auto aspect-video w-full overflow-hidden rounded-2xl bg-neutral-800 p-0">
            {isPlaying ? (
                <iframe
                    className="absolute inset-0 h-full w-full border-0"
                    src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            ) : (
                <button
                    type="button"
                    className="group absolute inset-0 h-full w-full cursor-pointer border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-2"
                    onClick={() => setIsPlaying(true)}
                    aria-label={`${playAction} : ${title}`}
                >
                    <Image
                        src={`/images/youtube/${id}.webp`}
                        alt=""
                        fill
                        unoptimized
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1024px) 720px, calc(100vw - 32px)"
                        className="fide-image-outline object-cover outline outline-1 -outline-offset-1 outline-black/10"
                        data-youtube-thumbnail={id}
                    />
                    <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary-6/90 text-neutral-100 shadow-lg transition-[background-color,transform,box-shadow] duration-150 ease-out group-hover:bg-secondary-6 group-focus-visible:ring-4 group-focus-visible:ring-secondary-2/60 group-active:scale-[0.96] motion-reduce:transform-none">
                        <Play aria-hidden="true" className="ml-0.5 size-8" fill="currentColor" strokeWidth={2.5} />
                    </span>
                </button>
            )}
        </div>
    );
}
