import Image from "next/image";
import { Link } from "@/i18n/navigation";
import urlFor from "@/app/lib/urlFor";
import type { ExamCompilationLite } from "@/app/serverActions/mockExamActions";
import type { ScoreSummary } from "@/app/types/fide/mock-exam";
import PurchaseMockExamForm from "./PurchaseMockExamForm";
import FreshMockExamCardLink from "./FreshMockExamCardLink";

const STATUS_LABEL: Record<string, string> = {
    in_progress: "En cours",
    completed: "Terminée",
    abandoned: "Abandonnée",
};

const STATUS_CLASSES: Record<string, string> = {
    in_progress: "bg-secondary-6 text-neutral-800",
    completed: "bg-secondary-5 text-neutral-800",
    abandoned: "bg-neutral-400 text-neutral-700",
};

const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "-";
    }
};

const formatScore = (score?: ScoreSummary) => {
    if (!score) return "-";
    const percentage = Number(score.percentage);
    if (!Number.isFinite(percentage)) return "-";
    return `${Math.round(percentage)}%`;
};

const getLastSession = (sessions?: ExamCompilationLite["session"]) => {
    const list = (sessions || []).slice().filter(Boolean);
    if (!list.length) return null;
    list.sort((a, b) => (a.startedAt || "").localeCompare(b.startedAt || ""));
    return list.at(-1) || null;
};

export const DashboardMockExams = ({
    compilations,
    remainingCredits,
    canPurchase,
    availableToPurchase,
}: {
    compilations: ExamCompilationLite[];
    remainingCredits: number | null;
    canPurchase: boolean;
    availableToPurchase: number;
}) => {
    const credits = typeof remainingCredits === "number" ? remainingCredits : 0;
    const hasCredit = credits > 0;
    const canUseCredit = canPurchase && hasCredit && availableToPurchase > 0;
    const canBuyFromShop = canPurchase && !hasCredit && availableToPurchase > 0;

    return (
        <section id="mock-exams" className="page-wrapper flex flex-col max-w-7xl m-auto gap-6 lg:gap-10 w-full py-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-2">
                    <h2 className="mb-0 w-full display-2 font-medium">
                        Mes <span className="font-bold text-secondary-1">Examens</span> blancs
                    </h2>
                    <p className="mb-0 text-base text-neutral-700">Choisis un examen blanc et lance une nouvelle session quand tu veux.</p>
                </div>
            </div>

            {compilations.length === 0 ? (
                <div className="card border-2 border-solid border-neutral-700 p-6 text-center">
                    {canUseCredit ? (
                        <>
                            <p className="mb-2 font-semibold text-lg">
                                Tu as {credits} crédit{credits > 1 ? "s" : ""} disponible{credits > 1 ? "s" : ""}.
                            </p>
                            <p className="mb-4 text-neutral-600">Active ton examen blanc maintenant pour commencer la passation.</p>
                            <div className="flex justify-center">
                                <PurchaseMockExamForm disabled={!canUseCredit} credits={credits} ctaLabel="Utiliser mon crédit" />
                            </div>
                        </>
                    ) : hasCredit && availableToPurchase <= 0 ? (
                        <>
                            <p className="mb-2 font-semibold text-lg">
                                Tu as {credits} crédit{credits > 1 ? "s" : ""}, mais aucun template n&apos;est disponible pour le moment.
                            </p>
                            <p className="mb-0 text-neutral-600">Reviens un peu plus tard, de nouveaux examens seront ajoutés.</p>
                        </>
                    ) : canBuyFromShop ? (
                        <>
                            <p className="mb-2 font-semibold text-lg">Tu n&apos;as pas encore d&apos;examen blanc.</p>
                            <p className="mb-4 text-neutral-600">Achète ton premier examen blanc pour démarrer ta préparation.</p>
                            <Link href="/fide/mock-exams#mock-exams-offer" className="btn btn-primary small inline-flex items-center justify-center no-underline">
                                Acheter un examen blanc
                            </Link>
                        </>
                    ) : (
                        <>
                            <p className="mb-2 font-semibold text-lg">Aucun examen blanc disponible pour le moment.</p>
                            <p className="mb-0 text-neutral-600">Reviens un peu plus tard pour démarrer un examen blanc.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {compilations.map((compilation, index) => {
                        const lastSession = getLastSession(compilation.session);
                        const statusKey = lastSession?.status || "";
                        const statusLabel = statusKey ? STATUS_LABEL[statusKey] || statusKey : "Aucune session";
                        const statusClasses = statusKey ? STATUS_CLASSES[statusKey] || "bg-neutral-300 text-neutral-700" : "bg-neutral-300 text-neutral-700";
                        const totalScore = lastSession?.scores?.total;
                        const imgUrl = compilation.image ? urlFor(compilation.image).width(800).height(500).fit("crop").url() : null;

                        return (
                            <FreshMockExamCardLink
                                key={compilation._id}
                                href={`/mock-exams/${compilation._id}`}
                                className="group card border-2 border-solid border-neutral-700 shadow-on-hover p-0 overflow-hidden no-underline text-neutral-800"
                            >
                                <div className="relative w-full aspect-[16/10] bg-neutral-200">
                                    <Image
                                        src={imgUrl || "/images/mock-exam-hero2.png"}
                                        alt={`Compilation ${index + 1}`}
                                        fill
                                        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-neutral-100/95 text-neutral-800">EXAMEN BLANC</div>
                                </div>

                                <div className="p-5 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="mb-0 text-lg font-semibold">{compilation.name || `Compilation ${index + 1}`}</h4>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClasses}`}>{statusLabel}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-xl border border-neutral-300 p-3">
                                            <p className="mb-1 text-neutral-500">Créée le</p>
                                            <p className="mb-0 font-semibold text-neutral-800">{formatDate(compilation._createdAt)}</p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-300 p-3">
                                            <p className="mb-1 text-neutral-500">Score total</p>
                                            <p className="mb-0 font-semibold text-neutral-800">{formatScore(totalScore)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-neutral-600">
                                        <span>Dernière tentative : {formatDate(lastSession?.startedAt)}</span>
                                        <span className="font-semibold text-secondary-6 group-hover:underline">Voir le détail</span>
                                    </div>
                                </div>
                            </FreshMockExamCardLink>
                        );
                    })}
                </div>
            )}
        </section>
    );
};
