import { NextResponse } from "next/server";
import { finalizeMockExamSession } from "@/app/serverActions/mockExamActions";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as { compilationId?: string; sessionKey?: string };
        const compilationId = String(body?.compilationId || "").trim();
        const sessionKey = String(body?.sessionKey || "").trim();
        if (!compilationId || !sessionKey) {
            return NextResponse.json({ ok: false, error: "Paramètres invalides." }, { status: 400 });
        }

        const result = await finalizeMockExamSession({ compilationId, sessionKey });
        if (!result?.ok) {
            return NextResponse.json({ ok: false, error: result?.error || "Finalisation impossible." }, { status: 400 });
        }

        return NextResponse.json({ ok: true, status: result.status, scores: result.scores });
    } catch {
        return NextResponse.json({ ok: false, error: "Erreur serveur inattendue." }, { status: 500 });
    }
}

