"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VisualizerBarsProps {
    audioRef: React.RefObject<HTMLAudioElement>;
    isPlaying: boolean;
    barCount?: number;
    className?: string;
}

export default function VisualizerBars({ audioRef, isPlaying, barCount = 8, className = "" }: VisualizerBarsProps) {
    const [values, setValues] = useState<number[]>(Array(barCount).fill(1));

    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationIdRef = useRef<number>();
    const sourceCreatedRef = useRef(false);

    useEffect(() => {
        if (!audioRef.current || !isPlaying) {
            setValues(Array(barCount).fill(1));
            return;
        }

        if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContext();
        }

        const currentAudio = audioRef.current;

        // ⚠️ Ne recrée pas une source si déjà connectée à cet élément audio
        if (!sourceCreatedRef.current && audioCtxRef.current) {
            try {
                sourceRef.current = audioCtxRef.current.createMediaElementSource(currentAudio);
                sourceCreatedRef.current = true;
            } catch (e) {
                console.warn("Source audio déjà connectée ou erreur :", e);
            }
        }

        if (!analyserRef.current && audioCtxRef.current) {
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;

            sourceRef.current?.connect(analyserRef.current);
            analyserRef.current.connect(audioCtxRef.current.destination);
        }

        const analyser = analyserRef.current;
        if (!analyser) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
            analyser.getByteFrequencyData(dataArray);

            const step = Math.floor(bufferLength / barCount);
            const levels = Array.from({ length: barCount }, (_, i) => {
                const val = dataArray[i * step];

                const center = barCount / 2;
                const distanceFromCenter = Math.abs(i - center + 0.5);
                const weight = 1 - distanceFromCenter / center;

                const boosted = val * weight;
                return Math.max(2, (boosted / 255) * 100);
            });

            setValues(levels);
            animationIdRef.current = requestAnimationFrame(update);
        };

        update();

        return () => {
            cancelAnimationFrame(animationIdRef.current!);
        };
    }, [audioRef, isPlaying, barCount]);

    return (
        <div className={`flex items-end gap-1 h-24 ${className}`}>
            {values.map((v, i) => (
                <motion.div key={i} className="w-1 rounded-sm bg-neutral-800 origin-bottom" animate={{ height: v }} transition={{ duration: 0.15 }} />
            ))}
        </div>
    );
}
