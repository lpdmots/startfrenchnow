"use client";

import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { EXAMINER_PROMPT } from "./prompt";

type ConnectionStatus = "idle" | "starting" | "live" | "stopping";
type SpeakerRole = "student" | "examiner";
type Segment = { start: number; end: number; text: string };
type TranscriptionResult = { text: string; segments: Segment[] };
type SpeakerSegment = { speaker: SpeakerRole; start: number; text: string };
type DialogueTurn = { speaker: SpeakerRole; text: string; start: number };

export default function SpeechToSpeechTester() {
    const [status, setStatus] = useState<ConnectionStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [dialogueTurns, setDialogueTurns] = useState<DialogueTurn[]>([]);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    const localRecorderRef = useRef<MediaRecorder | null>(null);
    const remoteRecorderRef = useRef<MediaRecorder | null>(null);
    const localAudioChunksRef = useRef<Blob[]>([]);
    const remoteAudioChunksRef = useRef<Blob[]>([]);
    const localRecorderStartRef = useRef<number | null>(null);
    const remoteRecorderStartRef = useRef<number | null>(null);

    const startStreamRecorder = useCallback(
        (
            stream: MediaStream,
            recorderRef: MutableRefObject<MediaRecorder | null>,
            chunksRef: MutableRefObject<Blob[]>,
            recorderStartRef: MutableRefObject<number | null>,
        ) => {
            if (typeof MediaRecorder === "undefined" || recorderRef.current) return;

            try {
                const recorder = new MediaRecorder(stream);
                chunksRef.current = [];
                recorderStartRef.current = performance.now();
                recorder.ondataavailable = (event: BlobEvent) => {
                    if (event.data.size > 0) {
                        chunksRef.current.push(event.data);
                    }
                };
                recorder.start(250);
                recorderRef.current = recorder;
            } catch (error) {
                console.error("Impossible de demarrer MediaRecorder:", error);
            }
        },
        [],
    );

    const stopRecorderAndBuildBlob = useCallback(
        async (recorderRef: MutableRefObject<MediaRecorder | null>, chunksRef: MutableRefObject<Blob[]>) => {
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
        },
        [],
    );

    const cleanupSession = useCallback(() => {
        const localRecorder = localRecorderRef.current;
        if (localRecorder && localRecorder.state !== "inactive") {
            localRecorder.stop();
        }
        localRecorderRef.current = null;
        localAudioChunksRef.current = [];
        localRecorderStartRef.current = null;

        const remoteRecorder = remoteRecorderRef.current;
        if (remoteRecorder && remoteRecorder.state !== "inactive") {
            remoteRecorder.stop();
        }
        remoteRecorderRef.current = null;
        remoteAudioChunksRef.current = [];
        remoteRecorderStartRef.current = null;

        const dataChannel = dataChannelRef.current;
        if (dataChannel) {
            dataChannel.close();
            dataChannelRef.current = null;
        }

        const peerConnection = peerConnectionRef.current;
        if (peerConnection) {
            peerConnection.close();
            peerConnectionRef.current = null;
        }

        const localStream = localStreamRef.current;
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
    }, []);

    const transcribeBlob = useCallback(async (blob: Blob | null, speaker: SpeakerRole): Promise<TranscriptionResult> => {
        if (!blob || blob.size === 0) return { text: "", segments: [] };

        const formData = new FormData();
        formData.append("audio", blob, `${speaker}.webm`);
        formData.append("speaker", speaker);

        const response = await fetch("/test/transcribe", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string; details?: string } | null;
            const details = payload?.details ? ` (${payload.details})` : "";
            throw new Error((payload?.error || "Erreur de transcription.") + details);
        }

        const payload = (await response.json()) as { text?: string; segments?: Segment[] };
        return {
            text: String(payload?.text || "").trim(),
            segments: Array.isArray(payload?.segments) ? payload.segments : [],
        };
    }, []);

    const stopConversation = useCallback(async () => {
        if (status !== "live") return;

        setStatus("stopping");
        setTranscriptionError(null);
        setErrorMessage(null);

        try {
            const studentStart = localRecorderStartRef.current;
            const examinerStart = remoteRecorderStartRef.current;

            const [studentBlob, examinerBlob] = await Promise.all([
                stopRecorderAndBuildBlob(localRecorderRef, localAudioChunksRef),
                stopRecorderAndBuildBlob(remoteRecorderRef, remoteAudioChunksRef),
            ]);

            cleanupSession();
            setStatus("idle");

            if (!studentBlob && !examinerBlob) {
                setTranscriptionError("Aucun audio enregistre pour lancer la transcription.");
                return;
            }

            setIsTranscribing(true);
            const [studentResult, examinerResult] = await Promise.all([transcribeBlob(studentBlob, "student"), transcribeBlob(examinerBlob, "examiner")]);

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
                .sort((a, b) => a.start - b.start);

            const collapsed: DialogueTurn[] = [];
            for (const segment of merged) {
                const last = collapsed[collapsed.length - 1];
                if (last && last.speaker === segment.speaker) {
                    last.text = `${last.text} ${segment.text}`.replace(/\s+/g, " ").trim();
                    continue;
                }
                collapsed.push({
                    speaker: segment.speaker,
                    text: segment.text,
                    start: segment.start,
                });
            }

            if (!collapsed.length) {
                setTranscriptionError("Impossible de generer un dialogue alterne avec les enregistrements.");
                return;
            }
            setDialogueTurns(collapsed);
        } catch (error) {
            setTranscriptionError(error instanceof Error ? error.message : "Erreur inconnue pendant la transcription.");
        } finally {
            setIsTranscribing(false);
        }
    }, [cleanupSession, status, stopRecorderAndBuildBlob, transcribeBlob]);

    const sendInitialPrompt = useCallback(() => {
        const dataChannel = dataChannelRef.current;
        if (!dataChannel || dataChannel.readyState !== "open") return;

        dataChannel.send(
            JSON.stringify({
                type: "response.create",
                response: {
                    modalities: ["audio", "text"],
                    instructions: EXAMINER_PROMPT,
                },
            }),
        );
    }, []);

    const startConversation = useCallback(async () => {
        if (status !== "idle") return;

        setErrorMessage(null);
        setTranscriptionError(null);
        setDialogueTurns([]);
        setStatus("starting");

        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = localStream;
            startStreamRecorder(localStream, localRecorderRef, localAudioChunksRef, localRecorderStartRef);

            const peerConnection = new RTCPeerConnection();
            peerConnectionRef.current = peerConnection;

            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.ontrack = (event) => {
                const [remoteStream] = event.streams;
                if (!remoteStream || !remoteAudioRef.current) return;

                remoteAudioRef.current.srcObject = remoteStream;
                remoteAudioRef.current.play().catch(() => undefined);
                startStreamRecorder(remoteStream, remoteRecorderRef, remoteAudioChunksRef, remoteRecorderStartRef);
            };

            peerConnection.onconnectionstatechange = () => {
                const state = peerConnection.connectionState;
                if (state === "failed" || state === "disconnected" || state === "closed") {
                    cleanupSession();
                    setStatus("idle");
                }
            };

            const dataChannel = peerConnection.createDataChannel("oai-events");
            dataChannelRef.current = dataChannel;
            dataChannel.onopen = () => {
                sendInitialPrompt();
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            const localSdp = offer.sdp;

            if (!localSdp || !/^v=0/m.test(localSdp)) {
                throw new Error("Offre SDP invalide ou vide.");
            }

            const response = await fetch("/test/realtime", {
                method: "POST",
                headers: {
                    "Content-Type": "application/sdp",
                },
                body: localSdp,
            });

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as
                    | { error?: string; details?: string; meta?: { sdpLength?: number; inboundContentType?: string; sdpPreview?: string } }
                    | null;
                const details = payload?.details ? ` (${payload.details})` : "";
                const meta = payload?.meta
                    ? ` [debug: len=${payload.meta.sdpLength ?? "?"}, type=${payload.meta.inboundContentType ?? "?"}, preview=${payload.meta.sdpPreview ?? "?"}]`
                    : "";
                throw new Error((payload?.error || "Impossible de contacter OpenAI Realtime.") + details + meta);
            }

            const answerSdp = await response.text();
            await peerConnection.setRemoteDescription({
                type: "answer",
                sdp: answerSdp,
            });

            setStatus("live");
        } catch (error) {
            cleanupSession();
            setStatus("idle");
            setErrorMessage(error instanceof Error ? error.message : "Erreur inconnue.");
        }
    }, [cleanupSession, sendInitialPrompt, startStreamRecorder, status]);

    useEffect(() => {
        return () => {
            cleanupSession();
        };
    }, [cleanupSession]);

    const isLive = status === "live";
    const isBusy = status === "starting" || status === "stopping" || isTranscribing;
    const hasTranscript = dialogueTurns.length > 0;
    const statusText =
        status === "starting" ? "Connexion..." : status === "live" ? "Conversation active" : status === "stopping" ? "Fermeture..." : "Pret a enregistrer";

    return (
        <section className="rounded-2xl border border-neutral-300 bg-white p-6 text-neutral-800 sm:p-8">
            <div className="flex flex-col gap-4 text-neutral-800">
                <p className="text-sm text-neutral-800">
                    Statut: <span className="font-semibold text-neutral-800">{statusText}</span>
                </p>

                {errorMessage ? <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-neutral-800">{errorMessage}</p> : null}
                {transcriptionError ? <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-neutral-800">{transcriptionError}</p> : null}
                {isTranscribing ? <p className="text-sm text-neutral-800">Transcription en cours...</p> : null}

                <button
                    type="button"
                    onClick={() => {
                        if (isLive) {
                            void stopConversation();
                            return;
                        }
                        void startConversation();
                    }}
                    disabled={isBusy}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-400 bg-neutral-100 px-5 py-3 text-base font-semibold text-neutral-800 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {isLive ? "Terminer" : "Commencer"}
                </button>

                {hasTranscript ? (
                    <div className="grid gap-4 text-neutral-800">
                        <h2 className="text-base font-semibold text-neutral-800 sm:text-lg">Dialogue transcrit (alterne)</h2>

                        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-4">
                            <div className="grid gap-2">
                                {dialogueTurns.map((turn, index) => (
                                    <p key={`${turn.speaker}-${turn.start}-${index}`} className="text-sm text-neutral-800">
                                        <span className="font-semibold text-neutral-800">{turn.speaker === "student" ? "Etudiant" : "Examinateur (AI)"}:</span>{" "}
                                        <span className="whitespace-pre-wrap text-neutral-800">{turn.text}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}

                <audio ref={remoteAudioRef} autoPlay />
            </div>
        </section>
    );
}
