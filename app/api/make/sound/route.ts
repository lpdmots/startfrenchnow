import textToSpeechSimple from "@/app/lib/textToSpeechSimple";
import { NextRequest, NextResponse } from "next/server";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const { texts, lang } = await request.json();
        for (let text of texts) {
            await textToSpeechSimple(text, lang);
        }

        return NextResponse.json({ status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
