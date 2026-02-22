// app/api/exercise/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerProd";

export const runtime = "nodejs";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
    if (!NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Server misconfigured (NEXTAUTH_SECRET missing)" }, { status: 500 });
    }

    const apiKey = request.headers.get("SFN-API-Key");
    if (apiKey !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = await request.json();

        // ---- validations minimales ----
        if (!payload || payload._type !== "exercise") {
            throw new Error("Invalid payload: _type must be 'exercise'");
        }

        if (payload.questionsPriority !== "manual") {
            throw new Error("Only manual exercises are allowed");
        }

        if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
            throw new Error("Exercise must contain at least one question");
        }

        if (!Array.isArray(payload.exerciseTypes) || payload.exerciseTypes.length !== 1) {
            throw new Error("Exercise must contain exactly one exerciseType");
        }

        if (!["input", "select"].includes(payload.exerciseTypes[0])) {
            throw new Error("Only 'input' or 'select' exercises are allowed");
        }

        // Force sécurité
        payload.themes = [];
        payload.questionsPriority = "manual";

        // ---- création dans Sanity ----
        const createdExercise = await client.create(payload);

        return NextResponse.json({ createdExercise, balise: `<exercise exerciseId="${createdExercise._id}"></exercise>` }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Bad request" }, { status: 400 });
    }
}
