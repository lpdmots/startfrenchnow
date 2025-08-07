"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import {
    FaPlay,
    FaPause,
    FaStepForward,
    FaRedoAlt,
    FaRegFlag,
    FaMicrophone,
    FaStop,
    FaSpinner,
    FaCheck,
    FaCheckCircle,
    FaExclamationCircle,
    FaStar,
    FaStarHalfAlt,
    FaRegStar,
    FaTimesCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import VisualizerBars from "./VisualizerBars";
import Image from "next/image";
import { Exam, Response, ResponseB1, Track } from "@/app/types/fide/exam";
import { shuffleArray } from "@/app/lib/utils";
import urlFor from "@/app/lib/urlFor";
import { ConfettiFireworks } from "../ui/ConfettiFireworks";
import { Log } from "@/app/types/sfn/auth";
import { evaluateB1Answer, updateUserProgress } from "@/app/serverActions/fideExamActions";
import clsx from "clsx";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export default function AudioOverlayPlayer({ exam, logs, setLogs, userId }: { exam: Exam; logs: Log[] | null; setLogs: any; userId?: string }) {
    const tracks = exam.tracks as Track[];
    const responses = useMemo(() => (exam.level !== "B1" ? getResponses(exam.responses) : []), [exam.responses]);
    const previousScore = logs?.find((log) => log.exam._ref === exam._id)?.score ?? null;

    const [playing, setPlaying] = useState<boolean>(false);
    const [ended, setEnded] = useState<boolean>(false);
    const [repeatedOnce, setRepeatedOnce] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<number>(0);
    const [clickedResponse, setClickedResponse] = useState<null | number>(null);
    const [showText, setShowText] = useState<boolean>(false);
    const [isPlayingFollowUp, setIsPlayingFollowUp] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalAnswers, setTotalAnswers] = useState(0);
    const currentTrackData = tracks[currentTrack];
    const withResponses = ["Question", "Audio"].some((keyword) => currentTrackData.title.includes(keyword)) ? totalAnswers : null;
    const isClickableResponse = currentTrackData.title.includes("Audio") ? true : false;
    const followUpSrc = isClickableResponse ? tracks[currentTrack - 1]?.src : undefined;
    const isA1A2Level = exam.level === "A1" || exam.level === "A2";

    // Pour le B1
    const [isNextButtonForced, setIsNextButtonForced] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<null | EvaluationResult>(null);
    const showNextButton = !isClickableResponse || isNextButtonForced;
    const isRecordingRef = useRef(false);

    const togglePlay = (stop = false) => {
        if (!audioRef.current) return;
        setEnded(false);

        if (playing || stop) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            audioRef.current.play();
            setPlaying(true);
        }
    };

    const nextTrack = () => {
        setEnded(false);
        setRepeatedOnce(false);
        setCurrentTrack((prev) => (prev + 1) % tracks.length);
        setPlaying(true);
    };

    const valideB1Result = () => {
        setClickedResponse(null);
        setTotalAnswers((prev) => prev + 1);
        setIsNextButtonForced(false);
        setEvaluationResult(null);
        nextTrack();
    };

    const handleRepeat = () => {
        setRepeatedOnce(true);
        setEnded(false);
        setPlaying(true);
        setIsPlayingFollowUp(false);

        const audio = audioRef.current;
        if (!audio) return;

        audio.src = getAudioUrl(currentTrackData.src);
        audio.play();
    };

    const responseClickActions = (score: number) => {
        setCorrectAnswers((prev) => prev + score);
    };

    const handleResponseClick = (index: number, isCorrect: boolean) => {
        if (!isClickableResponse) return;
        if (!clickedResponse) {
            setClickedResponse(index);
            setTimeout(() => {
                setCorrectAnswers((prev) => prev + (isCorrect ? 1 : 0));
                setTotalAnswers((prev) => prev + 1);
                setClickedResponse(null);
                nextTrack();
            }, 1500);
        }
    };

    useEffect(() => {
        setIsPlayingFollowUp(false);
        const audio = audioRef.current;
        if (!audio) return;

        // 🎯 Ajustement du volume selon le titre
        if (currentTrackData.title.includes("Question") || currentTrackData.title.includes("Situation")) {
            audio.volume = 1.0; // volume max
        } else {
            audio.volume = 0.8; // volume standard (ou plus bas)
        }

        if (playing) {
            audio.src = getAudioUrl(currentTrackData.src);
            audio.play().catch((e) => console.error("Erreur lors de la lecture :", e));
        } else {
            audio.pause();
        }
    }, [currentTrack]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            if (!isPlayingFollowUp && followUpSrc) {
                setIsPlayingFollowUp(true);
                setTimeout(() => {
                    console.log({ isRecording: isRecordingRef.current, followUpSrc });
                    if (!clickedResponse && !isRecordingRef.current) {
                        audio.src = getAudioUrl(followUpSrc);
                        audio.volume = 1;
                        audio.play();
                    }
                }, 2000);
            } else {
                setIsPlayingFollowUp(false);
                setPlaying(false);
                setEnded(true);
            }
        };

        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [currentTrackData, isPlayingFollowUp]);

    useEffect(() => {
        (async () => {
            if (totalAnswers === 3 && (previousScore === null || correctAnswers > (previousScore ?? 1000))) {
                // Mise à jour de la data:
                const newLogs = await updateUserProgress("fideExam", exam._id, correctAnswers, userId);
                console.log("User progress updated:", newLogs);
                if (newLogs) {
                    setLogs(newLogs);
                }
            }
        })();
    }, [totalAnswers]);

    const isRepeatDisabled = playing || !ended || repeatedOnce;

    return (
        <div className="relative w-full h-full">
            {totalAnswers !== 3 && (
                <>
                    <button className="flex absolute top-2 left-2 items-center justify-center bg-neutral-200 rounded-full p-2 z-20 text-neutral-800" onClick={() => setShowText((prev) => !prev)}>
                        <FaRegFlag size={16} className="mr-1" /> AIDE
                    </button>

                    <div className="absolute bottom-4 w-full" style={{ left: "50%", transform: "translateX(-50%)" }}>
                        <div className="inset-0 flex flex-col items-center justify-center text-white bg-black/30 backdrop-blur-sm">
                            <audio ref={audioRef} crossOrigin="anonymous" src={getAudioUrl(currentTrackData.src)} preload="auto" />

                            {showText && (
                                <div className="p-2 sm:p-4">
                                    <div className="bg-neutral-100 rounded-lg w-full p-2 sm:p-4 border-2 border-neutral-800 border-solid">
                                        <p className="bss mb-0">{currentTrackData.text}</p>
                                    </div>
                                </div>
                            )}

                            <VisualizerBars audioRef={audioRef} isPlaying={playing} className={`h-24 mb-2 ${showText ? "hidden" : "block"}`} />

                            {!showText && <h2 className="text-2xl font-semibold my-2">{currentTrackData.title}</h2>}

                            <div className="flex items-center gap-6 mt-2">
                                <button
                                    onClick={handleRepeat}
                                    aria-label="Répéter cette piste"
                                    disabled={isRepeatDisabled}
                                    className={`bg-neutral-200 p-3 rounded-full flex items-center justify-center border-2 border-neutral-800 border-solid ${
                                        isRepeatDisabled ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    <FaRedoAlt size={20} className="text-neutral-800" />
                                </button>

                                <button
                                    onClick={() => togglePlay()}
                                    aria-label={playing ? "Pause" : "Lecture"}
                                    disabled={ended || isNextButtonForced}
                                    className={`bg-neutral-200 p-3 rounded-full flex items-center justify-center border-2 border-neutral-800 border-solid ${
                                        ended || isNextButtonForced ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {playing ? <FaPause size={32} className="text-neutral-800" /> : <FaPlay size={32} className="text-neutral-800" />}
                                </button>

                                <motion.button
                                    onClick={isNextButtonForced ? valideB1Result : nextTrack}
                                    aria-label="Piste suivante"
                                    className={`bg-neutral-200 p-3 rounded-full flex items-center justify-center border-2 border-neutral-800 border-solid transition-opacity duration-300 ${
                                        showNextButton ? "opacity-100" : "opacity-0 pointer-events-none"
                                    }`}
                                    animate={ended || isNextButtonForced ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                                    transition={{
                                        duration: 1,
                                        repeat: ended || isNextButtonForced ? Infinity : 0,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <FaStepForward size={24} className="text-neutral-800" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {withResponses != null && isA1A2Level && (
                <ResponseBlock responses={responses[withResponses]} isClickableResponse={isClickableResponse} clickedResponse={clickedResponse} handleResponseClick={handleResponseClick} />
            )}
            {withResponses != null && !isA1A2Level && (
                <ResponseBlockB1
                    togglePlay={togglePlay}
                    responseB1={exam.responsesB1[totalAnswers]}
                    audioText={currentTrackData.text}
                    isClickableResponse={isClickableResponse}
                    responseClickActions={responseClickActions}
                    setIsNextButtonForced={setIsNextButtonForced}
                    evaluationResult={evaluationResult}
                    setEvaluationResult={setEvaluationResult}
                    question={tracks[currentTrack - 1].text}
                    isRecordingRef={isRecordingRef}
                />
            )}
            {totalAnswers === 3 && <ResultBlock correctAnswers={correctAnswers} />}
        </div>
    );
}

const getResponses = (responses: Response[]) => {
    return [shuffleArray(responses.slice(0, 3)), shuffleArray(responses.slice(3, 6)), shuffleArray(responses.slice(6))];
};

const getAudioUrl = (src: string) => `${cloudFrontDomain}${src}`;

function getFeedbackMessage(score: number): string {
    switch (score) {
        case 3:
            return "Excellent, bravo ! 🎉";
        case 2:
            return "Bien joué ! Tu y es presque ! 💪";
        case 1:
            return "Pas mal, continue à t'entraîner ! 😊";
        default:
            return "Essaie encore, tu vas y arriver ! 💡";
    }
}

const ResultBlock = ({ correctAnswers }: { correctAnswers: number }) => {
    const stars = [0, 1, 2].map((i) => {
        if (correctAnswers >= i + 1) return "full";
        if (correctAnswers >= i + 0.5) return "half";
        return "empty";
    });

    return (
        <div className="absolute -bottom-60 w-full h-60 bg-neutral-100 flex flex-col items-center justify-center gap-4">
            <h3 className="text-xl font-bold text-neutral-800">Résultat</h3>

            <div className="flex gap-2">
                {stars.map((type, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{
                            delay: i * 0.4,
                            duration: 0.4,
                            ease: "easeOut",
                        }}
                        className="text-3xl text-yellow-500"
                    >
                        {type === "full" && <FaStar className="text-primary" />}
                        {type === "half" && <FaStarHalfAlt className="text-primary" />}
                        {type === "empty" && <FaRegStar className="text-primary" />}
                    </motion.div>
                ))}
            </div>

            {correctAnswers === 3 && <ConfettiFireworks delay={1000} />}

            <p className="text-lg font-medium text-neutral-800">{getFeedbackMessage(correctAnswers)}</p>
        </div>
    );
};

interface ResponseBlockProps {
    responses: Response[];
    isClickableResponse: boolean;
    clickedResponse: number | null;
    handleResponseClick: (index: number, isCorrect: boolean) => void;
}

const ResponseBlock = ({ responses, isClickableResponse, clickedResponse, handleResponseClick }: ResponseBlockProps) => {
    return (
        <div className="absolute -bottom-60 w-full h-60 bg-neutral-100 flex flex-col items-center gap-4">
            <p className={`italic bs mt-4 mb-0 font-bold text-neutral-800 ${isClickableResponse ? "animate-pulse" : "opacity-0"}`}>Cliquez sur la bonne réponse</p>
            <div className="flex items-center justify-center gap-2 md:gap-6">
                {responses?.map((response, index) => (
                    <Image
                        height={300}
                        width={300}
                        key={index}
                        src={urlFor(response.image).url()}
                        alt={`Réponse ${index + 1}`}
                        className={`w-28 h-28 md:w-40 md:h-40 object-contain rounded-lg ${
                            isClickableResponse ? "cursor-pointer clickable-image translate_on_hover hover:bg-neutral-200 border-2 border-solid" : ""
                        } ${clickedResponse === index ? (response.isCorrect ? "border-secondary-5 border-4" : "border-secondary-4 border-4") : "border-neutral-600"}`}
                        style={{ backgroundColor: "#fff" }}
                        onClick={() => handleResponseClick(index, response.isCorrect)}
                    />
                ))}
            </div>
        </div>
    );
};

interface ResponseBlockB1Props {
    togglePlay: (stop?: boolean) => void;
    responseB1: ResponseB1;
    audioText: string;
    isClickableResponse: boolean;
    responseClickActions: (score: number) => void;
    setIsNextButtonForced: (forced: boolean) => void;
    evaluationResult: EvaluationResult | null;
    setEvaluationResult: (result: EvaluationResult | null) => void;
    question: string;
    isRecordingRef: React.MutableRefObject<boolean>;
}

const ResponseBlockB1 = ({
    togglePlay,
    audioText,
    responseB1,
    isClickableResponse,
    responseClickActions,
    setIsNextButtonForced,
    evaluationResult,
    setEvaluationResult,
    question,
    isRecordingRef,
}: ResponseBlockB1Props) => {
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    console.log({ question });
    const handleEvaluate = async () => {
        if (!transcript) return;
        setIsEvaluating(true);

        const res = await evaluateB1Answer({
            audioText,
            answerText: transcript,
            responseB1: responseB1,
            question,
        });

        setIsEvaluating(false);

        if ("error" in res) {
            console.error(res.error);
        } else {
            setEvaluationResult(res);
            responseClickActions(res.score);
            setTranscript(null);
            setIsNextButtonForced(true);
        }
    };

    return (
        <div className="absolute -bottom-60 w-full h-60 bg-neutral-100 flex flex-col items-center gap-4">
            {(isEvaluating || evaluationResult) && <ResponseFeedback isLoading={isEvaluating} result={evaluationResult} modelAnswer={responseB1.modelAnswer} />}
            {isClickableResponse && !isEvaluating && !evaluationResult && (
                <ResponseRecorder togglePlay={togglePlay} setTranscript={setTranscript} handleEvaluate={handleEvaluate} transcript={transcript} isRecordingRef={isRecordingRef} />
            )}
        </div>
    );
};

type EvaluationResult = {
    score: 0 | 0.5 | 1;
    feedback?: string;
};

const ResponseRecorder = ({
    togglePlay,
    transcript,
    setTranscript,
    handleEvaluate,
    isRecordingRef,
}: {
    togglePlay: (stop?: boolean) => void;
    transcript: string | null;
    setTranscript: (transcript: string | null) => void;
    handleEvaluate: () => void;
    isRecordingRef: React.MutableRefObject<boolean>;
}) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const chunks = useRef<Blob[]>([]);

    const beepStart = new Audio("/images/start-recording.mp3");
    const beepStop = new Audio("/images/stop-recording.mp3");
    beepStart.volume = 0.1;
    beepStop.volume = 0.1;

    useEffect(() => {
        return () => {
            // Arrête proprement l'enregistrement si le composant est démonté
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }
        };
    }, [mediaRecorder]);

    const startRecording = async () => {
        togglePlay(true);
        beepStart.play();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        chunks.current = [];

        recorder.ondataavailable = (e) => chunks.current.push(e.data);

        recorder.onstop = async () => {
            setIsTranscribing(true);
            const blob = new Blob(chunks.current, { type: "audio/webm" });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            const file = new File([blob], "audio.webm", { type: "audio/webm" });

            const formData = new FormData();
            formData.append("audio", file);

            try {
                const res = await fetch("/api/fide-exam-b1/transcribe", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error("Transcription échouée");

                const data = await res.json();
                setIsTranscribing(false);

                const suspectTerms = ["para la communauté", "true", "!", "Sous-titrage ST", "Merci."];
                const fallback = "Vous n'avez pas enregistré de réponse.";
                const isInvalid = suspectTerms.some((term) => data.transcription.toLowerCase().includes(term.toLowerCase())) || data.transcription === "";
                const transcription = isInvalid ? fallback : data.transcription;

                setTranscript(transcription);
            } catch (err) {
                console.error("Erreur STT :", err);
            }
        };

        recorder.start();
        setMediaRecorder(recorder);
        isRecordingRef.current = true;

        // ⏱️ Arrêt automatique après 30 secondes
        setTimeout(() => {
            if (recorder.state !== "inactive") {
                recorder.stop();
                isRecordingRef.current = false;
            }
        }, 30_000);
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        isRecordingRef.current = false;
        beepStop.play();
    };

    const reset = () => {
        setAudioUrl(null);
        setTranscript(null);
        setMediaRecorder(null);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-neutral-100 w-full">
            {!isRecordingRef.current && !audioUrl && (
                <>
                    <p className="italic bs mt-4 mb-0 font-bold text-neutral-800 animate-pulse">À toi de répondre</p>
                    <button onClick={startRecording} className="roundButton">
                        <FaMicrophone />
                    </button>
                </>
            )}

            {isRecordingRef.current && (
                <div className="flex flex-col items-center gap-4">
                    <p className="italic bs mt-4 mb-0 font-bold text-neutral-800 animate-pulse">À toi de répondre</p>
                    <button onClick={stopRecording} className="roundButton">
                        <FaStop />
                    </button>
                    <RecordingIndicator />
                </div>
            )}

            {audioUrl && (
                <>
                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex gap-4 w-full justify-center max-w-md">
                            <button
                                onClick={reset}
                                className="h-full rounded-full aspect-square flex justify-center items-center transition transform translate_on_hover hover:opacity-80"
                                style={{ backgroundColor: "var(--neutral-300)" }}
                            >
                                <FaRedoAlt style={{ color: "#0b0b0b" }} />
                            </button>
                            <audio controls src={audioUrl} className="w-full max-w-md" />
                            <button
                                onClick={handleEvaluate}
                                className={clsx(
                                    `h-full rounded-full aspect-square flex justify-center items-center transition transform ${
                                        !transcript || isTranscribing ? "opacity-50 cursor-not-allowed" : "translate_on_hover hover:opacity-80"
                                    }`
                                )}
                                style={{ backgroundColor: "var(--secondary-2)" }}
                                disabled={!transcript || isTranscribing}
                            >
                                <FaCheck style={{ color: "#0b0b0b" }} />
                            </button>
                        </div>
                        {isTranscribing && (
                            <div className="flex flex-col justify-center items-center w-full gap-4 pt-4">
                                <FaSpinner className="animate-spin text-neutral-400 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />
                                <p className="text-neutral-400 bs">Transcription en cours...</p>
                            </div>
                        )}
                        {!isTranscribing && transcript !== null && (
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                className="w-full max-w-md p-2 border border-neutral-400 rounded"
                                style={{ color: "#0b0b0b" }}
                                rows={4}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const RecordingIndicator = () => (
    <div className="flex items-center gap-2 text-secondary-4 font-semibold animate-pulse">
        <span className="w-3 h-3 bg-secondary-4 rounded-full animate-ping mr-2" />
        <span className="text-sm">Enregistrement en cours...</span>
    </div>
);

type ResponseFeedbackProps = {
    isLoading: boolean;
    result: { score: number; feedback?: string; modelAnswer?: string } | null;
    modelAnswer: string;
};

function ResponseFeedback({ isLoading, result, modelAnswer }: ResponseFeedbackProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-8 w-full text-neutral-600">
                <FaSpinner className="animate-spin text-4xl" />
                <p className="bs italic">Analyse en cours...</p>
            </div>
        );
    }

    if (!result) return null;

    const { score, feedback } = result;

    const scoreIcon =
        score === 1 ? (
            <FaCheckCircle className="text-secondary-5 text-4xl" />
        ) : score === 0.5 ? (
            <FaExclamationCircle className="text-primary text-4xl" />
        ) : (
            <FaTimesCircle className="text-secondary-4 text-4xl" />
        );

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full items-center p-4">
            <div>{scoreIcon}</div>

            <div className="flex flex-col gap-2 w-full">
                {feedback && (
                    <div className="border border-solid border-neutral-300 rounded p-2 w-full">
                        <p className="mb-0 text-sm font-semibold  text-neutral-600">Commentaire</p>
                        <p className="mb-0 text-neutral-800 w-full">{feedback}</p>
                    </div>
                )}

                <div className="border border-solid border-neutral-300 rounded p-2 w-full">
                    <p className="mb-0 text-sm font-semibold text-neutral-600">Réponse attendue</p>
                    <p className="mb-0 text-neutral-800 italic w-full">{modelAnswer}</p>
                </div>
            </div>
        </div>
    );
}
