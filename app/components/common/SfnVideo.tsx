"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

const SUBTITLE_PREF_KEY = "sfn_subtitle_pref"; // "fr" | "en" | "off"
type SubtitlePref = "fr" | "en" | "off";

type Props = {
    cloudFrontDomain: string;
    videoKey: string;
    posterUrl?: string;
    videoClassName?: string;
    isPlaying: boolean;
    subtitleFRUrl?: string;
    subtitleENUrl?: string;
    // tu peux rajouter d'autres props si besoin
};

export function SfnVideoWithSubtitles({ cloudFrontDomain, videoKey, posterUrl, videoClassName, isPlaying, subtitleFRUrl, subtitleENUrl }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // 1) Appliquer la préférence enregistrée quand la vidéo est prête
    useEffect(() => {
        if (typeof window === "undefined") return;
        const video = videoRef.current;
        if (!video) return;

        const applyPreference = () => {
            const pref = window.localStorage.getItem(SUBTITLE_PREF_KEY) as SubtitlePref | null;
            if (!pref) return;

            const tracks = video.textTracks;
            if (!tracks || tracks.length === 0) return;

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];

                if (pref === "off") {
                    track.mode = "disabled";
                } else if (track.language === pref) {
                    track.mode = "showing";
                } else {
                    track.mode = "disabled";
                }
            }
        };

        // Quand les metadata sont chargées, les textTracks sont dispo
        video.addEventListener("loadedmetadata", applyPreference);

        return () => {
            video.removeEventListener("loadedmetadata", applyPreference);
        };
    }, [videoKey]);

    // 2) Sauvegarder chaque changement de sous-titres fait par l’utilisateur
    useEffect(() => {
        if (typeof window === "undefined") return;
        const video = videoRef.current;
        if (!video) return;

        const tracks = video.textTracks;
        if (!tracks) return;

        const handleChange = () => {
            let value: SubtitlePref = "off";

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                if (track.mode === "showing") {
                    const lang = track.language;
                    if (lang === "fr" || lang === "en") {
                        value = lang;
                    } else {
                        value = "off";
                    }
                    break;
                }
            }

            window.localStorage.setItem(SUBTITLE_PREF_KEY, value);
        };

        // TextTrackList est un EventTarget → on écoute "change"
        tracks.addEventListener("change", handleChange);

        return () => {
            tracks.removeEventListener("change", handleChange);
        };
    }, [videoKey]);

    return (
        <video
            ref={videoRef}
            className={clsx("image-wrapper radius-lg w-full", videoClassName)}
            src={cloudFrontDomain + videoKey}
            height="auto"
            width="100%"
            controls={isPlaying}
            poster={posterUrl}
            onClick={(e) => e.stopPropagation()}
            crossOrigin="anonymous"
        >
            {subtitleFRUrl && <track kind="subtitles" src={cloudFrontDomain + subtitleFRUrl} srcLang="fr" label="Français" />}
            {subtitleENUrl && <track kind="subtitles" src={cloudFrontDomain + subtitleENUrl} srcLang="en" label="English" />}
        </video>
    );
}
