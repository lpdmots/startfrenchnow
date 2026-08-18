"use client";
import { CornerLeftDown } from "lucide-react";
import TypingAnimation from "../../ui/typing-animation";
import { VideoFide } from "@/app/[locale]/(sfn)/fide/components/VideoFide";

export const HeroVideo = ({
    annotation = "Start French Now",
    playLabel = "Play video",
}: {
    annotation?: string;
    playLabel?: string;
}) => {
    return (
        <>
            <div className="flex w-full justify-end mb-2">
                <CornerLeftDown aria-hidden="true" className="mr-2 mt-2 size-7 lg:mt-4 lg:size-9" strokeWidth={2} />
                <TypingAnimation className="text-lg md:text-xl xl:text-2xl mb-0 min-w-40 md:min-w-44 xl:min-w-52 text-left" text={annotation} duration={100} />
            </div>
            <VideoFide
                videoKey="fide/videopresentation-soustitres-encode.mp4"
                poster="/images/fide-presentation-thumbnail.webp"
                isAnimated={false}
                playLabel={playLabel}
            />
        </>
    );
};
