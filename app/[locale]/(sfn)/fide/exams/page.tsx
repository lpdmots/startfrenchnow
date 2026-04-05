import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Exam } from "@/app/types/fide/exam";
import { ExamCardsList } from "./components/ExamCardsList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

const queryExams = groq`
    *[_type=='fideExam'] | order(order asc) {
        ...
    }
`;

export type LevelParam = "a1" | "a2" | "b1" | "all";
export type TypeParam = "speak" | "understand" | "read-write";

function parseLevelParam(v?: string | string[]): LevelParam {
    const s = Array.isArray(v) ? v[0] : v;
    const norm = (s ?? "").toLowerCase();
    return norm === "a1" || norm === "a2" || norm === "b1" ? (norm as LevelParam) : "all";
}

function parseTypeParam(v?: string | string[]): TypeParam | undefined {
    const s = Array.isArray(v) ? v[0] : v;
    const norm = (s ?? "").toLowerCase();
    return (["speak", "understand", "read-write"] as const).includes(norm as any) ? (norm as TypeParam) : undefined;
}

export default async function FideExamPage(
    props: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
    const searchParams = await props.searchParams;
    const exams: Exam[] = await client.fetch(queryExams);
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");

    const sortedExams = sortExams(exams, hasPack);

    const initialLevel = parseLevelParam(searchParams?.level);
    const initialType = parseTypeParam(searchParams?.type);

    return <FideExamPageNoAsync exams={sortedExams} initialLevel={initialLevel} initialType={initialType} hasPack={hasPack} />;
}

// ------------------------------------------------------------------
const FideExamPageNoAsync = ({ exams, initialLevel, initialType, hasPack }: { exams: Exam[]; initialLevel: LevelParam; initialType?: TypeParam; hasPack: boolean }) => {
    const t = useTranslations("Fide.FideExams");

    return (
        <div className="w-full flex flex-col items-center py-12 px-2 sm:px-4 overflow-x-hidden">
            <div className="w-full max-w-7xl">
                <div className="section hero v3 wf-section !pt-6">
                    <div className="container-default w-container">
                        <div className="inner-container max-w-[725px] mr-auto ml-auto max-[991px]:max-w-full max-[767px]:max-w-full mr-auto ml-auto max-[767px]:max-w-full">
                            <div className="text-center mg-bottom-40px">
                                <h1 className="display-1 mg-bottom-8px mb-8">{t.rich("title", intelRich())}</h1>
                                <p className="mg-bottom-0">{t("subtitle")}</p>
                            </div>
                        </div>

                        <ExamCardsList exams={exams} initialLevel={initialLevel} initialType={initialType} hasPack={hasPack} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const sortExams = (exams: Exam[], hasPack: boolean) => {
    return [...exams].sort((a, b) => {
        // 1) Si !hasPack : les previews en premier
        if (!hasPack) {
            const ap = !!a.isPreview;
            const bp = !!b.isPreview;
            if (ap !== bp) return ap ? -1 : 1;
        }

        // 2) Ensuite : tri par "order" (si différent)
        const oa = a.order;
        const ob = b.order;

        const aHasOrder = typeof oa === "number";
        const bHasOrder = typeof ob === "number";

        // si un seul a un order, celui-ci passe devant
        if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1;

        // si les 2 ont un order et qu'il est différent, on trie par order
        if (aHasOrder && bHasOrder && oa !== ob) return oa - ob;

        // 3) Si order est le même OU undefined : tri par level (comme ton snippet)
        const la = String(a.levels?.[0] ?? "");
        const lb = String(b.levels?.[0] ?? "");
        return la.localeCompare(lb, undefined, { numeric: true, sensitivity: "base" });
    });
};
