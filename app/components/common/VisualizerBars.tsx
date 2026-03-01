"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VisualizerBarsProps {
    audioRef: React.RefObject<HTMLAudioElement>;
    isPlaying: boolean;
    barCount?: number;
    className?: string;
    minBarHeight?: number;
    maxBarHeight?: number;
}

export default function VisualizerBars({ audioRef, isPlaying, barCount = 8, className = "", minBarHeight = 6, maxBarHeight = 160 }: VisualizerBarsProps) {
    const [values, setValues] = useState<number[]>(Array(barCount).fill(minBarHeight));

    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationIdRef = useRef<number>();
    const sourceCreatedRef = useRef(false);
    const sourceElementRef = useRef<HTMLAudioElement | null>(null);
    const previousValuesRef = useRef<number[]>(Array(barCount).fill(minBarHeight));
    const barWeightsRef = useRef<number[]>(Array.from({ length: barCount }, (_, index) => 0.82 + ((index * 13) % 11) * 0.035));

    useEffect(() => {
        barWeightsRef.current = Array.from({ length: barCount }, (_, index) => 0.82 + ((index * 13) % 11) * 0.035);
    }, [barCount]);

    useEffect(() => {
        if (!audioRef.current || !isPlaying) {
            const reset = Array(barCount).fill(minBarHeight);
            previousValuesRef.current = reset;
            setValues(reset);
            return;
        }

        if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContext();
        }

        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume().catch(() => undefined);
        }

        const currentAudio = audioRef.current;

        // Avoid recreating a media source for the same audio element.
        if ((!sourceCreatedRef.current || sourceElementRef.current !== currentAudio) && audioCtxRef.current) {
            try {
                sourceRef.current = audioCtxRef.current.createMediaElementSource(currentAudio);
                sourceCreatedRef.current = true;
                sourceElementRef.current = currentAudio;
            } catch (e) {
                console.warn("Source audio déjà connectée ou erreur :", e);
            }
        }

        if (!analyserRef.current && audioCtxRef.current) {
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            analyserRef.current.smoothingTimeConstant = 0.75;

            sourceRef.current?.connect(analyserRef.current);
            analyserRef.current.connect(audioCtxRef.current.destination);
        }

        const analyser = analyserRef.current;
        if (!analyser) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
            analyser.getByteFrequencyData(dataArray);

            const step = Math.max(1, Math.floor(bufferLength / barCount));
            const levels = Array.from({ length: barCount }, (_, i) => {
                const start = i * step;
                const end = i === barCount - 1 ? bufferLength : Math.min(bufferLength, start + step);
                let sum = 0;
                let peak = 0;

                for (let index = start; index < end; index += 1) {
                    const value = dataArray[index];
                    sum += value;
                    if (value > peak) peak = value;
                }

                const avg = sum / Math.max(1, end - start);
                const mixedLevel = avg * 0.6 + peak * 0.4;
                const normalized = Math.max(0, Math.min(1, mixedLevel / 255));
                const shaped = Math.pow(normalized, 0.65);
                const weightedTarget = minBarHeight + shaped * (maxBarHeight - minBarHeight) * (barWeightsRef.current[i] || 1);
                const target = Math.max(minBarHeight, Math.min(maxBarHeight, weightedTarget));

                const previous = previousValuesRef.current[i] ?? minBarHeight;
                const damping = 0.12 + ((i * 7) % 5) * 0.07;
                return previous + (target - previous) * damping;
            });

            previousValuesRef.current = levels;
            setValues(levels);
            animationIdRef.current = requestAnimationFrame(update);
        };

        update();

        return () => {
            cancelAnimationFrame(animationIdRef.current!);
        };
    }, [audioRef, isPlaying, barCount, minBarHeight, maxBarHeight]);

    return (
        <div className={`flex items-end gap-1 ${className || "h-24"}`}>
            {values.map((v, i) => (
                <motion.div key={i} className="w-[3px] rounded-sm bg-neutral-800 origin-bottom" animate={{ height: v }} transition={{ duration: 0.15 }} />
            ))}
        </div>
    );
}
