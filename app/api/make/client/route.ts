import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerProd";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        return NextResponse.json({ status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
