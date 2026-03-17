import Image from "next/image";
import Link from "next-intl/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import urlFor from "@/app/lib/urlFor";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import { getCompilation, getCompilationSessions, getUserMockExamCredits, isMockExamCompilationUnlockedForUser } from "@/app/serverActions/mockExamActions";
import type { ScoreSummary, SessionStatus } from "@/app/types/fide/mock-exam";
import RestartSessionDialog from "./RestartSessionDialog";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<SessionStatus, string> = {
    in_progress: "En cours",
    completed: "Terminée",
    abandoned: "Abandonnée",
};

const STATUS_CLASSES: Record<SessionStatus, string> = {
    in_progress: "bg-secondary-6 text-neutral-800",
    completed: "bg-secondary-5 text-neutral-800",
    abandoned: "bg-neutral-300 text-neutral-700",
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

export default async function MockExamCompilationPage({ params: { compilationId } }: { params: { compilationId: string } }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;

    if (!userId) {
        notFound();
    }

    const [compilation, isUnlocked] = await Promise.all([getCompilation(compilationId), isMockExamCompilationUnlockedForUser(userId, compilationId)]);
    if (!compilation || compilation.isActive === false || !isUnlocked) {
        notFound();
    }
    const [userSessions, credit] = await Promise.all([getCompilationSessions(userId, compilationId), getUserMockExamCredits(userId)]);

    const sessions = (userSessions || []).slice().sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
    const inProgress = sessions.find((entry) => entry.status === "in_progress");
    const lastSession = sessions[0];
    const hasSessions = sessions.length > 0;
    const startLabel = inProgress ? "Reprendre" : hasSessions ? "Recommencer" : "Commencer";
    const startHref = inProgress ? `/mock-exams/${compilation._id}/runner` : hasSessions ? `/mock-exams/${compilation._id}/runner?restart=1` : `/mock-exams/${compilation._id}/runner`;
    const remainingCredits = Number(credit?.remainingCredits || 0);

    const coverUrl = compilation.image ? urlFor(compilation.image).width(1200).height(700).fit("crop").url() : null;

    return (
        <div className="w-full flex flex-col items-center gap-10 mt-8 md:mt-12 p-4 mb-12 lg:mb-24">
            <section className="max-w-6xl w-full py-0">
                <Link href="/fide/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-800">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Retour au dashboard
                </Link>
            </section>

            <section className="max-w-6xl w-full flex flex-col gap-6 py-0">
                <div className="flex flex-col gap-2">
                    <p className="text-sm uppercase tracking-wide text-neutral-500">EXAMEN BLANC</p>
                    <h1 className="display-2 font-medium">{compilation.name || "Compilation"}</h1>
                </div>

                <div className="card border-2 border-solid border-neutral-700 overflow-hidden p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-5">
                        <div className="relative lg:col-span-3 aspect-[16/10] lg:aspect-auto lg:min-h-[320px] bg-neutral-200">
                            {coverUrl ? (
                                <>
                                    <Image src={coverUrl} alt="Image de compilation" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f6d6b8_0%,#f0c090_32%,#dca46c_62%,#b87a47_100%)]" />
                            )}
                        </div>

                        <div className="lg:col-span-2 p-6 flex flex-col gap-5">
                            <div className="flex flex-wrap items-center gap-2">
                                {lastSession?.status && (
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_CLASSES[lastSession.status]}`}>{STATUS_LABEL[lastSession.status]}</span>
                                )}
                                <span className="rounded-full px-3 py-1 text-xs font-semibold bg-neutral-200 text-neutral-700">
                                    {sessions.length} session{sessions.length > 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-xl border border-neutral-300 p-3">
                                    <p className="mb-1 text-neutral-500">Créée le</p>
                                    <p className="mb-0 font-semibold">{formatDate(compilation._createdAt)}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 p-3">
                                    <p className="mb-1 text-neutral-500">Dernière tentative</p>
                                    <p className="mb-0 font-semibold">{formatDate(lastSession?.startedAt)}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 p-3">
                                    <p className="mb-1 text-neutral-500">Branche orale</p>
                                    <p className="mb-0 font-semibold">{lastSession?.oralBranch?.chosen || lastSession?.oralBranch?.recommended || "À choisir"}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 p-3">
                                    <p className="mb-1 text-neutral-500">Combo écrit</p>
                                    <p className="mb-0 font-semibold">{lastSession?.writtenCombo?.chosen || lastSession?.writtenCombo?.recommended || "À choisir"}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                                <Link href={startHref} className="btn-primary text-center">
                                    {startLabel}
                                </Link>
                                {inProgress && <RestartSessionDialog compilationId={compilation._id} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl w-full flex flex-col gap-4 py-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold mb-0">Historique des sessions</h2>
                    {lastSession?.scores?.total && <p className="mb-0 text-sm text-neutral-600">Dernier total : {formatScore(lastSession.scores.total)}</p>}
                </div>

                {sessions.length === 0 ? (
                    <div className="card border-2 border-solid border-neutral-700 p-6 text-center">
                        <p className="mb-0">Aucune session enregistrée pour l'instant.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessions.map((entry, index) => (
                            <div key={entry._id} className="card border-2 border-solid border-neutral-700 p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="mb-0 font-semibold">Session {sessions.length - index}</p>
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_CLASSES[entry.status]}`}>{STATUS_LABEL[entry.status]}</span>
                                </div>

                                <p className="mb-0 text-sm text-neutral-600">Démarrée le {formatDate(entry.startedAt)}</p>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-lg border border-neutral-300 p-2">
                                        <p className="mb-1 text-neutral-500">Parler A2</p>
                                        <p className="mb-0 font-semibold">{formatScore(entry.scores?.speakA2)}</p>
                                    </div>
                                    <div className="rounded-lg border border-neutral-300 p-2">
                                        <p className="mb-1 text-neutral-500">Parler branche</p>
                                        <p className="mb-0 font-semibold">{formatScore(entry.scores?.speakBranch)}</p>
                                    </div>
                                    <div className="rounded-lg border border-neutral-300 p-2">
                                        <p className="mb-1 text-neutral-500">Comprendre</p>
                                        <p className="mb-0 font-semibold">{formatScore(entry.scores?.listening)}</p>
                                    </div>
                                    <div className="rounded-lg border border-neutral-300 p-2">
                                        <p className="mb-1 text-neutral-500">Lire / Écrire</p>
                                        <p className="mb-0 font-semibold">{formatScore(entry.scores?.readWrite)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-500">Total</span>
                                    <span className="text-lg font-bold text-neutral-800">{formatScore(entry.scores?.total)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
