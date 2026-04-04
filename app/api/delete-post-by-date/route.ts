import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerProd";

export const dynamic = "force-dynamic";


export const runtime = "nodejs";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

type Body = {
    category?: string; // ex: "udemy_course_dialogs"
    hours: number; // ex: 2
    mode?: "newer_than" | "older_than"; // default: "newer_than"
    dryRun?: boolean; // default: true
    sampleLimit?: number; // default: 50
};

export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const body = (await request.json()) as Body;

        const hours = Number(body.hours);
        if (!Number.isFinite(hours) || hours <= 0) {
            return NextResponse.json({ message: "`hours` doit être un nombre > 0" }, { status: 400 });
        }

        const category = (body.category ?? "").trim();
        if (!category) {
            return NextResponse.json({ message: "`category` est requis (ex: udemy_course_dialogs)" }, { status: 400 });
        }

        const mode = body.mode ?? "newer_than";
        const dryRun = body.dryRun ?? true;
        const sampleLimit = Math.min(Math.max(body.sampleLimit ?? 50, 1), 200);

        const cutoffIso = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        // newer_than => supprime ceux créés dans les dernières X heures
        // older_than => supprime ceux créés AVANT (now - X heures)
        const op = mode === "older_than" ? "<" : ">";

        const query = `
      *[
        _type == "post"
        && defined(_createdAt)
        && _createdAt ${op} $cutoff
        && $category in categories
      ]|order(_createdAt asc){
        _id, _createdAt, title, "slug": slug.current
      }
    `;

        const posts = await client.fetch<Array<{ _id: string; _createdAt: string; title?: string; slug?: string }>>(query, {
            cutoff: cutoffIso,
            category,
        });

        const ids = posts.map((p) => p._id);

        if (dryRun) {
            return NextResponse.json(
                {
                    ok: true,
                    dryRun: true,
                    mode,
                    hours,
                    cutoffIso,
                    category,
                    count: ids.length,
                    sample: posts.slice(0, sampleLimit),
                },
                { status: 200 },
            );
        }

        // Suppression en lots (transactions)
        const BATCH_SIZE = 100;
        let deleted = 0;

        for (let i = 0; i < ids.length; i += BATCH_SIZE) {
            const batch = ids.slice(i, i + BATCH_SIZE);
            let tx = client.transaction();
            for (const id of batch) tx = tx.delete(id);
            await tx.commit();
            deleted += batch.length;
        }

        return NextResponse.json(
            {
                ok: true,
                dryRun: false,
                mode,
                hours,
                cutoffIso,
                category,
                deletedCount: deleted,
            },
            { status: 200 },
        );
    } catch (error: any) {
        return NextResponse.json({ message: error?.message ?? "Unknown error" }, { status: 400 });
    }
}
