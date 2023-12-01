import { NextRequest, NextResponse } from "next/server";
import { extractAndParseJson } from "@/app/lib/utils";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    const { rawVocabulary } = await request.json();
    console.log(rawVocabulary);
    try {
        const vocabulary = extractAndParseJson(rawVocabulary);
        console.log(vocabulary);
        return NextResponse.json({ vocabulary: JSON.stringify(vocabulary) }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
