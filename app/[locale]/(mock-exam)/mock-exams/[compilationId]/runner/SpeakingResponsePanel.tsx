"use client";

import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { PortableText } from "@portabletext/react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck, FaMicrophone, FaPause, FaPlay, FaRedoAlt, FaRegEye, FaRegEyeSlash, FaSpinner, FaStop } from "react-icons/fa";
import VisualizerBars from "@/app/components/common/VisualizerBars";
import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import { useToast } from "@/app/hooks/use-toast";
import { saveMockExamSpeakingAnswer } from "@/app/serverActions/mockExamActions";
import type { PortableText as PortableTextType, SpeakingAnswer, TaskType } from "@/app/types/fide/mock-exam";
import { RecordingIndicator } from "@/app/components/common/AudioOverlayPlayer";
import { buildConversationPrompt } from "./prompt-base";
import { resolveConversationVoice } from "./conversation-voice";

type SpeakingResponsePanelProps = {
    compilationId: string;
    sessionKey: string;
    taskId: string;
    activityKey: string;
    taskType?: TaskType;
    taskAiContext?: string;
    activityAiContext?: string;
    activityAiVoiceGender?: string;
    questionAudioUrl?: string;
    promptText?: PortableTextType;
    existingAnswer?: SpeakingAnswer;
    isAdvancing: boolean;
    onAnswerSaved: (answer: SpeakingAnswer) => void;
    onValidated: () => Promise<void>;
};

type AccordionStep = "step-1" | "step-2" | "step-3" | "step-4";
type SpeakerRole = "student" | "examiner";
type Segment = { start: number; end: number; text: string };
type TranscriptionResult = { text: string; segments: Segment[] };
type SpeakerSegment = { speaker: SpeakerRole; start: number; text: string };
type DialogueTurn = { speaker: SpeakerRole; text: string; start: number };
type RealtimeDialogueTurn = { itemId: string; speaker: SpeakerRole; text: string };

