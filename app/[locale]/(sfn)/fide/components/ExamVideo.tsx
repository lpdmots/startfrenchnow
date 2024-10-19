"use client";

import { SlideFromBottom } from "@/app/components/animations/Slides";
import TypingAnimation from "@/app/components/ui/typing-animation";
import { PiArrowBendLeftDownDuotone } from "react-icons/pi";
import LiteYouTubeEmbed from "react-lite-youtube-embed";

export const ExamVideo = ({ text }: { text: string }) => {
    return (
        <div className="flex flex-col justify-center items-center gap-4 w-full">
            <SlideFromBottom>
                <>
                    <div className="flex w-full justify-end mb-2">
                        <PiArrowBendLeftDownDuotone className="text-2xl md:text-4xl mt-2 lg:mt-4 mr-2" />
                        <TypingAnimation className="text-lg md:text-xl xl:text-2xl mb-0 min-w-[180px] md:min-w-52 xl:min-w-60 text-left" text={text} duration={100} />
                    </div>
                    <div id="hero-video" className="cms-featured-image-wrapper image-wrapper border-radius-40px mx-auto p-0">
                        <LiteYouTubeEmbed id="mDia5R8CTuM" title="The Swiss FIDE Exam - The Full Explanation" poster="maxresdefault" />
                    </div>
                </>
            </SlideFromBottom>
        </div>
    );
};
