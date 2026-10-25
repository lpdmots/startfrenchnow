import { NextRequest, NextResponse } from "next/server";
import { mailerLiteNetworkCode, upsertMailerLiteSubscriber } from "@/app/lib/mailerlite";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
    let data;
    try {
        data = await request.json();
    } catch {
        return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }
    const email = typeof data?.email === "string" ? data.email.trim() : "";
    const website = typeof data?.website === "string" ? data.website.trim() : "";
    const startedAt = Number(data?.startedAt || 0);

    // Honeypot
    if (website) {
        return NextResponse.json({ message: "Success" }, { status: 200 });
    }

    // Time-trap (email-only => seuil bas)
    const deltaMs = Date.now() - startedAt;
    if (Number.isFinite(deltaMs) && deltaMs > 0 && deltaMs < 800) {
        return NextResponse.json({ message: "Success" }, { status: 200 });
    }

    // Validation email
    if (!email) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    const mailerToken = process.env.MAILERLITE_API_ACCESS_TOKEN;
    if (!mailerToken) {
        console.error("[api/subscribers] Missing MAILERLITE_API_ACCESS_TOKEN");
        return NextResponse.json({ message: "Newsletter temporarily unavailable" }, { status: 503 });
    }

    try {
        const res = await upsertMailerLiteSubscriber(email);

        if (!res.ok) {
            const failure = await res.json().catch(() => null);
            const fields = failure?.errors && typeof failure.errors === "object" ? Object.keys(failure.errors) : [];
            const emailRejected = res.status === 422 && fields.length > 0 && fields.every((field) => field === "email");
            // Only log known field names and status: upstream messages can contain personal data.
            const validationFields = [...new Set(fields.map((field) => (field === "email" ? "email" : /^groups(?:\.|$)/.test(field) ? "groups" : "other")))];
            const context = { upstreamStatus: res.status, validationFields };

            if (emailRejected) {
                console.warn("[api/subscribers] MailerLite rejected email", context);
                return NextResponse.json({ message: "Email address rejected" }, { status: 422 });
            }
            if (res.status === 429) {
                console.warn("[api/subscribers] MailerLite rate limit", context);
                return NextResponse.json({ message: "Please try again later" }, { status: 429 });
            }

            console.error("[api/subscribers] MailerLite request failed", context);
            return NextResponse.json({ message: "Newsletter temporarily unavailable" }, { status: 502 });
        }

        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error("[api/subscribers] MailerLite network request failed", { code: mailerLiteNetworkCode(error) });
        return NextResponse.json({ message: "Newsletter temporarily unavailable" }, { status: 502 });
    }
}
