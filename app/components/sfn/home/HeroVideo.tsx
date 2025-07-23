"use client";
import { PiArrowBendLeftDownDuotone } from "react-icons/pi";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { SlideFromBottom } from "../../animations/Slides";
import TypingAnimation from "../../ui/typing-animation";

export const HeroVideo = () => {
    return (
        <SlideFromBottom>
            <>
                <div className="flex w-full justify-end mb-2">
                    <PiArrowBendLeftDownDuotone className="text-2xl md:text-4xl mt-2 lg:mt-4 mr-2" />
                    <TypingAnimation className="text-lg md:text-xl xl:text-2xl mb-0 min-w-40 md:min-w-44 xl:min-w-52 text-left" text="Start French Now" duration={100} />
                </div>
                <div id="hero-video" className="cms-featured-image-wrapper image-wrapper border-radius-40px mx-auto p-0">
                    <LiteYouTubeEmbed id="-UVoKCZM-5s" title="Testez votre niveau de français (A1 à C2)" poster="maxresdefault" />
                </div>
            </>
        </SlideFromBottom>
    );
};
