import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
    const { searchParams } = new URL(_request.url);
    const error = searchParams.get("error");
    console.log({ error });
    redirect(`/auth/error/${error}`);
}
