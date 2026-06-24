import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { groq } from "next-sanity";
import { createHash, randomUUID } from "node:crypto";
import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { buildConversationPrompt } from "@/app/[locale]/(mock-exam)/mock-exams/[compilationId]/runner/prompt-base";
import { resolveConversationVoice } from "@/app/[locale]/(mock-exam)/mock-exams/[compilationId]/runner/conversation-voice";

export const dynamic = "force-dynamic";


export const runtime = "nodejs";

const model = process.env.OPENAI_REALTIME_MODEL_PHONE_A2 || process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";
const realtimeTranscriptionModel = "gpt-4o-mini-transcribe";

const MOCK_EXAM_SESSION_ACCESS_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    _id == $sessionKey &&
    userRef._ref == $userId &&
    compilationRef._ref == $compilationId &&
    status == "in_progress"
  ][0]{
    _id,
    "speakA2TaskIds": compilationRef->examConfig.speakA2TaskIds[]._ref
  }
`;

const MOCK_EXAM_TASK_CONTEXT_QUERY = groq`
  *[_type == "mockExamTask" && _id == $taskId][0]{
    "activityAiContext": activities[_key == $activityKey][0].aiContext,
    "activityAiVoiceGender": activities[_key == $activityKey][0].aiVoiceGender
  }
`;

const createSafetyIdentifier = (userId: string) => createHash("sha256").update(`mock-exam:${userId}`).digest("hex");

const truncateForLogs = (value: string, maxLength = 2000) => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength)}... [truncated ${value.length - maxLength} chars]`;
};

const extractOpenAiErrorDetails = (rawBody: string) => {
    try {
        const parsed = JSON.parse(rawBody) as { error?: { message?: string } | string; message?: string } | null;
        if (!parsed) return rawBody;
        if (typeof parsed.error === "string") return parsed.error;
        if (parsed.error && typeof parsed.error.message === "string") return parsed.error.message;
        if (typeof parsed.message === "string") return parsed.message;
    } catch {
        // Keep the raw response body when OpenAI did not return JSON.
    }

    return rawBody;
};

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        if (!userId) {
            return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
        }

        const compilationId = String(request.headers.get("x-compilation-id") || "");
        const sessionKey = String(request.headers.get("x-session-key") || "");
        const taskId = String(request.headers.get("x-task-id") || "");
        const activityKey = String(request.headers.get("x-activity-key") || "");
        if (!compilationId || !sessionKey) {
            return NextResponse.json({ error: "Parametres manquants." }, { status: 400 });
        }

        const access = await client.fetch<{ _id?: string; speakA2TaskIds?: string[] } | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { compilationId, sessionKey, userId });
        if (!access?._id) {
            return NextResponse.json({ error: "Session non autorisee." }, { status: 403 });
        }

        let activityAiContext = "";
        let activityAiVoiceGender = "";
        const canReadTaskContext = taskId && Array.isArray(access?.speakA2TaskIds) && access.speakA2TaskIds.includes(taskId);
        if (canReadTaskContext) {
            const taskContext = await client.fetch<{ activityAiContext?: string; activityAiVoiceGender?: string } | null>(MOCK_EXAM_TASK_CONTEXT_QUERY, {
                taskId,
                activityKey,
            });
            activityAiContext = String(taskContext?.activityAiContext || "");
            activityAiVoiceGender = String(taskContext?.activityAiVoiceGender || "");
        }
        const instructions = buildConversationPrompt(activityAiContext);
        const voice = resolveConversationVoice(activityAiVoiceGender);
        const clientRequestId = request.headers.get("x-client-request-id") || `mock-exam-conversation-${randomUUID()}`;
        const safetyIdentifier = createSafetyIdentifier(userId);

        const contentType = request.headers.get("content-type") || "";
        let sdp = "";

        if (contentType.includes("application/sdp") || contentType.includes("text/plain")) {
            sdp = await request.text();
        } else {
            const body = (await request.json().catch(() => null)) as { sdp?: string } | null;
            sdp = body?.sdp || "";
        }

        if (!sdp || !/^v=0/m.test(sdp)) {
            return NextResponse.json({ error: "SDP invalide." }, { status: 400 });
        }

        const formData = new FormData();
        formData.set("sdp", sdp);
        formData.append(
            "session",
            JSON.stringify({
                type: "realtime",
                model,
                instructions,
                audio: {
                    input: {
                        turn_detection: {
                            type: "server_vad",
                            silence_duration_ms: 2000,
                            create_response: true,
                            interrupt_response: false,
                        },
                        transcription: {
                            model: realtimeTranscriptionModel,
                        },
                    },
                    output: {
                        voice,
                    },
                },
            }),
        );

        const openAiResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
                "OpenAI-Safety-Identifier": safetyIdentifier,
                "X-Client-Request-Id": clientRequestId,
            },
            body: formData,
        });

        const answerSdp = await openAiResponse.text();
        const openAiRequestId = openAiResponse.headers.get("x-request-id") || "";
        const processingMs = openAiResponse.headers.get("openai-processing-ms") || "";

        if (!openAiResponse.ok) {
            const details = extractOpenAiErrorDetails(answerSdp);

            console.error("Erreur OpenAI conversation/realtime:", {
                status: openAiResponse.status,
                openAiRequestId,
                clientRequestId,
                processingMs,
                model,
                voice,
                compilationId,
                sessionKey,
                taskId,
                activityKey,
                details: truncateForLogs(details),
                rawBody: truncateForLogs(answerSdp),
            });

            return NextResponse.json(
                {
                    error: "OpenAI Realtime a retourne une erreur.",
                    details,
                    requestId: openAiRequestId || clientRequestId,
                    clientRequestId,
                },
                { status: openAiResponse.status },
            );
        }

        console.info("Session OpenAI conversation/realtime creee:", {
            openAiRequestId,
            clientRequestId,
            processingMs,
            model,
            voice,
            compilationId,
            sessionKey,
            taskId,
            activityKey,
        });

        return new NextResponse(answerSdp, {
            status: 200,
            headers: {
                "Content-Type": "application/sdp",
                "x-openai-request-id": openAiRequestId,
                "x-client-request-id": clientRequestId,
            },
        });
    } catch (error) {
        console.error("Erreur conversation/realtime:", error);
        return NextResponse.json({ error: "Erreur interne conversation realtime." }, { status: 500 });
    }
}
