import { NextRequest, NextResponse } from "next/server";

const mailerToken = process.env.MAILERLITE_API_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
    const data = await request.json();

    try {
        await fetch("https://connect.mailerlite.com/api/subscribers", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${mailerToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ email: data, groups: ["79392045100173113"] }),
        });
        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
