import { sendContactEmail } from "@/app/serverActions/contactActions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
