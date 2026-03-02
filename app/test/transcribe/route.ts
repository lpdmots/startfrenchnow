import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OPENAI_API_KEY manquante dans les variables d'environnement." }, { status: 500 });
        }

        const formData = await request.formData();
        const audioFile = formData.get("audio");
        const speaker = String(formData.get("speaker") || "audio");

        if (!(audioFile instanceof File)) {
            return NextResponse.json({ error: "Fichier audio manquant." }, { status: 400 });
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (!buffer.byteLength) {
            return NextResponse.json({ error: "Le fichier audio est vide." }, { status: 400 });
        }

        const openAiForm = new FormData();
        openAiForm.append("file", new Blob([buffer]), audioFile.name || `${speaker}.webm`);
        openAiForm.append("model", "whisper-1");
        openAiForm.append("language", "fr");
        openAiForm.append("response_format", "verbose_json");

        const openAiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            body: openAiForm,
        });

        if (!openAiResponse.ok) {
            const details = await openAiResponse.text();
            return NextResponse.json({ error: "Erreur de transcription OpenAI.", details }, { status: openAiResponse.status });
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

        return NextResponse.json({ text: String(payload?.text || "").trim(), segments });
    } catch (error) {
        console.error("Erreur /test/transcribe:", error);
        return NextResponse.json({ error: "Erreur interne pendant la transcription." }, { status: 500 });
    }
}
