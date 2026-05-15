"use client";
import { PiArrowBendLeftDownDuotone } from "react-icons/pi";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import TypingAnimation from "../../ui/typing-animation";
import { VideoFide } from "@/app/[locale]/(sfn)/fide/components/VideoFide";

export const HeroVideo = ({
    annotation = "Start French Now",
    videoId = "-UVoKCZM-5s",
    videoTitle = "Testez votre niveau de français (A1 à C2)",
}: {
    annotation?: string;
    videoId?: string;
    videoTitle?: string;
}) => {
    return (
        <>
            <div className="flex w-full justify-end mb-2">
                <PiArrowBendLeftDownDuotone className="text-2xl md:text-4xl mt-2 lg:mt-4 mr-2" />
                <TypingAnimation className="text-lg md:text-xl xl:text-2xl mb-0 min-w-40 md:min-w-44 xl:min-w-52 text-left" text={annotation} duration={100} />
            </div>
                <VideoFide
                                            videoKey="fide/videopresentation-soustitres-encode.mp4"
                                            poster="/images/fide-presentation-thumbnail.png"
                                            isAnimated={false}
                                        />
        </>
    );
};
