import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const mailerToken = process.env.MAILERLITE_API_ACCESS_TOKEN;

export async function GET(_: NextRequest, props: { params: Promise<{ param: string }> }) {
    const params = await props.params;
    const { param: email } = params;
    try {
        const response = await fetch(`https://connect.mailerlite.com/api/subscribers/${email}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${mailerToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        const subscriber = await response.json();
        return NextResponse.json({ subscriber }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ param: string }> }) {
    const params = await props.params;
    const { param: subscriberId } = params;
    const { fields, groups } = await request.json();

    try {
        const response = await fetch(`https://connect.mailerlite.com/api/subscribers/${subscriberId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${mailerToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ fields: fields, groups: groups }),
        });
        const updated = await response.json();

        if (updated.message === "Server Error") {
            return NextResponse.json({ message: "Bad request" }, { status: 400 });
        }

        return NextResponse.json({ updated }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
