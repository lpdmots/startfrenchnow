"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import type { OralBranch, ScoreSummary, SessionStatus, WrittenCombo } from "@/app/types/fide/mock-exam";
import { useMemo, useState } from "react";

type SessionHistoryEntry = {
    _id: string;
    status: SessionStatus;
    startedAt: string;
    oralBranch?: { recommended?: OralBranch; chosen?: OralBranch };
    writtenCombo?: { recommended?: WrittenCombo; chosen?: WrittenCombo };
    scores?: {
        speakA2?: ScoreSummary;
        speakBranch?: ScoreSummary;
        listening?: ScoreSummary;
        readWrite?: ScoreSummary;
        total?: ScoreSummary;
    };
};

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

const BASE_SECTION_LABELS = [
    { key: "speakA2", title: "Parler A2" },
    { key: "speakBranch", title: "Parler" },
    { key: "listening", title: "Comprendre" },
    { key: "readWrite", title: "Lire / Écrire" },
] as const;

const getOralLevel = (entry?: Pick<SessionHistoryEntry, "oralBranch"> | null) => entry?.oralBranch?.chosen || entry?.oralBranch?.recommended || "A1/B1";

export default function MockExamSessionsHistory({ sessions }: { sessions: SessionHistoryEntry[] }) {
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    const selected = useMemo(() => {
        if (!selectedSessionId) return null;
        return sessions.find((session) => session._id === selectedSessionId) || null;
    }, [selectedSessionId, sessions]);

    const lastSession = sessions[0];

    const selectedOralLevel = getOralLevel(selected);
    const selectedSectionLabels = BASE_SECTION_LABELS.map((section) =>
        section.key === "speakBranch" ? { ...section, title: `Parler ${selectedOralLevel}` } : section,
    );

    return (
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
                        <button
                            key={entry._id}
                            type="button"
                            onClick={() => setSelectedSessionId(entry._id)}
                            className="card border-2 border-solid border-neutral-700 bg-neutral-100 p-5 flex flex-col gap-4 text-left text-neutral-800 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="mb-0 font-semibold text-neutral-800">Session {sessions.length - index}</p>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_CLASSES[entry.status]}`}>{STATUS_LABEL[entry.status]}</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">Démarrée le {formatDate(entry.startedAt)}</span>
                                <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">Parler {getOralLevel(entry)}</span>
                                <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">
                                    Écrit {entry.writtenCombo?.chosen || entry.writtenCombo?.recommended || "A1_A2"}
                                </span>
                            </div>

                            <div className="rounded-xl border border-neutral-300 bg-neutral-200 p-4">
                                <p className="mb-1 text-sm text-neutral-700">Score total</p>
                                <p className="mb-0 text-2xl font-extrabold text-neutral-800">{formatScore(entry.scores?.total)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="rounded-xl border border-neutral-300 bg-neutral-200 p-3">
                                    <p className="mb-1 text-neutral-500">Parler A2</p>
                                    <p className="mb-0 font-semibold text-neutral-800">{formatScore(entry.scores?.speakA2)}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 bg-neutral-200 p-3">
                                    <p className="mb-1 text-neutral-500">Parler {getOralLevel(entry)}</p>
                                    <p className="mb-0 font-semibold text-neutral-800">{formatScore(entry.scores?.speakBranch)}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 bg-neutral-200 p-3">
                                    <p className="mb-1 text-neutral-500">Comprendre</p>
                                    <p className="mb-0 font-semibold text-neutral-800">{formatScore(entry.scores?.listening)}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 bg-neutral-200 p-3">
                                    <p className="mb-1 text-neutral-500">Lire / Écrire</p>
                                    <p className="mb-0 font-semibold text-neutral-800">{formatScore(entry.scores?.readWrite)}</p>
                                </div>
                            </div>

                            <p className="mb-0 text-sm font-semibold text-neutral-800 underline underline-offset-2">Voir les détails</p>
                        </button>
                    ))}
                </div>
            )}

            <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedSessionId(null)}>
                <SheetContent side="right" className="w-full max-w-[560px] p-0 bg-neutral-200">
                    {selected && (
                        <div className="flex h-full min-h-0 flex-col">
                            <SheetHeader className="border-b border-neutral-300 bg-gradient-to-r from-neutral-100 to-neutral-200 p-5 pr-12">
                                <SheetTitle className="text-xl font-bold">Détail de la session</SheetTitle>
                                <SheetDescription className="text-neutral-700">
                                    Session du {formatDate(selected.startedAt)} • {STATUS_LABEL[selected.status]}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-6">
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-3">
                                        <p className="mb-1 text-neutral-500">Score total</p>
                                        <p className="mb-0 text-xl font-bold">{formatScore(selected.scores?.total)}</p>
                                    </div>
                                    <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-3">
                                        <p className="mb-1 text-neutral-500">Branche orale</p>
                                        <p className="mb-0 font-semibold">{selected.oralBranch?.chosen || selected.oralBranch?.recommended || "À choisir"}</p>
                                    </div>
                                    <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-3">
                                        <p className="mb-1 text-neutral-500">Combo écrit</p>
                                        <p className="mb-0 font-semibold">{selected.writtenCombo?.chosen || selected.writtenCombo?.recommended || "À choisir"}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold mb-0">Scores par épreuve</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedSectionLabels.map((section) => (
                                            <div key={section.key} className="rounded-xl border border-neutral-300 bg-neutral-100 p-3">
                                                <p className="mb-1 text-neutral-600">{section.title}</p>
                                                <p className="mb-0 text-lg font-bold">{formatScore(selected.scores?.[section.key])}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold mb-0">Feedback IA</h3>
                                    <div className="space-y-3">
                                        {selectedSectionLabels.map((section) => {
                                            const feedback = selected.scores?.[section.key]?.feedback?.trim();
                                            return (
                                                <div key={`${section.key}-feedback`} className="rounded-xl border border-neutral-300 bg-neutral-100 p-4">
                                                    <p className="mb-2 text-sm font-semibold text-neutral-700">{section.title}</p>
                                                    <p className="mb-0 text-sm text-neutral-700 whitespace-pre-line">
                                                        {feedback && feedback.length > 0 ? feedback : "Aucun feedback IA enregistré pour cette épreuve."}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </section>
    );
}
