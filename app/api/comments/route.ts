import { NextResponse } from "next/server";
import { listComments } from "@/app/serverActions/comments";
import { CommentResourceType } from "@/app/types/sfn/comment";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const resourceType = (searchParams.get("rt") || "") as CommentResourceType;
    const resourceId = searchParams.get("rid") || "";
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "20");

    if (!resourceType || !resourceId) {
        return NextResponse.json({ error: "Missing rt/rid" }, { status: 400 });
    }

    // Reutilise ta logique d’accès (admin/masqués) déjà dans listComments
    const data = await listComments({ resourceType, resourceId, page, pageSize });

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
