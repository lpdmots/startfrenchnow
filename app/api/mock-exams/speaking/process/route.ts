import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { groq } from "next-sanity";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

export const runtime = "nodejs";

const region = process.env.AWS_REGION || "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "start-french-now";

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

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

const suspectTerms = ["para la communauté", "sous-titrage", "merci", "true", "false", "thank you"];

const sanitizeSegment = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);

const pickExtension = (filename: string, mimeType: string) => {
    if (filename.includes(".")) {
        const ext = filename.split(".").pop()?.toLowerCase();
        if (ext) return ext;
    }

    if (mimeType.includes("ogg")) return "ogg";
    if (mimeType.includes("mpeg")) return "mp3";
    if (mimeType.includes("wav")) return "wav";
    if (mimeType.includes("mp4")) return "mp4";
    return "webm";
};

const normalizeTranscript = (value: string) => {
    const cleaned = String(value || "").trim();
    const lowered = cleaned.toLowerCase();
    const looksInvalid = !cleaned || suspectTerms.some((term) => lowered.includes(term));
    if (looksInvalid) {
        return "Je n'ai pas pu transcrire la réponse automatiquement. Merci de réessayer ou de nous contacter.";
    }
    return cleaned;
};

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        if (!userId) {
            return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("audio") as File | null;
        const compilationId = String(formData.get("compilationId") || "");
        const sessionKey = String(formData.get("sessionKey") || "");
        const taskId = String(formData.get("taskId") || "");
        const activityKey = String(formData.get("activityKey") || "");

        if (!file || !compilationId || !sessionKey || !taskId || !activityKey) {
            return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
        }

        const access = await client.fetch<{ _id?: string } | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { compilationId, userId, sessionKey });
        if (!access?._id) {
            return NextResponse.json({ error: "Session non autorisée." }, { status: 403 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (!buffer.byteLength) {
            return NextResponse.json({ error: "Fichier audio vide." }, { status: 400 });
        }

        const transcriptionForm = new FormData();
        transcriptionForm.append("file", new Blob([buffer]), file.name || "audio.webm");
        transcriptionForm.append("model", "whisper-1");
        transcriptionForm.append("language", "fr");
        transcriptionForm.append("response_format", "json");

        const openAiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
            },
            body: transcriptionForm,
        });

        if (!openAiResponse.ok) {
            const errorText = await openAiResponse.text();
            return NextResponse.json({ error: `Transcription impossible: ${errorText}` }, { status: 502 });
        }

        const transcriptionResult = (await openAiResponse.json()) as { text?: string };
        const transcript = normalizeTranscript(transcriptionResult?.text || "");

        const extension = pickExtension(file.name || "audio.webm", file.type || "");
        const safeTaskId = sanitizeSegment(taskId);
        const safeActivityKey = sanitizeSegment(activityKey);
        const key = `mock-exams/in-progress/speaking/${sanitizeSegment(userId)}/${sanitizeSegment(compilationId)}/${sanitizeSegment(sessionKey)}/${safeTaskId}-${safeActivityKey}-${Date.now()}.${extension}`;

        await s3Client.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: file.type || "audio/webm",
            }),
        );

        return NextResponse.json({
            ok: true,
            audioUrl: key,
            transcription: transcript,
        });
    } catch (error) {
        console.error("Erreur process speaking mock-exam:", error);
        return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
    }
}
