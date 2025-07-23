import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // nécessaire pour utiliser fetch avec form-data côté serveur

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file: File | null = formData.get("audio") as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
        }

        // Convertir File en ReadableStream pour Whisper
        const buffer = Buffer.from(await file.arrayBuffer());
        const form = new FormData();
        form.append("file", new Blob([buffer]), "audio.webm");
        form.append("model", "whisper-1");
        form.append("language", "fr"); // optionnel si tu veux forcer le français
        form.append("response_format", "json");

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
            },
            body: form,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const result = await response.json();
        return NextResponse.json({ transcription: result.text });
    } catch (error) {
        console.error("Erreur lors de la transcription :", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
