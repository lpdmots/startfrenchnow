import { NextRequest, NextResponse } from "next/server";
import { EXAMINER_PROMPT } from "../prompt";

export const runtime = "nodejs";

const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";
const voice = process.env.OPENAI_REALTIME_VOICE || "marin";

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OPENAI_API_KEY manquante dans les variables d'environnement." }, { status: 500 });
        }

        const contentType = request.headers.get("content-type") || "";
        let sdp = "";

        if (contentType.includes("application/sdp") || contentType.includes("text/plain")) {
            sdp = await request.text();
        } else {
            const body = (await request.json().catch(() => null)) as { sdp?: string } | null;
            sdp = body?.sdp || "";
        }

        if (!sdp || !/^v=0/m.test(sdp)) {
            return NextResponse.json({ error: "Le SDP est requis et doit etre valide." }, { status: 400 });
        }
        if (sdp.length < 200) {
            return NextResponse.json(
                {
                    error: "Le SDP recu est trop court.",
                    meta: {
                        inboundContentType: contentType,
                        sdpLength: sdp.length,
                        sdpPreview: sdp.slice(0, 120),
                    },
                },
                { status: 400 },
            );
        }

        const formData = new FormData();
        formData.set("sdp", sdp);
        formData.append(
            "session",
            JSON.stringify({
                model,
                instructions: EXAMINER_PROMPT,
                voice,
            }),
        );

        const openAiResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "OpenAI-Beta": "realtime=v1",
            },
            body: formData,
        });

        const answerSdp = await openAiResponse.text();

        if (!openAiResponse.ok) {
            return NextResponse.json(
                {
                    error: "OpenAI Realtime a retourne une erreur.",
                    details: answerSdp,
                    meta: {
                        inboundContentType: contentType,
                        sdpLength: sdp.length,
                        sdpPreview: sdp.slice(0, 120),
                    },
                },
                { status: openAiResponse.status },
            );
        }

        return new NextResponse(answerSdp, {
            status: 200,
            headers: {
                "Content-Type": "application/sdp",
            },
        });
    } catch (error) {
        console.error("Erreur /test/realtime:", error);
        return NextResponse.json({ error: "Erreur interne pendant la creation de la session realtime." }, { status: 500 });
    }
}