const DEFAULT_MAX_ATTEMPTS = 3;
const CONVERSATION_MAX_ATTEMPTS = 2;
const AUTO_STOP_SECONDS = 5 * 60;
const CONVERSATION_DURATION_SECONDS = 4 * 60;
const CONVERSATION_WARNING_SECONDS = 30;
const REALTIME_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";
const TEXT_WARNING_KEY = "mock_exam_show_text_without_warning";
const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;
const STEP_RANK: Record<AccordionStep, number> = {
    "step-1": 1,
    "step-2": 2,
    "step-3": 3,
    "step-4": 4,
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

const formatTimer = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60)
        .toString()
        .padStart(2, "0");
    const restSeconds = (safeSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${restSeconds}`;
};

export default function SpeakingResponsePanel({
    compilationId,
    sessionKey,
    taskId,
    activityKey,
    taskType,
    taskAiContext,
    activityAiContext,
    activityAiVoiceGender,
    questionAudioUrl,
    promptText,
    existingAnswer,
    isAdvancing,
    onAnswerSaved,
    onValidated,
}: SpeakingResponsePanelProps) {
    const { toast } = useToast();
    const isConversationTask = taskType === "PHONE_CONVERSATION_A2";
    const maxAttempts = isConversationTask ? CONVERSATION_MAX_ATTEMPTS : DEFAULT_MAX_ATTEMPTS;

    const [attemptCount, setAttemptCount] = useState(existingAnswer ? 1 : 0);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
    const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string>(existingAnswer?.audioUrl || "");
    const [transcript, setTranscript] = useState(existingAnswer?.transcriptFinal || "");
    const [conversationTurns, setConversationTurns] = useState<DialogueTurn[]>([]);
    const [isConversationConnecting, setIsConversationConnecting] = useState(false);
    const [isConversationLive, setIsConversationLive] = useState(false);
    const [conversationRemainingSeconds, setConversationRemainingSeconds] = useState(CONVERSATION_DURATION_SECONDS);
    const [conversationWarningPulseKey, setConversationWarningPulseKey] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerified, setIsVerified] = useState(Boolean(existingAnswer?.transcriptFinal && existingAnswer?.audioUrl));
    const [verificationMessage, setVerificationMessage] = useState<string>(existingAnswer ? "Réponse déjà validée." : "");

    const [isQuestionPlaying, setIsQuestionPlaying] = useState(false);
    const [hasFinishedFirstPlay, setHasFinishedFirstPlay] = useState(false);
    const [playUnlockedByReplay, setPlayUnlockedByReplay] = useState(false);
    const [accordionValue, setAccordionValue] = useState<AccordionStep>("step-1");
    const [hasAcknowledgedObservation, setHasAcknowledgedObservation] = useState(Boolean(existingAnswer));
    const [showPromptText, setShowPromptText] = useState(false);
    const [showPromptWarning, setShowPromptWarning] = useState(false);
    const [skipPromptWarning, setSkipPromptWarning] = useState(false);
    const [rememberSkipChoice, setRememberSkipChoice] = useState(false);

    const questionAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const localConversationRecorderRef = useRef<MediaRecorder | null>(null);
    const remoteConversationRecorderRef = useRef<MediaRecorder | null>(null);
    const localConversationChunksRef = useRef<Blob[]>([]);
    const remoteConversationChunksRef = useRef<Blob[]>([]);
    const localConversationStartRef = useRef<number | null>(null);
    const remoteConversationStartRef = useRef<number | null>(null);
    const conversationPeerRef = useRef<RTCPeerConnection | null>(null);
    const conversationDataChannelRef = useRef<RTCDataChannel | null>(null);
    const remoteConversationStreamRef = useRef<MediaStream | null>(null);
    const conversationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const conversationAutoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const realtimeTurnsByItemRef = useRef<Map<string, RealtimeDialogueTurn>>(new Map());
    const realtimeItemOrderRef = useRef<Map<string, number>>(new Map());
    const realtimePreviousItemRef = useRef<Map<string, string | null>>(new Map());
    const realtimeItemCounterRef = useRef(0);
    const hasConversationWarningBeenShownRef = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const answerStepRef = useRef<HTMLDivElement | null>(null);
    const verifyStepRef = useRef<HTMLDivElement | null>(null);
    const autoScrollReadyRef = useRef(false);
    const previousMaxUnlockedRankRef = useRef(1);

    const canRecord = !isRecording && !isConversationLive && !isConversationConnecting && attemptCount < maxAttempts && !isTranscribing && !isSaving && !isAdvancing;
    const canValidate = !!uploadedAudioUrl && transcript.trim().length > 0 && !isSaving && !isAdvancing;

    const sourceAudio = useMemo(() => audioPreviewUrl || withCloudFrontPrefix(uploadedAudioUrl) || null, [audioPreviewUrl, uploadedAudioUrl]);
    const questionAudio = useMemo(() => withCloudFrontPrefix(questionAudioUrl), [questionAudioUrl]);
    const conversationPrompt = useMemo(() => buildConversationPrompt(taskAiContext, activityAiContext), [taskAiContext, activityAiContext]);
    const conversationVoice = useMemo(() => resolveConversationVoice(activityAiVoiceGender), [activityAiVoiceGender]);
    const hasObservationStep = Boolean(taskType?.startsWith("IMAGE_DESCRIPTION"));
    const isPlayDisabled = !questionAudio || (hasFinishedFirstPlay && !isQuestionPlaying && !playUnlockedByReplay);
    const isReplayDisabled = !questionAudio || !hasFinishedFirstPlay || isQuestionPlaying;
    const hasAnswerDraft = Boolean(sourceAudio) || isRecording || isConversationLive || isTranscribing || transcript.trim().length > 0;
    const hasCompletedQuestionStep = !questionAudio || hasFinishedFirstPlay || hasAnswerDraft;
    const hasCompletedAnswerStep = isTranscribing || transcript.trim().length > 0;
    const hasCompletedObservationStep = !hasObservationStep || hasAcknowledgedObservation || hasCompletedQuestionStep || hasCompletedAnswerStep;

    const observationStepValue: AccordionStep = "step-1";
    const questionStepValue: AccordionStep = hasObservationStep ? "step-2" : "step-1";
    const answerStepValue: AccordionStep = hasObservationStep ? "step-3" : "step-2";
    const verifyStepValue: AccordionStep = hasObservationStep ? "step-4" : "step-3";

    const isObservationStepActive = hasObservationStep && !hasCompletedObservationStep;
    const isQuestionStepActive = hasObservationStep ? hasCompletedObservationStep && !hasCompletedQuestionStep : !hasCompletedQuestionStep;
    const isAnswerStepActive = hasCompletedQuestionStep && !hasCompletedAnswerStep;
    const isVerifyStepActive = hasCompletedAnswerStep;

    const isStep1Done = hasObservationStep ? hasCompletedObservationStep : hasCompletedQuestionStep;
    const isStep2Done = hasObservationStep ? hasCompletedQuestionStep : hasCompletedAnswerStep;
    const isStep3Done = hasObservationStep ? hasCompletedAnswerStep : canValidate;
    const isStep4Done = hasObservationStep ? canValidate : false;
    const questionStepNumber = hasObservationStep ? 2 : 1;
    const answerStepNumber = hasObservationStep ? 3 : 2;
    const verifyStepNumber = hasObservationStep ? 4 : 3;
    const questionDone = hasObservationStep ? isStep2Done : isStep1Done;
    const answerDone = hasObservationStep ? isStep3Done : isStep2Done;
    const verifyDone = hasObservationStep ? isStep4Done : isStep3Done;
    const canRetakeNow = Boolean(sourceAudio) && attemptCount < maxAttempts && !isRecording && !isConversationLive && !isConversationConnecting && !isTranscribing && !isSaving && !isAdvancing;

    const submitLabel = isVerifyStepActive ? "Valider" : "Continuer";
    const observationStepClass = isObservationStepActive ? "bg-secondary-2 text-neutral-100" : "bg-neutral-300 text-neutral-800";
    const questionStepClass = isQuestionStepActive ? "bg-secondary-2 text-neutral-100" : "bg-neutral-300 text-neutral-800";
    const answerStepClass = isAnswerStepActive ? "bg-secondary-2 text-neutral-100" : "bg-neutral-300 text-neutral-800";
    const verifyStepClass = isVerifyStepActive ? "bg-secondary-2 text-neutral-100" : "bg-neutral-300 text-neutral-800";
    const isConversationWarning = isConversationLive && conversationRemainingSeconds <= CONVERSATION_WARNING_SECONDS;

    const isAccordionStep = (value: string): value is AccordionStep => value === "step-1" || value === "step-2" || value === "step-3" || value === "step-4";

    const isStepUnlocked = (value: AccordionStep) => {
        if (value === observationStepValue) return true;
        if (value === questionStepValue) return hasObservationStep ? true : hasCompletedQuestionStep;
        if (value === answerStepValue) return hasCompletedQuestionStep;
        if (value === verifyStepValue) return hasCompletedAnswerStep;
        return false;
    };

    const maxUnlockedStep: AccordionStep = hasObservationStep
        ? hasCompletedAnswerStep
            ? "step-4"
            : hasCompletedQuestionStep
              ? "step-3"
              : hasCompletedObservationStep
                ? "step-2"
                : "step-1"
        : hasCompletedAnswerStep
          ? "step-3"
          : hasCompletedQuestionStep
            ? "step-2"
            : "step-1";

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
                if (maxUnlockedStep === answerStepValue) {
                    answerStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                if (maxUnlockedStep === verifyStepValue) {
                    verifyStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }

        previousMaxUnlockedRankRef.current = nextRank;
    }, [answerStepValue, maxUnlockedStep, verifyStepValue]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setSkipPromptWarning(window.localStorage.getItem(TEXT_WARNING_KEY) === "1");
    }, []);

    const handleQuestionAudioPlay = () => {
        setIsQuestionPlaying(true);
    };

    const handleQuestionAudioPause = () => {
        setIsQuestionPlaying(false);
    };

    const handleQuestionAudioEnded = () => {
        setIsQuestionPlaying(false);
        setHasFinishedFirstPlay(true);
        setPlayUnlockedByReplay(false);
        setAccordionValue((current) => (STEP_RANK[current] < STEP_RANK[answerStepValue] ? answerStepValue : current));
    };

    useEffect(() => {
        if (!isConversationLive) return;
        if (conversationRemainingSeconds > CONVERSATION_WARNING_SECONDS) return;
        if (hasConversationWarningBeenShownRef.current) return;

        hasConversationWarningBeenShownRef.current = true;
        setConversationWarningPulseKey((prev) => prev + 1);
        toast({
            variant: "destructive",
            title: "Plus que 30 secondes",
            description: "La conversation va se couper automatiquement.",
        });
    }, [conversationRemainingSeconds, isConversationLive, toast]);

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
        if (conversationIntervalRef.current) {
            clearInterval(conversationIntervalRef.current);
            conversationIntervalRef.current = null;
        }
        if (conversationAutoStopTimeoutRef.current) {
            clearTimeout(conversationAutoStopTimeoutRef.current);
            conversationAutoStopTimeoutRef.current = null;
        }
    };

    const normalizeTranscriptChunk = (value: string) => value.replace(/\s+/g, " ").trim();

    const resetRealtimeTranscriptBuffers = () => {
        realtimeTurnsByItemRef.current.clear();
        realtimeItemOrderRef.current.clear();
        realtimePreviousItemRef.current.clear();
        realtimeItemCounterRef.current = 0;
    };

    const registerRealtimeItem = (itemId?: string | null, previousItemId?: string | null) => {
        if (!itemId) return;

        if (!realtimeItemOrderRef.current.has(itemId)) {
            realtimeItemOrderRef.current.set(itemId, realtimeItemCounterRef.current);
            realtimeItemCounterRef.current += 1;
        }

        if (previousItemId !== undefined) {
            realtimePreviousItemRef.current.set(itemId, previousItemId ?? null);
        }
    };

    const extractRealtimeItemText = (item: unknown) => {
        if (!item || typeof item !== "object") return "";
        const record = item as { content?: unknown };
        if (!Array.isArray(record.content)) return "";

        const parts = record.content
            .map((contentPart) => {
                if (!contentPart || typeof contentPart !== "object") return "";
                const part = contentPart as { transcript?: unknown; text?: unknown };
                if (typeof part.transcript === "string") return part.transcript;
                if (typeof part.text === "string") return part.text;
                return "";
            })
            .filter(Boolean);

        return normalizeTranscriptChunk(parts.join(" "));
    };

    const upsertRealtimeTurn = (itemId: string | null | undefined, speaker: SpeakerRole, text: string) => {
        const normalizedText = normalizeTranscriptChunk(text);
        if (!itemId || !normalizedText) return;

        registerRealtimeItem(itemId);
        realtimeTurnsByItemRef.current.set(itemId, {
            itemId,
            speaker,
            text: normalizedText,
        });
    };

    const buildRealtimeDialogueTurns = (): DialogueTurn[] => {
        const realtimeTurns = Array.from(realtimeTurnsByItemRef.current.values()).filter((turn) => turn.text.length > 0);
        if (!realtimeTurns.length) return [];

        const depthMemo = new Map<string, number>();
        const getDepth = (itemId: string, stack = new Set<string>()): number => {
            if (depthMemo.has(itemId)) return depthMemo.get(itemId) as number;
            if (stack.has(itemId)) return realtimeItemOrderRef.current.get(itemId) ?? 0;

            stack.add(itemId);
            const previousItemId = realtimePreviousItemRef.current.get(itemId);
            const depth = previousItemId ? getDepth(previousItemId, stack) + 1 : 0;
            stack.delete(itemId);
            depthMemo.set(itemId, depth);
            return depth;
        };

        realtimeTurns.sort((left, right) => {
            const leftDepth = getDepth(left.itemId);
            const rightDepth = getDepth(right.itemId);
            if (leftDepth !== rightDepth) return leftDepth - rightDepth;
            return (realtimeItemOrderRef.current.get(left.itemId) ?? 0) - (realtimeItemOrderRef.current.get(right.itemId) ?? 0);
        });

        const collapsed: DialogueTurn[] = [];
        for (const turn of realtimeTurns) {
            const lastTurn = collapsed[collapsed.length - 1];
            if (lastTurn && lastTurn.speaker === turn.speaker) {
                lastTurn.text = normalizeTranscriptChunk(`${lastTurn.text} ${turn.text}`);
                continue;
            }

            collapsed.push({
                speaker: turn.speaker,
                text: turn.text,
                start: realtimeItemOrderRef.current.get(turn.itemId) ?? collapsed.length,
            });
        }

        return collapsed;
    };

    const handleRealtimeDataChannelMessage = (rawMessage: string) => {
        const payload = JSON.parse(rawMessage) as Record<string, unknown>;
        const type = typeof payload.type === "string" ? payload.type : "";
        if (!type) return;

        if (type === "input_audio_buffer.committed") {
            const itemId = typeof payload.item_id === "string" ? payload.item_id : null;
            const previousItemId = typeof payload.previous_item_id === "string" ? payload.previous_item_id : null;
            registerRealtimeItem(itemId, previousItemId);
            return;
        }

        if (type === "conversation.item.created") {
            const item = payload.item && typeof payload.item === "object" ? (payload.item as Record<string, unknown>) : null;
            const itemId = item && typeof item.id === "string" ? item.id : typeof payload.item_id === "string" ? payload.item_id : null;
            const previousItemId = typeof payload.previous_item_id === "string" ? payload.previous_item_id : null;
            registerRealtimeItem(itemId, previousItemId);

            const role = item && typeof item.role === "string" ? item.role : "";
            if (role === "assistant") {
                upsertRealtimeTurn(itemId, "examiner", extractRealtimeItemText(item));
            }
            if (role === "user") {
                upsertRealtimeTurn(itemId, "student", extractRealtimeItemText(item));
            }
            return;
        }

        if (type === "conversation.item.input_audio_transcription.completed") {
            const itemId = typeof payload.item_id === "string" ? payload.item_id : null;
            const transcriptText = typeof payload.transcript === "string" ? payload.transcript : "";
            upsertRealtimeTurn(itemId, "student", transcriptText);
            return;
        }

        if (type === "response.output_item.done") {
            const item = payload.item && typeof payload.item === "object" ? (payload.item as Record<string, unknown>) : null;
            const itemId = item && typeof item.id === "string" ? item.id : null;
            registerRealtimeItem(itemId);
            const role = item && typeof item.role === "string" ? item.role : "";
            if (role === "assistant") {
                upsertRealtimeTurn(itemId, "examiner", extractRealtimeItemText(item));
            }
            return;
        }

        if (type === "response.audio_transcript.done") {
            const itemId = typeof payload.item_id === "string" ? payload.item_id : null;
            const transcriptText = typeof payload.transcript === "string" ? payload.transcript : "";
            upsertRealtimeTurn(itemId, "examiner", transcriptText);
            return;
        }

        if (type === "error") {
            console.warn("Realtime datachannel error event:", payload);
        }
    };

    const closeConversationTransport = () => {
        if (conversationDataChannelRef.current) {
            conversationDataChannelRef.current.close();
            conversationDataChannelRef.current = null;
        }
        if (conversationPeerRef.current) {
            conversationPeerRef.current.close();
            conversationPeerRef.current = null;
        }
        if (remoteConversationStreamRef.current) {
            remoteConversationStreamRef.current.getTracks().forEach((track) => track.stop());
            remoteConversationStreamRef.current = null;
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        return () => {
            stopTimers();
            stopActiveStream();
            closeConversationTransport();
            resetRealtimeTranscriptBuffers();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
        };
    }, [audioPreviewUrl]);

    useEffect(() => {
        stopTimers();
        setAttemptCount(existingAnswer ? 1 : 0);
        setUploadedAudioUrl(existingAnswer?.audioUrl || "");
        setTranscript(existingAnswer?.transcriptFinal || "");
        setConversationTurns([]);
        setIsConversationConnecting(false);
        setIsVerified(Boolean(existingAnswer?.transcriptFinal && existingAnswer?.audioUrl));
        setVerificationMessage(existingAnswer ? "Réponse déjà validée." : "");
        setShowPromptText(false);
        setIsConversationLive(false);
        setIsRecording(false);
        setRecordingDuration(0);
        setConversationRemainingSeconds(CONVERSATION_DURATION_SECONDS);
        setConversationWarningPulseKey(0);
        hasConversationWarningBeenShownRef.current = false;
        setIsQuestionPlaying(false);
        setHasFinishedFirstPlay(false);
        setPlayUnlockedByReplay(false);
        setHasAcknowledgedObservation(Boolean(existingAnswer));
        autoScrollReadyRef.current = false;
        previousMaxUnlockedRankRef.current = 1;
        setAccordionValue(
            hasObservationStep
                ? existingAnswer?.transcriptFinal
                    ? "step-4"
                    : existingAnswer?.audioUrl
                      ? "step-3"
                      : "step-1"
                : existingAnswer?.transcriptFinal
                  ? "step-3"
                  : existingAnswer?.audioUrl
                    ? "step-2"
                    : "step-1",
        );

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
        localConversationChunksRef.current = [];
        remoteConversationChunksRef.current = [];
        localConversationStartRef.current = null;
        remoteConversationStartRef.current = null;
        resetRealtimeTranscriptBuffers();
        closeConversationTransport();
    }, [activityKey, existingAnswer, hasObservationStep, taskId]);

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

    const stopRecorderAndBuildBlob = async (recorderRef: MutableRefObject<MediaRecorder | null>, chunksRef: MutableRefObject<Blob[]>) => {
        const recorder = recorderRef.current;
        if (!recorder) return null;

        return await new Promise<Blob | null>((resolve) => {
            const finalize = () => {
                const hasAudio = chunksRef.current.length > 0;
                const blob = hasAudio ? new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }) : null;
                chunksRef.current = [];
                recorderRef.current = null;
                resolve(blob);
            };

            recorder.onstop = finalize;
            recorder.onerror = finalize;

            if (recorder.state === "inactive") {
                finalize();
                return;
            }

            recorder.stop();
        });
    };

    const uploadStudentAudio = async (blob: Blob) => {
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
        const data = (await response.json().catch(() => null)) as { error?: string; audioUrl?: string; transcription?: string } | null;
        if (!response.ok) {
            throw new Error(data?.error || "Transcription impossible.");
        }

        return {
            audioUrl: String(data?.audioUrl || ""),
            transcription: String(data?.transcription || ""),
        };
    };

    const transcribeConversationBlob = async (blob: Blob | null, speaker: SpeakerRole): Promise<TranscriptionResult> => {
        if (!blob || blob.size === 0) return { text: "", segments: [] };

        const formData = new FormData();
        formData.append("audio", new File([blob], `${speaker}.webm`, { type: blob.type || "audio/webm" }));
        formData.append("speaker", speaker);
        formData.append("compilationId", compilationId);
        formData.append("sessionKey", sessionKey);

        const response = await fetch("/api/mock-exams/speaking/conversation/transcribe", {
            method: "POST",
            body: formData,
        });
        const data = (await response.json().catch(() => null)) as { error?: string; text?: string; segments?: Segment[] } | null;
        if (!response.ok) {
            throw new Error(data?.error || "Transcription de conversation impossible.");
        }

        return {
            text: String(data?.text || "").trim(),
            segments: Array.isArray(data?.segments) ? data.segments : [],
        };
    };

    const formatDialogueTranscript = (turns: DialogueTurn[]) => turns.map((turn) => `${turn.speaker === "student" ? "Etudiant" : "Examinateur"}: ${turn.text}`).join("\n");

    const extractStudentTail = (studentFullText: string, studentFromRealtime: string) => {
        const full = normalizeTranscriptChunk(studentFullText);
        const partial = normalizeTranscriptChunk(studentFromRealtime);
        if (!full || !partial || full === partial) return "";

        if (full.startsWith(partial)) {
            return normalizeTranscriptChunk(full.slice(partial.length));
        }

        const fullWords = full.split(" ").filter(Boolean);
        const partialWords = partial.split(" ").filter(Boolean);
        const maxOverlap = Math.min(10, fullWords.length, partialWords.length);

        for (let overlap = maxOverlap; overlap >= 3; overlap -= 1) {
            const suffixWords = partialWords.slice(-overlap);
            const suffix = suffixWords.join(" ");

            for (let index = fullWords.length - overlap; index >= 0; index -= 1) {
                const candidate = fullWords.slice(index, index + overlap).join(" ");
                if (candidate !== suffix) continue;

                const tailWords = fullWords.slice(index + overlap);
                return normalizeTranscriptChunk(tailWords.join(" "));
            }
        }

        return "";
    };

    const mergeRealtimeWithStudentSafetyTranscript = (realtimeTurns: DialogueTurn[], studentFullText: string) => {
        if (!realtimeTurns.length) return realtimeTurns;

        const mergedTurns = realtimeTurns.map((turn) => ({ ...turn }));
        const studentCombined = normalizeTranscriptChunk(
            mergedTurns
                .filter((turn) => turn.speaker === "student")
                .map((turn) => turn.text)
                .join(" "),
        );
        const tail = extractStudentTail(studentFullText, studentCombined);

        if (!tail) return mergedTurns;

        const lastStudentIndex = [...mergedTurns]
            .map((turn, index) => ({ turn, index }))
            .reverse()
            .find((entry) => entry.turn.speaker === "student")?.index;
        if (typeof lastStudentIndex === "number") {
            mergedTurns[lastStudentIndex] = {
                ...mergedTurns[lastStudentIndex],
                text: normalizeTranscriptChunk(`${mergedTurns[lastStudentIndex].text} ${tail}`),
            };
            return mergedTurns;
        }

        mergedTurns.push({
            speaker: "student",
            text: tail,
            start: mergedTurns.length + 1,
        });
        return mergedTurns;
    };

    const transcribeAudioBlob = async (blob: Blob) => {
        setIsTranscribing(true);
        setIsVerified(false);
        setVerificationMessage("");

        try {
            const data = await uploadStudentAudio(blob);
            setTranscript(data.transcription);
            setConversationTurns([]);
            setUploadedAudioUrl(data.audioUrl);
            setVerificationMessage("Transcript prêt. Tu peux corriger puis valider.");
        } catch (error) {
            setTranscript("");
            setConversationTurns([]);
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

    const startConversationRecorder = (stream: MediaStream, recorderRef: MutableRefObject<MediaRecorder | null>, chunksRef: MutableRefObject<Blob[]>, startRef: MutableRefObject<number | null>) => {
        if (typeof MediaRecorder === "undefined" || recorderRef.current) return;
        try {
            const preferredMimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
            const recorder = new MediaRecorder(stream, preferredMimeType ? { mimeType: preferredMimeType } : undefined);
            chunksRef.current = [];
            startRef.current = performance.now();
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };
            recorder.start(250);
            recorderRef.current = recorder;
        } catch (error) {
            console.error("Impossible de demarrer le recorder conversation:", error);
        }
    };

    const handleStartConversation = async () => {
        if (!canRecord) return;

        setIsConversationConnecting(true);
        setIsVerified(false);
        setVerificationMessage("");
        setTranscript("");
        setConversationTurns([]);
        setUploadedAudioUrl("");
        setConversationRemainingSeconds(CONVERSATION_DURATION_SECONDS);
        setConversationWarningPulseKey(0);
        hasConversationWarningBeenShownRef.current = false;
        resetRealtimeTranscriptBuffers();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            startConversationRecorder(stream, localConversationRecorderRef, localConversationChunksRef, localConversationStartRef);

            const peerConnection = new RTCPeerConnection();
            conversationPeerRef.current = peerConnection;

            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, stream);
            });

            peerConnection.ontrack = (event) => {
                const [remoteStream] = event.streams;
                if (!remoteStream) return;

                remoteConversationStreamRef.current = remoteStream;
                startConversationRecorder(remoteStream, remoteConversationRecorderRef, remoteConversationChunksRef, remoteConversationStartRef);

                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = remoteStream;
                    remoteAudioRef.current.play().catch(() => undefined);
                }
            };

            peerConnection.onconnectionstatechange = () => {
                const state = peerConnection.connectionState;
                if (state === "failed" || state === "disconnected" || state === "closed") {
                    stopTimers();
                    setIsConversationConnecting(false);
                    setIsConversationLive(false);
                    setIsRecording(false);
                }
            };

            const dataChannel = peerConnection.createDataChannel("oai-events");
            conversationDataChannelRef.current = dataChannel;
            dataChannel.onmessage = (event) => {
                if (typeof event.data !== "string") return;
                try {
                    handleRealtimeDataChannelMessage(event.data);
                } catch (error) {
                    console.error("Impossible de parser un event realtime:", error);
                }
            };
            dataChannel.onopen = () => {
                dataChannel.send(
                    JSON.stringify({
                        type: "session.update",
                        session: {
                            turn_detection: {
                                type: "server_vad",
                                silence_duration_ms: 2000,
                                create_response: true,
                                interrupt_response: false,
                            },
                            input_audio_transcription: {
                                model: REALTIME_TRANSCRIPTION_MODEL,
                            },
                        },
                    }),
                );
                dataChannel.send(
                    JSON.stringify({
                        type: "response.create",
                        response: {
                            modalities: ["audio", "text"],
                            voice: conversationVoice,
                            instructions: conversationPrompt,
                        },
                    }),
                );
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            if (!offer.sdp || !/^v=0/m.test(offer.sdp)) {
                throw new Error("Offre SDP invalide.");
            }

            const response = await fetch("/api/mock-exams/speaking/conversation/realtime", {
                method: "POST",
                headers: {
                    "Content-Type": "application/sdp",
                    "x-compilation-id": compilationId,
                    "x-session-key": sessionKey,
                    "x-task-id": taskId,
                    "x-activity-key": activityKey,
                },
                body: offer.sdp,
            });

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as { error?: string; details?: string } | null;
                throw new Error(payload?.error || payload?.details || "Connexion conversation impossible.");
            }

            const answerSdp = await response.text();
            await peerConnection.setRemoteDescription({
                type: "answer",
                sdp: answerSdp,
            });

            conversationIntervalRef.current = setInterval(() => {
                setConversationRemainingSeconds((prev) => Math.max(0, prev - 1));
            }, 1000);
            conversationAutoStopTimeoutRef.current = setTimeout(() => {
                void handleStopConversation(true);
            }, CONVERSATION_DURATION_SECONDS * 1000);

            setIsConversationLive(true);
            setIsRecording(true);
            setIsConversationConnecting(false);
        } catch (error) {
            stopTimers();
            closeConversationTransport();
            stopActiveStream();
            setIsConversationConnecting(false);
            setIsConversationLive(false);
            setIsRecording(false);
            toast({
                variant: "destructive",
                title: "Conversation impossible",
                description: error instanceof Error ? error.message : "Impossible de demarrer la conversation.",
            });
        }
    };

    const handleStopConversation = async (forceStop = false) => {
        if (!forceStop && !isConversationLive) return;

        const dataChannel = conversationDataChannelRef.current;
        if (dataChannel && dataChannel.readyState === "open") {
            try {
                dataChannel.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
                dataChannel.send(JSON.stringify({ type: "response.cancel" }));
            } catch {
                // Ignore transport issues during shutdown.
            }
            await new Promise((resolve) => setTimeout(resolve, 400));
        }

        stopTimers();
        setIsConversationConnecting(false);
        setIsConversationLive(false);
        setIsRecording(false);
        setRecordingDuration(0);
        setConversationRemainingSeconds((prev) => (forceStop ? 0 : prev));
        setIsTranscribing(true);
        setIsVerified(false);
        setVerificationMessage("");

        if (forceStop) {
            toast({
                variant: "destructive",
                title: "Temps écoulé",
                description: "La conversation a été arrêtée automatiquement.",
            });
        }

        const studentStart = localConversationStartRef.current;
        const examinerStart = remoteConversationStartRef.current;

        try {
            const [studentBlob, examinerBlob] = await Promise.all([
                stopRecorderAndBuildBlob(localConversationRecorderRef, localConversationChunksRef),
                stopRecorderAndBuildBlob(remoteConversationRecorderRef, remoteConversationChunksRef),
            ]);

            closeConversationTransport();
            stopActiveStream();

            if (!studentBlob) {
                throw new Error("Aucun audio étudiant enregistré.");
            }

            if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
            const nextPreviewUrl = URL.createObjectURL(studentBlob);
            setAudioBlob(studentBlob);
            setAudioPreviewUrl(nextPreviewUrl);
            setAttemptCount((prev) => Math.min(maxAttempts, prev + 1));

            const uploaded = await uploadStudentAudio(studentBlob);
            setUploadedAudioUrl(uploaded.audioUrl);
            const studentSafetyResult = await transcribeConversationBlob(studentBlob, "student");

            const realtimeTurns = buildRealtimeDialogueTurns();
            if (realtimeTurns.length > 0) {
                const safeTurns = mergeRealtimeWithStudentSafetyTranscript(realtimeTurns, studentSafetyResult.text);
                setConversationTurns(safeTurns);
                setTranscript(formatDialogueTranscript(safeTurns));
            } else {
                const examinerResult = await transcribeConversationBlob(examinerBlob, "examiner");
                const studentResult = studentSafetyResult;

                const knownStarts = [studentStart, examinerStart].filter((value): value is number => typeof value === "number");
                const baseStart = knownStarts.length ? Math.min(...knownStarts) : 0;

                const withSpeaker = (role: SpeakerRole, result: TranscriptionResult, recorderStart: number | null): SpeakerSegment[] => {
                    const offset = typeof recorderStart === "number" ? Math.max(0, (recorderStart - baseStart) / 1000) : 0;

                    if (result.segments.length > 0) {
                        return result.segments.map((segment) => ({
                            speaker: role,
                            start: Math.max(0, segment.start + offset),
                            text: String(segment.text || "").trim(),
                        }));
                    }

                    if (result.text) {
                        return [{ speaker: role, start: offset, text: result.text }];
                    }

                    return [];
                };

                const merged = [...withSpeaker("student", studentResult, studentStart), ...withSpeaker("examiner", examinerResult, examinerStart)]
                    .filter((segment) => segment.text.length > 0)
                    .sort((a, b) => {
                        if (a.start !== b.start) return a.start - b.start;
                        if (a.speaker === b.speaker) return 0;
                        return a.speaker === "examiner" ? -1 : 1;
                    });

                const collapsed: DialogueTurn[] = [];
                for (const segment of merged) {
                    const last = collapsed[collapsed.length - 1];
                    if (last && last.speaker === segment.speaker) {
                        last.text = `${last.text} ${segment.text}`.replace(/\s+/g, " ").trim();
                        continue;
                    }
                    collapsed.push({ speaker: segment.speaker, text: segment.text, start: segment.start });
                }

                if (collapsed.length > 0) {
                    setConversationTurns(collapsed);
                    setTranscript(formatDialogueTranscript(collapsed));
                } else {
                    setConversationTurns([]);
                    setTranscript(uploaded.transcription);
                }
            }

            setVerificationMessage("Transcript prêt. Tu peux corriger puis valider.");
        } catch (error) {
            setTranscript("");
            setConversationTurns([]);
            setUploadedAudioUrl("");
            toast({
                variant: "destructive",
                title: "Erreur conversation",
                description: error instanceof Error ? error.message : "Impossible de traiter la conversation.",
            });
        } finally {
            localConversationStartRef.current = null;
            remoteConversationStartRef.current = null;
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
                setAttemptCount((prev) => Math.min(maxAttempts, prev + 1));
                setIsRecording(false);
                setRecordingDuration(0);
                setTranscript("");
                setConversationTurns([]);
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
        if (attemptCount >= maxAttempts || isRecording || isConversationLive || isTranscribing) return;
        stopTimers();
        if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
        setAudioBlob(null);
        setAudioPreviewUrl(null);
        setTranscript("");
        setConversationTurns([]);
        setUploadedAudioUrl("");
        setIsConversationConnecting(false);
        setConversationRemainingSeconds(CONVERSATION_DURATION_SECONDS);
        setConversationWarningPulseKey(0);
        hasConversationWarningBeenShownRef.current = false;
        resetRealtimeTranscriptBuffers();
        setIsVerified(false);
        setVerificationMessage("");
        setAccordionValue(answerStepValue);
    };

    const goToQuestionStep = () => {
        if (!hasObservationStep) return;
        setHasAcknowledgedObservation(true);
        setAccordionValue(questionStepValue);
    };

    const handleAccordionChange = (value: string) => {
        if (!isAccordionStep(value)) return;
        if (!isStepUnlocked(value)) return;
        if (hasObservationStep && STEP_RANK[value] >= STEP_RANK[questionStepValue]) {
            setHasAcknowledgedObservation(true);
        }
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
                        {hasObservationStep && (
                            <AccordionItem
                                value={observationStepValue}
                                className={clsx(
                                    "overflow-hidden rounded-2xl border-0 px-3 border border-solid border-neutral-400 rounded-xl bg-neutral-100",
                                    isObservationStepActive ? "border-2 border-solid border-neutral-400 shadow-1" : "",
                                )}
                            >
                                <AccordionTrigger className="py-3 hover:no-underline [&>svg]:hidden">
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors", observationStepClass)}>1</span>
                                            <span className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Observe l'image</span>
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
                                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                                        <p className="mb-0 text-sm text-neutral-700">Observe l'image quelques secondes puis passe à la consigne audio.</p>
                                        {!isStep1Done && (
                                            <button
                                                type="button"
                                                className="rounded-full border border-solid border-secondary-2 bg-secondary-2 px-4 py-2 text-sm font-semibold text-neutral-100 hover:opacity-90"
                                                onClick={goToQuestionStep}
                                            >
                                                OK
                                            </button>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        <AccordionItem
                            value={questionStepValue}
                            className={clsx(
                                "overflow-hidden rounded-2xl border-0 px-3 border border-solid border-neutral-400 rounded-xl bg-neutral-100",
                                isQuestionStepActive ? "border-2 border-solid border-neutral-400 shadow-1" : "",
                            )}
                        >
                            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:hidden">
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 grow">
                                        <span className={clsx("shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors", questionStepClass)}>
                                            {questionStepNumber}
                                        </span>
                                        <div className="flex flex-wrap gap-y-0 gap-x-2 justify-between items-center w-full grow">
                                            <span className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Écoute la consigne</span>
                                            {questionAudio && hasFinishedFirstPlay && !isReplayDisabled && <span className="text-xs font-semibold text-neutral-600">Écouter à nouveau ?</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={clsx(
                                                "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors",
                                                questionDone ? "border-secondary-2 bg-secondary-2 text-neutral-100" : "border-neutral-300 text-transparent",
                                            )}
                                        >
                                            <FaCheck />
                                        </span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                {questionAudio ? (
                                    <>
                                        <audio
                                            ref={questionAudioRef}
                                            src={questionAudio}
                                            preload="auto"
                                            crossOrigin="anonymous"
                                            onPlay={handleQuestionAudioPlay}
                                            onPause={handleQuestionAudioPause}
                                            onEnded={handleQuestionAudioEnded}
                                            className="absolute h-0 w-0 opacity-0 pointer-events-none"
                                        />
                                        <div className="mt-2 flex w-full flex-col items-center justify-center gap-6">
                                            <VisualizerBars audioRef={questionAudioRef} isPlaying={isQuestionPlaying} barCount={16} minBarHeight={2} maxBarHeight={120} className="h-20" />
                                            <div className="mb-2 flex w-full items-end justify-center gap-4">
                                                <button
                                                    onClick={replayQuestion}
                                                    disabled={isReplayDisabled}
                                                    aria-label="Réécouter la consigne"
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
                            value={answerStepValue}
                            ref={answerStepRef}
                            className={clsx(
                                "overflow-hidden rounded-2xl border-0 px-3 border border-solid border-neutral-400 rounded-xl bg-neutral-100",
                                isAnswerStepActive ? "border-2 border-solid border-neutral-400 shadow-1" : "",
                            )}
                        >
                            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:hidden">
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 grow">
                                        <span className={clsx("shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors", answerStepClass)}>
                                            {answerStepNumber}
                                        </span>
                                        <div className="flex flex-wrap gap-y-0 gap-x-2 justify-between items-center w-full grow">
                                            <span className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Réponds à l'oral</span>
                                            {canRetakeNow && <span className="text-xs font-semibold text-neutral-600">S'enregistrer à nouveau ?</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={clsx(
                                                "shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors",
                                                answerDone ? "border-secondary-2 bg-secondary-2 text-neutral-100" : "border-neutral-300 text-transparent",
                                            )}
                                        >
                                            <FaCheck />
                                        </span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3 min-h-[160px]">
                                <div className="flex min-h-0 flex-col items-center justify-center gap-4 text-center">
                                    {!isVerifyStepActive && (
                                        <p className="italic bs mt-4 mb-0 font-bold text-neutral-800 animate-pulse">{isConversationTask ? "Lance la conversation" : "À toi de répondre"}</p>
                                    )}

                                    {!sourceAudio &&
                                        (isConversationTask ? (
                                            <button
                                                type="button"
                                                className={clsx("roundButton", "bg-secondary-4", isConversationConnecting ? "opacity-50 cursor-not-allowed" : "")}
                                                onClick={isConversationLive ? () => void handleStopConversation() : () => void handleStartConversation()}
                                                disabled={isConversationConnecting || (!canRecord && !isConversationLive)}
                                                aria-label={isConversationLive ? "Terminer la conversation" : "Commencer la conversation"}
                                            >
                                                {isConversationConnecting ? <FaSpinner className="animate-spin" /> : isConversationLive ? <FaStop /> : <FaMicrophone />}
                                            </button>
                                        ) : (
                                            <button type="button" className={clsx("roundButton", "bg-secondary-4")} onClick={isRecording ? handleStopRecording : handleStartRecording}>
                                                {isRecording ? <FaStop /> : <FaMicrophone />}
                                            </button>
                                        ))}

                                    {isConversationTask && (isConversationLive || isConversationConnecting) && (
                                        <motion.div
                                            key={conversationWarningPulseKey}
                                            initial={isConversationWarning ? { x: 0, scale: 1 } : false}
                                            animate={isConversationWarning ? { x: [0, -4, 4, -3, 3, 0], scale: [1, 1.04, 1] } : { x: 0, scale: 1 }}
                                            transition={{ duration: 0.45 }}
                                            className={clsx("rounded-lg px-3 py-1 text-sm font-semibold", isConversationWarning ? "bg-red-50 text-red-600" : "bg-neutral-200 text-neutral-700")}
                                        >
                                            Temps restant: {formatTimer(conversationRemainingSeconds)}
                                        </motion.div>
                                    )}

                                    {isConversationConnecting && (
                                        <div className="flex flex-col items-center justify-center gap-2 pt-1">
                                            <FaSpinner className="animate-spin text-neutral-500 text-xl" />
                                            <p className="mb-0 text-sm text-neutral-600">Connexion à l'examinateur…</p>
                                        </div>
                                    )}

                                    {(isRecording || isConversationLive) && <RecordingIndicator />}

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
                            value={verifyStepValue}
                            ref={verifyStepRef}
                            className={clsx(
                                "overflow-hidden rounded-2xl border-0 px-3 border border-solid border-neutral-400 rounded-xl bg-neutral-100",
                                isVerifyStepActive ? "border-2 border-solid border-neutral-400 shadow-1" : "",
                            )}
                        >
                            <AccordionTrigger className="py-3 hover:no-underline [&>svg]:hidden">
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors", verifyStepClass)}>
                                            {verifyStepNumber}
                                        </span>
                                        <span className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Vérifie la transcription</span>
                                    </div>
                                    <span
                                        className={clsx(
                                            "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors",
                                            verifyDone ? "border-secondary-2 bg-secondary-2 text-neutral-100" : "border-neutral-300 text-transparent",
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
                                        <div className="w-full max-w-2xl min-w-0 space-y-2">
                                            <textarea
                                                value={transcript}
                                                onChange={(event) => {
                                                    setTranscript(event.target.value);
                                                    setIsVerified(false);
                                                    setVerificationMessage("");
                                                }}
                                                rows={8}
                                                className="w-full max-w-full min-h-[220px] resize-y overflow-x-hidden rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 break-words whitespace-pre-wrap outline-none transition focus:border-secondary-2"
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
            <audio ref={remoteAudioRef} autoPlay playsInline className="absolute h-0 w-0 opacity-0 pointer-events-none" />
        </>
    );
}
