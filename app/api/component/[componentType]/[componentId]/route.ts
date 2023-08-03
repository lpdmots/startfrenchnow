import { client } from "@/app/lib/sanity.client";
import { groqQueries } from "@/app/lib/groqQueries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { componentType: string; componentId: string } }) {
    const { componentType, componentId } = params;
    const groqQuery = groqQueries[componentType];

    try {
        const component = await client.fetch(groqQuery, { componentId });
        return NextResponse.json(component, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
