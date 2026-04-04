import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { groq } from "next-sanity";
import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

export const runtime = "nodejs";

const MOCK_EXAM_SESSION_ACCESS_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    _id == $sessionKey &&
    userRef._ref == $userId &&
    compilationRef._ref == $compilationId &&
    status == "in_progress"
  ][0]{
    _id
  }
`;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        if (!userId) {
            return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
        }

        const formData = await request.formData();
        const audioFile = formData.get("audio");
        const compilationId = String(formData.get("compilationId") || "");
        const sessionKey = String(formData.get("sessionKey") || "");

        if (!(audioFile instanceof File) || !compilationId || !sessionKey) {
            return NextResponse.json({ error: "Parametres manquants." }, { status: 400 });
        }

        const access = await client.fetch<{ _id?: string } | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { compilationId, sessionKey, userId });
        if (!access?._id) {
            return NextResponse.json({ error: "Session non autorisee." }, { status: 403 });
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        if (!bytes.byteLength) {
            return NextResponse.json({ error: "Audio vide." }, { status: 400 });
        }

        const openAiForm = new FormData();
        openAiForm.append("file", new Blob([bytes]), audioFile.name || "conversation.webm");
        openAiForm.append("model", "whisper-1");
        openAiForm.append("language", "fr");
        openAiForm.append("response_format", "verbose_json");

        const openAiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
            },
            body: openAiForm,
        });

        if (!openAiResponse.ok) {
            const details = await openAiResponse.text();
            return NextResponse.json({ error: "Erreur OpenAI transcription.", details }, { status: openAiResponse.status });
        }

        const payload = (await openAiResponse.json()) as {
            text?: string;
            segments?: Array<{ start?: number; end?: number; text?: string }>;
        };

        const segments = Array.isArray(payload?.segments)
            ? payload.segments
                  .map((segment) => ({
                      start: typeof segment?.start === "number" ? segment.start : 0,
                      end: typeof segment?.end === "number" ? segment.end : 0,
                      text: String(segment?.text || "").trim(),
                  }))
                  .filter((segment) => segment.text.length > 0)
            : [];

        return NextResponse.json({
            text: String(payload?.text || "").trim(),
            segments,
        });
    } catch (error) {
        console.error("Erreur conversation/transcribe:", error);
        return NextResponse.json({ error: "Erreur interne transcription conversation." }, { status: 500 });
    }
}
