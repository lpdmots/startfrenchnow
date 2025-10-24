// app/api/exams/migrate-levels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

export const runtime = "nodejs";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
// Par défaut on cible "fideExam", adapte si besoin (ex. "exam")
const EXAM_TYPE = "fideExam";

// Valeurs cibles autorisées (pour normaliser proprement)
const ALLOWED: Record<string, string> = {
    a1: "A1",
    a2: "A2",
    b1: "B1",
    "a1+": "A1+",
    "a2+": "A2+",
    all: "All",
};

function normalizeLevel(v?: string | null): string | null {
    if (!v) return null;
    const t = v.trim();
    if (!t) return null;
    const norm = ALLOWED[t.toLowerCase()];
    return norm ?? t; // si valeur déjà correcte ou atypique, on la garde telle quelle
}

type ExamLite = {
    _id: string;
    level?: string | null;
    levels?: string[] | null;
    competence?: string | null;
};

export async function POST(req: NextRequest) {
    // --- Auth (même logique habituelle) ---
    const secretKey = req.headers.get("SFN-API-Key");
    if (secretKey !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        // 1) Récupère tous les exams avec un champ "level"
        const exams: ExamLite[] = await client.fetch(`*[_type == "fideExam"]{ _id, level, levels, competence }`);
        console.log(`Found ${exams.length} documents of type '${EXAM_TYPE}'.`);
        if (!exams.length) {
            return NextResponse.json({ ok: true, message: `Aucun document avec 'level' trouvé pour _type="${EXAM_TYPE}".`, patched: 0 }, { status: 200 });
        }

        // 2) Prépare la migration: levels: [normalize(level)], unset level
        const tx = client.transaction();
        let toPatch = 0;

        for (const doc of exams) {
            if (doc.competence) continue;

            // Si levels existe déjà, on force la migration simple demandée : levels = [newLevel]
            tx.patch(doc._id, {
                set: { competence: "Comprendre" },
            });
            toPatch++;
        }

        if (toPatch === 0) {
            return NextResponse.json({ ok: true, message: "Aucune mise à jour nécessaire (valeurs vides).", patched: 0 }, { status: 200 });
        }

        const res = await tx.commit();

        return NextResponse.json(
            {
                ok: true,
                patched: toPatch,
                transactionId: res.transactionId,
                note: "Migration effectuée : level -> levels: [level], puis suppression de 'level'.",
            },
            { status: 200 }
        );
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
    }
}
