import { client } from "@/app/lib/sanity.client";
import { groqQueries } from "@/app/lib/groqQueries";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";


export async function GET(
    _: NextRequest,
    props: { params: Promise<{ componentType: string; componentId: string }> }
) {
    const params = await props.params;
    const { componentType, componentId } = params;
    const groqQuery = groqQueries[componentType];

    try {
        const component = await client.fetch(groqQuery, { componentId });
        return NextResponse.json(component, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
