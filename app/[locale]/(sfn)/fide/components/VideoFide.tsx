"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import TypingAnimation from "@/app/components/ui/typing-animation";
import { useSfnStore } from "@/app/stores/sfnStore";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import { CornerLeftUp, Play } from "lucide-react";

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
    playLabel?: string;
}

export const VideoFide = ({
    videoKey,
    poster,
    subtitle,
    subtitleFRUrl,
    subtitleENUrl,
    isAnimated = true,
    className = "",
    videoClassName = "",
    playLabel = "Play video",
}: VideoFideProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
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
            <div
                id="hero-video"
                className={`group relative cms-featured-image-wrapper image-wrapper radius-lg mx-auto p-0 bg-neutral-800 ${className}`}
                style={{ lineHeight: 0 }}
            >
                <video
                    ref={videoRef}
                    className={clsx(
                        "home-image-outline image-wrapper radius-lg w-full outline outline-1 -outline-offset-1 outline-black/10",
                        videoClassName,
                    )}
                    src={cloudFrontDomain + videoKey}
                    height="auto"
                    width="100%"
                    controls={isPlaying}
                    preload="none"
                    playsInline
                    poster={posterUrl}
                    onClick={(e) => e.stopPropagation()}
                    crossOrigin={crossOrigin}
                >
                    {subtitleFRUrl && <track kind="subtitles" src={cloudFrontDomain + subtitleFRUrl} srcLang="fr" label="Français" />}
                    {subtitleENUrl && <track kind="subtitles" src={cloudFrontDomain + subtitleENUrl} srcLang="en" label="English" />}
                </video>

                {!isPlaying && (
                    <button
                        type="button"
                        aria-label={playLabel}
                        className="group/play absolute inset-0 flex cursor-pointer items-center justify-center rounded-[inherit] focus-visible:outline-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause();
                        }}
                    >
                        <span className="flex size-16 items-center justify-center rounded-full bg-[rgba(229,2,6,0.88)] text-neutral-100 opacity-90 shadow-lg transition-[background-color,opacity,transform,box-shadow] duration-150 ease-out group-hover/play:bg-[rgba(229,2,6,1)] group-hover/play:opacity-100 group-focus-visible/play:ring-4 group-focus-visible/play:ring-secondary-2/60 group-active/play:scale-[0.96]">
                            <Play aria-hidden="true" className="ml-0.5 size-8" fill="currentColor" strokeWidth={2.5} />
                        </span>
                    </button>
                )}
            </div>
            {!!subtitle && (
                <div className="w-full mt-6 justify-end hidden sm:flex">
                    <div className="flex justify-end items-center">
                        <CornerLeftUp aria-hidden="true" className="mr-2 mb-2 size-6 md:size-8 lg:mb-4" strokeWidth={2} />
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
