"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import type { Exam } from "@/app/types/fide/exam";
import type { HeroData } from "./dashboardUtils";
import ExpandableCardDemo from "@/app/components/ui/expandable-card-demo-standard";
import { useTranslations } from "next-intl";

// --- GROQ ---
// IDs des examens déjà faits par l'utilisateur (pack_fide)
const USER_DONE_EXAMS_IDS = groq`
  *[_type=="user" && _id==$userId][0]
    .learningProgress[type=="pack_fide"][0]
    .examLogs[].exam._ref
`;

// Suggestions au même niveau (exclure IDs déjà faits)
const EXAMS_BY_LEVEL_NOT_IN = groq`
  *[
    _type == "fideExam" &&
    $level in coalesce(levels, []) &&
    !(_id in $done)
  ][0...$limit]{
    ...
  }
`;

// Suggestions autres niveaux (exclure IDs déjà faits)
const EXAMS_OTHER_LEVELS_NOT_IN = groq`
  *[_type=="fideExam" && (!defined($level) || level!=$level) && !(_id in $done)][0...$limit]{
    ...
  }
`;

export const ExamsSuggestions = ({ hero, hasPack }: { hero: HeroData; hasPack: boolean }) => {
    const t = useTranslations("dashboard.Exams.ExamsSuggestions");
    const { data: session } = useSession();
    const userId = (session as any)?.user?._id as string | undefined;

    const lastLevel = hero?.exams?.last?.levels[0]; // A1 | A2 | B1 | undefined

    const [exams, setExams] = React.useState<Exam[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!userId) return;
            setLoading(true);
            try {
                // 1) IDs d'examens déjà faits
                const already: string[] = (await client.fetch(USER_DONE_EXAMS_IDS, { userId })) ?? [];
                if (cancelled) return;

                // 2) Batch prioritaire: même niveau que le dernier examen
                const limit = 3;
                let sameLevel: Exam[] = [];
                if (lastLevel) {
                    sameLevel = await client.fetch(EXAMS_BY_LEVEL_NOT_IN, {
                        level: lastLevel,
                        done: already,
                        limit,
                    });
                }

                // 3) Compléter si besoin avec d'autres niveaux
                const remain = Math.max(0, limit - (sameLevel?.length ?? 0));
                let others: Exam[] = [];
                if (remain > 0) {
                    others = await client.fetch(EXAMS_OTHER_LEVELS_NOT_IN, {
                        level: lastLevel ?? null,
                        done: already,
                        limit: remain,
                    });
                }

                if (!cancelled) setExams([...(sameLevel ?? []), ...(others ?? [])]);
            } catch (err) {
                console.error("ExamsSuggestions fetch error:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [userId, lastLevel]);

    return (
        <div>
            <h4 className="underline decoration-secondary-5 text-xl md:text-3xl mb-8">{t("selectedForYou")}</h4>

            {loading && <p>{t("loading")}</p>}

            {!loading && exams.length === 0 && <p>{t("empty")}</p>}

            <div className="w-full">
                <ExpandableCardDemo exams={exams} withStars={true} twoColumns={true} hasPack={hasPack} />
            </div>
        </div>
    );
};
