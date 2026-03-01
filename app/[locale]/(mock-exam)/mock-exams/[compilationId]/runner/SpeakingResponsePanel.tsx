"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { PortableText } from "@portabletext/react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck, FaMicrophone, FaPause, FaPlay, FaRedoAlt, FaRegEye, FaRegEyeSlash, FaSpinner, FaStop } from "react-icons/fa";
import VisualizerBars from "@/app/components/common/VisualizerBars";
import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import { useToast } from "@/app/hooks/use-toast";
import { saveMockExamSpeakingAnswer } from "@/app/serverActions/mockExamActions";
import type { PortableText as PortableTextType, SpeakingAnswer } from "@/app/types/fide/mock-exam";
import { RecordingIndicator } from "@/app/components/common/AudioOverlayPlayer";

type SpeakingResponsePanelProps = {
    compilationId: string;
    sessionKey: string;
    taskId: string;
    activityKey: string;
    questionAudioUrl?: string;
    promptText?: PortableTextType;
    existingAnswer?: SpeakingAnswer;
    isAdvancing: boolean;
    onAnswerSaved: (answer: SpeakingAnswer) => void;
    onValidated: () => Promise<void>;
};

type AccordionStep = "step-1" | "step-2" | "step-3";

const MAX_ATTEMPTS = 3;
const AUTO_STOP_SECONDS = 5 * 60;
const TEXT_WARNING_KEY = "mock_exam_show_text_without_warning";
const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;
const STEP_RANK: Record<AccordionStep, number> = {
    "step-1": 1,
    "step-2": 2,
    "step-3": 3,
};

