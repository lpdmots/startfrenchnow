"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import TypingAnimation from "@/app/components/ui/typing-animation";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { FaPlay } from "react-icons/fa";
import { PiArrowBendLeftUp, PiArrowBendLeftUpDuotone } from "react-icons/pi";

export const VideoFide = ({ videoKey, poster, subtitle }: { videoKey: string; poster?: string; subtitle?: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    return (
        <div className="relative">
            <SlideFromBottom>
                <>
                    <motion.div
                        id="hero-video"
                        className="cms-featured-image-wrapper image-wrapper radius-lg mx-auto p-0 bg-neutral-800"
                        style={{ lineHeight: 0 }}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                    >
                        <video
                            ref={videoRef}
                            className="image-wrapper radius-lg"
                            src={cloudFrontDomain + videoKey}
                            height="auto"
                            width="100%"
                            controls={isPlaying}
                            poster={poster ?? undefined}
                            onClick={(e) => e.stopPropagation()}
                        ></video>

                        {!isPlaying && (
                            <div
                                className="absolute w-full h-full top-0 left-0 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayPause();
                                }}
                            >
                                <div className="relative w-full h-full">
                                    <motion.button
                                        className="absolute flex items-center justify-center text-white rounded-full p-4"
                                        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                                        initial={{ backgroundColor: "rgba(128, 128, 128, 0.5)" }}
                                        animate={{
                                            backgroundColor: isHovered ? "rgba(229,2,6,1)" : "rgba(229,2,6,0.8)",
                                            opacity: isHovered ? 1 : 0.8,
                                        }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        <FaPlay size={32} />
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                    {!!subtitle && (
                        <div className="w-full mt-6 flex justify-end">
                            <div className="flex justify-end items-center">
                                <PiArrowBendLeftUpDuotone className="text-2xl md:text-4xl mr-2 mb-2 lg:mb-4" />
                                <TypingAnimation className="text-lg md:text-xl xl:text-2xl mb-0 min-w-48 xl:min-w-60 text-left" text={subtitle} duration={50} />
                            </div>
                        </div>
                    )}
                </>
            </SlideFromBottom>
        </div>
    );
};
