import { sendContactEmail } from "@/app/serverActions/contactActions";
import { verifyEmailTransport } from "@/app/lib/nodemailer";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const isAuthorizedRequest = (request: NextRequest) => {
    const expectedSecret = String(process.env.CRON_SECRET || "").trim();
    const authHeader = String(request.headers.get("authorization") || "").trim();

    if (process.env.NODE_ENV !== "production" && !expectedSecret) {
        return true;
    }

    if (!expectedSecret) {
        return false;
    }

    return authHeader === `Bearer ${expectedSecret}`;
};

export async function POST(request: NextRequest) {
    if (!isAuthorizedRequest(request)) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await verifyEmailTransport();

    const ContactFromFideFormData = {
        objectif: "B1",
        niveauActuel: "A1",
        niveauSouhaite: "B1",
        message: "Bonjour je m'intéresse à vos cours",
        email: "test-fbeb8zcqq@srv1.mail-tester.com",
    };

    try {
        await sendContactEmail(ContactFromFideFormData, "pdf");

        return NextResponse.json({ status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