const withCloudFrontPrefix = (resource?: string) => {
    if (!resource) return undefined;
    if (/^https?:\/\//i.test(resource)) return resource;
    if (!cloudFrontDomain) return resource;

    const normalizedDomain = cloudFrontDomain.endsWith("/") ? cloudFrontDomain : `${cloudFrontDomain}/`;
    const normalizedResource = resource.startsWith("/") ? resource.slice(1) : resource;
    return `${normalizedDomain}${normalizedResource}`;
};

const buildTranscriptVerification = (value: string) => {
    const normalized = value.trim().replace(/\s+/g, " ");
    const words = normalized.split(" ").filter(Boolean);

    if (!normalized) return { ok: false, message: "Le transcript est vide." };
    if (words.length < 3) return { ok: false, message: "Le transcript est trop court." };
    if (/je n'ai pas pu transcrire/i.test(normalized)) return { ok: false, message: "Merci de corriger le transcript avant validation." };

    return { ok: true, message: "Transcript vérifié." };
};

export default function SpeakingResponsePanel({
    compilationId,
    sessionKey,
    taskId,
    activityKey,
    questionAudioUrl,
    promptText,
    existingAnswer,
    isAdvancing,
    onAnswerSaved,
    onValidated,
}: SpeakingResponsePanelProps) {
    const { toast } = useToast();

    const [attemptCount, setAttemptCount] = useState(existingAnswer ? 1 : 0);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
    const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string>(existingAnswer?.audioUrl || "");
    const [transcript, setTranscript] = useState(existingAnswer?.transcriptFinal || "");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerified, setIsVerified] = useState(Boolean(existingAnswer?.transcriptFinal && existingAnswer?.audioUrl));
    const [verificationMessage, setVerificationMessage] = useState<string>(existingAnswer ? "Réponse déjà validée." : "");

    const [isQuestionPlaying, setIsQuestionPlaying] = useState(false);
    const [hasFinishedFirstPlay, setHasFinishedFirstPlay] = useState(false);
    const [playUnlockedByReplay, setPlayUnlockedByReplay] = useState(false);
    const [accordionValue, setAccordionValue] = useState<AccordionStep>("step-1");
    const [showPromptText, setShowPromptText] = useState(false);
    const [showPromptWarning, setShowPromptWarning] = useState(false);
    const [skipPromptWarning, setSkipPromptWarning] = useState(false);
    const [rememberSkipChoice, setRememberSkipChoice] = useState(false);

    const questionAudioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const answerStepRef = useRef<HTMLDivElement | null>(null);
    const verifyStepRef = useRef<HTMLDivElement | null>(null);
    const autoScrollReadyRef = useRef(false);
    const previousMaxUnlockedRankRef = useRef(1);

    const canRecord = !isRecording && attemptCount < MAX_ATTEMPTS && !isTranscribing && !isSaving && !isAdvancing;
    const canValidate = !!uploadedAudioUrl && transcript.trim().length > 0 && !isSaving && !isAdvancing;

    const sourceAudio = useMemo(() => audioPreviewUrl || withCloudFrontPrefix(uploadedAudioUrl) || null, [audioPreviewUrl, uploadedAudioUrl]);
    const questionAudio = useMemo(() => withCloudFrontPrefix(questionAudioUrl), [questionAudioUrl]);
    const isPlayDisabled = !questionAudio || (hasFinishedFirstPlay && !isQuestionPlaying && !playUnlockedByReplay);
    const isReplayDisabled = !questionAudio || !hasFinishedFirstPlay || isQuestionPlaying;
    const hasAnswerDraft = Boolean(sourceAudio) || isRecording || isTranscribing || transcript.trim().length > 0;
    const hasReachedAnswerStep = !questionAudio || hasFinishedFirstPlay || hasAnswerDraft;
    const hasReachedVerifyStep = isTranscribing || transcript.trim().length > 0;
    const isQuestionStepActive = !hasReachedAnswerStep;
    const isAnswerStepActive = hasReachedAnswerStep && !hasReachedVerifyStep;
    const isVerifyStepActive = hasReachedVerifyStep;
    const isStep1Done = hasReachedAnswerStep;
    const isStep2Done = hasReachedVerifyStep;
    const isStep3Done = canValidate;
    const submitLabel = isVerifyStepActive ? "Valider" : "Continuer";
    const questionStepClass = hasReachedAnswerStep ? "bg-neutral-300 text-neutral-800" : "bg-secondary-2 text-neutral-100";
    const answerStepClass = hasReachedAnswerStep && !hasReachedVerifyStep ? "bg-secondary-2 text-neutral-100" : "bg-neutral-300 text-neutral-800";
    const verifyStepClass = hasReachedVerifyStep ? "bg-secondary-2 text-neutral-100" : "bg-neutral-300 text-neutral-800";

    const isAccordionStep = (value: string): value is AccordionStep => value === "step-1" || value === "step-2" || value === "step-3";

    const isStepUnlocked = (value: AccordionStep) => {
        if (value === "step-1") return true;
        if (value === "step-2") return hasReachedAnswerStep;
        return hasReachedVerifyStep;
    };

    const maxUnlockedStep: AccordionStep = hasReachedVerifyStep ? "step-3" : hasReachedAnswerStep ? "step-2" : "step-1";

    useEffect(() => {
        const nextRank = STEP_RANK[maxUnlockedStep];

        if (!autoScrollReadyRef.current) {
            autoScrollReadyRef.current = true;
            previousMaxUnlockedRankRef.current = nextRank;
            setAccordionValue(maxUnlockedStep);
            return;
        }

        if (nextRank > previousMaxUnlockedRankRef.current) {
            setAccordionValue(maxUnlockedStep);
            requestAnimationFrame(() => {
                if (maxUnlockedStep === "step-2") {
                    answerStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                if (maxUnlockedStep === "step-3") {
                    verifyStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }

        previousMaxUnlockedRankRef.current = nextRank;
    }, [maxUnlockedStep]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setSkipPromptWarning(window.localStorage.getItem(TEXT_WARNING_KEY) === "1");
    }, []);

    useEffect(() => {
        const audio = questionAudioRef.current;
        if (!audio) return;

        const onPlay = () => setIsQuestionPlaying(true);
        const onPause = () => setIsQuestionPlaying(false);
        const onEnded = () => {
            setIsQuestionPlaying(false);
            setHasFinishedFirstPlay(true);
            setPlayUnlockedByReplay(false);
        };
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
        };
    }, [questionAudio]);

    const stopActiveStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const stopTimers = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (autoStopTimeoutRef.current) {
            clearTimeout(autoStopTimeoutRef.current);
            autoStopTimeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            stopTimers();
            stopActiveStream();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
        };
    }, [audioPreviewUrl]);

    useEffect(() => {
        setAttemptCount(existingAnswer ? 1 : 0);
        setUploadedAudioUrl(existingAnswer?.audioUrl || "");
        setTranscript(existingAnswer?.transcriptFinal || "");
        setIsVerified(Boolean(existingAnswer?.transcriptFinal && existingAnswer?.audioUrl));
        setVerificationMessage(existingAnswer ? "Réponse déjà validée." : "");
        setShowPromptText(false);
        setIsQuestionPlaying(false);
        setHasFinishedFirstPlay(false);
        setPlayUnlockedByReplay(false);
        autoScrollReadyRef.current = false;
        previousMaxUnlockedRankRef.current = 1;
        setAccordionValue(existingAnswer?.transcriptFinal ? "step-3" : existingAnswer?.audioUrl ? "step-2" : "step-1");

        const questionAudioElement = questionAudioRef.current;
        if (questionAudioElement) {
            questionAudioElement.pause();
            questionAudioElement.currentTime = 0;
        }

        setAudioBlob(null);
        setAudioPreviewUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return null;
        });
    }, [existingAnswer, taskId, activityKey]);

    const toggleQuestionPlay = async () => {
        const audio = questionAudioRef.current;
        if (!audio) return;

        if (isQuestionPlaying) {
            audio.pause();
            setIsQuestionPlaying(false);
            return;
        }

        if (hasFinishedFirstPlay && !playUnlockedByReplay) {
            return;
        }

        try {
            await audio.play();
            setIsQuestionPlaying(true);
        } catch {
            toast({
                variant: "destructive",
                title: "Lecture impossible",
                description: "Impossible de lire la question audio.",
            });
        }
    };

    const replayQuestion = async () => {
        const audio = questionAudioRef.current;
        if (!audio || isReplayDisabled) return;

        audio.currentTime = 0;
        try {
            await audio.play();
            setIsQuestionPlaying(true);
            setPlayUnlockedByReplay(true);
        } catch {
            toast({
                variant: "destructive",
                title: "Lecture impossible",
                description: "Impossible de relancer la question audio.",
            });
        }
    };

    const requestShowPrompt = () => {
        if (showPromptText) {
            setShowPromptText(false);
            return;
        }

        if (skipPromptWarning) {
            setShowPromptText(true);
            return;
        }

        setRememberSkipChoice(false);
        setShowPromptWarning(true);
    };

    const confirmShowPrompt = () => {
        if (rememberSkipChoice && typeof window !== "undefined") {
            window.localStorage.setItem(TEXT_WARNING_KEY, "1");
            setSkipPromptWarning(true);
        }
        setShowPromptText(true);
        setShowPromptWarning(false);
    };

    const transcribeAudioBlob = async (blob: Blob) => {
        setIsTranscribing(true);
        setIsVerified(false);
        setVerificationMessage("");

        try {
            const formData = new FormData();
            formData.append("audio", new File([blob], "mock-exam-answer.webm", { type: blob.type || "audio/webm" }));
            formData.append("compilationId", compilationId);
            formData.append("sessionKey", sessionKey);
            formData.append("taskId", taskId);
            formData.append("activityKey", activityKey);

            const response = await fetch("/api/mock-exams/speaking/process", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data?.error || "Transcription impossible.");

            setTranscript(String(data?.transcription || ""));
            setUploadedAudioUrl(String(data?.audioUrl || ""));
            setVerificationMessage("Transcript prêt. Tu peux corriger puis valider.");
        } catch (error) {
            setTranscript("");
            setUploadedAudioUrl("");
            toast({
                variant: "destructive",
                title: "Erreur de transcription",
                description: error instanceof Error ? error.message : "Impossible de transcrire cet enregistrement.",
            });
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleStartRecording = async () => {
        if (!canRecord) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            chunksRef.current = [];

            const preferredMimeType = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
            const recorder = new MediaRecorder(stream, preferredMimeType ? { mimeType: preferredMimeType } : undefined);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
                if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);

                const nextPreviewUrl = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioPreviewUrl(nextPreviewUrl);
                setAttemptCount((prev) => Math.min(MAX_ATTEMPTS, prev + 1));
                setIsRecording(false);
                setRecordingDuration(0);
                setTranscript("");
                setUploadedAudioUrl("");
                setIsVerified(false);
                setVerificationMessage("");
                stopTimers();
                stopActiveStream();
                void transcribeAudioBlob(blob);
            };

            recorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            intervalRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);

            autoStopTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state !== "inactive") {
                    mediaRecorderRef.current?.stop();
                }
            }, AUTO_STOP_SECONDS * 1000);
        } catch {
            toast({
                variant: "destructive",
                title: "Micro indisponible",
                description: "Impossible d'accéder au micro. Vérifie les permissions du navigateur.",
            });
        }
    };

    const handleStopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== "inactive") recorder.stop();
    };

    const handleRetake = () => {
        if (attemptCount >= MAX_ATTEMPTS || isRecording) return;
        if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
        setAudioBlob(null);
        setAudioPreviewUrl(null);
        setTranscript("");
        setUploadedAudioUrl("");
        setIsTranscribing(false);
        setIsVerified(false);
        setVerificationMessage("");
        setAccordionValue("step-2");
    };

    const handleAccordionChange = (value: string) => {
        if (!isAccordionStep(value)) return;
        if (!isStepUnlocked(value)) return;
        setAccordionValue(value);
    };

    const handleValidate = async () => {
        if (!canValidate) return;

        const verification = buildTranscriptVerification(transcript);
        setIsVerified(verification.ok);
        setVerificationMessage(verification.message);
        if (!verification.ok) return;

        setIsSaving(true);
        try {
            const result = await saveMockExamSpeakingAnswer({
                compilationId,
                sessionKey,
                taskId,
                activityKey,
                audioUrl: uploadedAudioUrl,
                transcriptFinal: transcript,
            });

            if (!result.ok || !result.answer) {
                toast({
                    variant: "destructive",
                    title: "Validation impossible",
                    description: result.error || "La réponse n'a pas pu être sauvegardée.",
                });
                return;
            }

            onAnswerSaved(result.answer);
            toast({ title: "Réponse enregistrée", description: "Ta réponse orale a bien été validée." });
            await onValidated();
        } catch {
            toast({
                variant: "destructive",
                title: "Erreur inattendue",
                description: "La validation a échoué.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <article className="flex h-full min-h-0 flex-col justify-between gap-3 px-2 py-2 pb-24 md:pb-5 md:px-4 md:py-5">
                <div className="flex flex-col gap-4">
                    <Accordion type="single" collapsible={false} value={accordionValue} onValueChange={handleAccordionChange} className="w-full space-y-4">
                        <AccordionItem
                            value="step-1"
                            className={clsx(
                                "overflow-hidden rounded-2xl border-0 px-3 border border-solid border-neutral-400 rounded-xl bg-neutral-100",
                                isQuestionStepActive ? "border-2 border-solid border-neutral-400 shadow-1" : "",
                            )}
                        >
                            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:hidden">
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors", questionStepClass)}>1</span>
                                        <span className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Consigne</span>
                                    </div>
                                    <span
                                        className={clsx(
                                            "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors",
                                            isStep1Done ? "border-secondary-2 bg-secondary-2 text-neutral-100" : "border-neutral-300 text-transparent",
                                        )}
                                    >
                                        <FaCheck />
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                {questionAudio ? (
                                    <>
                                        <audio ref={questionAudioRef} src={questionAudio} preload="auto" crossOrigin="anonymous" className="absolute h-0 w-0 opacity-0 pointer-events-none" />
                                        <div className="mt-2 flex w-full flex-col items-center justify-center gap-6">
                                            <VisualizerBars audioRef={questionAudioRef} isPlaying={isQuestionPlaying} barCount={16} minBarHeight={2} maxBarHeight={120} className="h-20" />
                                            <div className="mb-2 flex w-full items-end justify-center gap-4">
                                                <button
                                                    onClick={replayQuestion}
                                                    disabled={isReplayDisabled}
                                                    aria-label="Répéter cette piste"
                                                    className={`bg-neutral-200 p-3 rounded-full flex items-center justify-center border-2 border-neutral-800 border-solid ${
                                                        isReplayDisabled ? "opacity-40 cursor-not-allowed" : ""
                                                    }`}
                                                >
                                                    <FaRedoAlt size={20} className="text-neutral-800" />
                                                </button>
                                                <button
                                                    onClick={toggleQuestionPlay}
                                                    aria-label={isQuestionPlaying ? "Pause" : "Lecture"}
                                                    disabled={isPlayDisabled}
                                                    className={`bg-neutral-200 p-3 rounded-full flex items-center justify-center border-2 border-neutral-800 border-solid ${
                                                        isPlayDisabled ? "opacity-40 cursor-not-allowed" : ""
                                                    }`}
                                                >
                                                    {isQuestionPlaying ? <FaPause size={32} className="text-neutral-800" /> : <FaPlay size={32} className="text-neutral-800" />}
                                                </button>
                                                {promptText && (
                                                    <button
                                                        type="button"
                                                        className="bg-neutral-200 p-3 rounded-full flex items-center justify-center border-2 border-neutral-800 border-solid"
                                                        onClick={requestShowPrompt}
                                                    >
                                                        {showPromptText ? (
                                                            <FaRegEyeSlash title="Masquer le texte" size={20} className="text-neutral-800" />
                                                        ) : (
                                                            <FaRegEye title="Voir le texte" size={20} className="text-neutral-800" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <AnimatePresence initial={false}>
                                            {showPromptText && promptText && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.28 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 text-sm text-neutral-800 lg:mt-8">
                                                        <PortableText value={promptText as any} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <p className="mb-0 text-sm text-neutral-600">Aucun audio pour cette question.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                            value="step-2"
                            ref={answerStepRef}
                            className={clsx(
                                "overflow-hidden rounded-2xl border-0 px-3 border border-solid border-neutral-400 rounded-xl bg-neutral-100",
                                isAnswerStepActive ? "border-2 border-solid border-neutral-400 shadow-1" : "",
                            )}
                        >
                            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:hidden">
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors", answerStepClass)}>2</span>
                                        <span className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Réponse</span>
                                    </div>
                                    <span
                                        className={clsx(
                                            "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors",
                                            isStep2Done ? "border-secondary-2 bg-secondary-2 text-neutral-100" : "border-neutral-300 text-transparent",
                                        )}
                                    >
                                        <FaCheck />
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3 min-h-[160px]">
                                <div className="flex min-h-0 flex-col items-center justify-center gap-4 text-center">
                                    {!isVerifyStepActive && <p className="italic bs mt-4 mb-0 font-bold text-neutral-800 animate-pulse">À toi de répondre</p>}
                                    {(!sourceAudio || isRecording) && (
                                        <button type="button" className={clsx("roundButton", "bg-secondary-4")} onClick={isRecording ? handleStopRecording : handleStartRecording}>
                                            {isRecording ? <FaStop /> : <FaMicrophone />}
                                        </button>
                                    )}

                                    {isRecording && <RecordingIndicator />}

                                    {sourceAudio && (
                                        <div className="w-full max-w-md flex gap-2">
                                            <button
                                                onClick={handleRetake}
                                                className="h-full rounded-full aspect-square flex justify-center items-center transition transform translate_on_hover hover:opacity-80"
                                                style={{ backgroundColor: "var(--neutral-300)" }}
                                            >
                                                <FaRedoAlt style={{ color: "#0b0b0b" }} />
                                            </button>
                                            <audio controls src={sourceAudio} className="w-full" />
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                            value="step-3"
                            ref={verifyStepRef}
                            className={clsx(
                                "overflow-hidden rounded-2xl border-0 px-3 border border-solid border-neutral-400 rounded-xl bg-neutral-100",
                                isVerifyStepActive ? "border-2 border-solid border-neutral-400 shadow-1" : "",
                            )}
                        >
                            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:hidden">
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors", verifyStepClass)}>3</span>
                                        <span className="text-sm font-semibold uppercase tracking-wide text-neutral-700">VÉRIFIE</span>
                                    </div>
                                    <span
                                        className={clsx(
                                            "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors",
                                            isStep3Done ? "border-secondary-2 bg-secondary-2 text-neutral-100" : "border-neutral-300 text-transparent",
                                        )}
                                    >
                                        <FaCheck />
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="flex min-h-0 flex-col items-center justify-center gap-4 text-center">
                                    {isTranscribing && (
                                        <div className="flex flex-col items-center justify-center gap-2 pt-2">
                                            <FaSpinner className="animate-spin text-neutral-500 text-xl" />
                                            <p className="mb-0 text-sm text-neutral-600">Transcription en cours…</p>
                                        </div>
                                    )}

                                    {!!transcript && (
                                        <div className="w-full max-w-md space-y-2">
                                            <textarea
                                                value={transcript}
                                                onChange={(event) => {
                                                    setTranscript(event.target.value);
                                                    setIsVerified(false);
                                                    setVerificationMessage("");
                                                }}
                                                rows={4}
                                                className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 outline-none transition focus:border-secondary-2"
                                            />
                                            {verificationMessage && <p className="mb-0 text-sm italic">{verificationMessage}</p>}
                                        </div>
                                    )}

                                    {!isTranscribing && !transcript && <p className="mb-0 text-sm text-neutral-600">La transcription apparaîtra ici après l'enregistrement.</p>}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div className="mt-1 hidden justify-end md:flex">
                    <button
                        type="button"
                        className={clsx(
                            "btn btn-primary small min-w-[220px]",
                            canValidate ? "bg-secondary-2 border border-solid border-secondary-2 hover:opacity-90" : "bg-neutral-300 text-neutral-700",
                        )}
                        onClick={handleValidate}
                        disabled={!canValidate}
                    >
                        {isSaving || isAdvancing ? (
                            <span className="inline-flex items-center gap-2">
                                <FaSpinner className="animate-spin" />
                                Validation…
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <FaCheck />
                                {submitLabel}
                            </span>
                        )}
                    </button>
                </div>
            </article>

            <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden bg-neutral-200" style={{ borderTop: "1px solid var(--neutral-300)", boxShadow: "0 -6px 16px rgba(15, 23, 42, 0.14)" }}>
                <button
                    type="button"
                    className={clsx("btn btn-primary small w-full", canValidate ? "bg-secondary-2 border border-solid border-secondary-2 hover:opacity-90" : "bg-neutral-300 text-neutral-700")}
                    onClick={handleValidate}
                    disabled={!canValidate}
                >
                    {isSaving || isAdvancing ? (
                        <span className="inline-flex items-center gap-2">
                            <FaSpinner className="animate-spin" />
                            Validation…
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            <FaCheck />
                            {submitLabel}
                        </span>
                    )}
                </button>
            </div>

            <ModalFromBottomWithPortal
                open={showPromptWarning}
                data={{
                    setOpen: setShowPromptWarning,
                    title: "Afficher le texte ?",
                    message: (
                        <div className="space-y-3">
                            <p className="mb-0">Pendant l'examen officiel, le texte n'est pas accessible. Voulez-vous continuer ici malgré tout ?</p>
                            <label className="mb-0 inline-flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={rememberSkipChoice} onChange={(event) => setRememberSkipChoice(event.target.checked)} className="h-4 w-4" />
                                Ne plus demander
                            </label>
                        </div>
                    ),
                    buttonAnnulerStr: "Annuler",
                    buttonOkStr: "Afficher",
                    clickOutside: true,
                    functionCancel: () => setShowPromptWarning(false),
                    functionOk: confirmShowPrompt,
                }}
            />
        </>
    );
}
