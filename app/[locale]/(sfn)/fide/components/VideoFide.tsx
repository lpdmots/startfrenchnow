"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import TypingAnimation from "@/app/components/ui/typing-animation";
import { useSfnStore } from "@/app/stores/sfnStore";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { FaPlay } from "react-icons/fa";
import { PiArrowBendLeftUpDuotone } from "react-icons/pi";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

// 1. Ajout des props optionnelles dans l'interface
interface VideoFideProps {
    videoKey: string;
    poster?: string;
    subtitle?: string;
    subtitleFRUrl?: string;
    subtitleENUrl?: string;
    isAnimated?: boolean;
    className?: string; // Pour le wrapper (motion.div)
    videoClassName?: string; // Pour la balise <video>
}

export const VideoFide = ({ videoKey, poster, subtitle, subtitleFRUrl, subtitleENUrl, isAnimated = true, className = "", videoClassName = "" }: VideoFideProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const posterUrl = !poster ? undefined : poster?.startsWith("/images") ? poster : cloudFrontDomain + poster;
    const subtitlePreference = useSfnStore((s) => s.subtitlePreference);
    const setSubtitlePreference = useSfnStore((s) => s.setSubtitlePreference);
    const crossOrigin = subtitleFRUrl || subtitleENUrl ? "anonymous" : undefined;

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

    // 1) Appliquer la préférence enregistrée quand la vidéo est prête
    useEffect(() => {
        if (typeof window === "undefined") return;
        const video = videoRef.current;
        if (!video) return;

        const applyPreference = () => {
            if (!subtitlePreference) return; // laisse le comportement natif si aucune préférence

            const tracks = video.textTracks;
            if (!tracks || tracks.length === 0) return;

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                const lang = (track.language || "").toLowerCase();

                if (subtitlePreference === "off") {
                    track.mode = "disabled";
                } else if (lang.startsWith(subtitlePreference)) {
                    track.mode = "showing";
                } else {
                    track.mode = "disabled";
                }
            }
        };

        // ✅ Si les metadata sont déjà prêtes, on applique tout de suite
        if (video.readyState >= 1) {
            applyPreference();
            return;
        }

        // Sinon, on attend l'événement loadedmetadata
        const handler = () => {
            applyPreference();
        };

        video.addEventListener("loadedmetadata", handler);

        return () => {
            video.removeEventListener("loadedmetadata", handler);
        };
    }, [videoKey, subtitlePreference]);

    // 2) Sauvegarder chaque changement de sous-titres vers le store
    useEffect(() => {
        if (typeof window === "undefined") return;
        const video = videoRef.current;
        if (!video) return;

        const tracks = video.textTracks;
        if (!tracks) return;

        const handleChange = () => {
            let value: "fr" | "en" | "off" = "off";

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                if (track.mode === "showing") {
                    const lang = track.language.toLowerCase();
                    if (lang.startsWith("fr")) value = "fr";
                    else if (lang.startsWith("en")) value = "en";
                    else value = "off";
                    break;
                }
            }

            setSubtitlePreference(value);
        };

        // TextTrackList est un EventTarget, mais TS ne le sait pas toujours
        tracks.addEventListener("change", handleChange);

        return () => {
            tracks.removeEventListener("change", handleChange);
        };
    }, [videoKey, setSubtitlePreference]);

    const content = (
        <>
            <motion.div
                id="hero-video"
                className={`cms-featured-image-wrapper image-wrapper radius-lg mx-auto p-0 bg-neutral-800 ${className}`}
                style={{ lineHeight: 0 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <video
                    ref={videoRef}
                    className={clsx("image-wrapper radius-lg w-full", videoClassName)}
                    src={cloudFrontDomain + videoKey}
                    height="auto"
                    width="100%"
                    controls={isPlaying}
                    poster={posterUrl}
                    onClick={(e) => e.stopPropagation()}
                    crossOrigin={crossOrigin}
                >
                    {subtitleFRUrl && <track kind="subtitles" src={cloudFrontDomain + subtitleFRUrl} srcLang="fr" label="Français" />}
                    {subtitleENUrl && <track kind="subtitles" src={cloudFrontDomain + subtitleENUrl} srcLang="en" label="English" />}
                </video>

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
                <div className="w-full mt-6 justify-end hidden sm:flex">
                    <div className="flex justify-end items-center">
                        <PiArrowBendLeftUpDuotone className="text-2xl md:text-4xl mr-2 mb-2 lg:mb-4" />
                        <TypingAnimation className="text-lg md:text-xl xl:text-2xl mb-0 min-w-48 xl:min-w-60 text-left" text={subtitle} duration={50} />
                    </div>
                </div>
            )}
        </>
    );

    if (isAnimated)
        return (
            <div className="relative">
                <SlideFromBottom>{content}</SlideFromBottom>
            </div>
        );

    return content;
};
