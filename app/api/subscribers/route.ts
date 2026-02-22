import { NextRequest, NextResponse } from "next/server";

const mailerToken = process.env.MAILERLITE_API_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
    const data = await request.json();
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

    try {
        const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${mailerToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ email, groups: ["79392045100173113"] }),
        });

        if (!res.ok) {
            // Optionnel: lire l'erreur mailerlite pour logs
            const errText = await res.text().catch(() => "");
            return NextResponse.json({ message: "MailerLite error", detail: errText }, { status: 502 });
        }

        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
