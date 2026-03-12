"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import { useToast } from "@/app/hooks/use-toast";
import { useMockExamRunnerStore, type MockExamRunnerHydration } from "@/app/stores/mockExamRunnerStore";
import { advanceMockExamResume } from "@/app/serverActions/mockExamActions";
import { getAnswerTaskId } from "@/app/types/fide/mock-exam";
import type { ExamCorrectionContent, ListeningScenarioResult, OralBranch, ScoreSummary, SpeakingAnswer, WrittenCombo } from "@/app/types/fide/mock-exam";
import type { Exam } from "@/app/types/fide/exam";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";
import RunnerScreenRouter from "./RunnerScreenRouter";
import { getSpeakingTaskHeader } from "./runnerTaskHeader";
import { FaArrowLeft } from "react-icons/fa";

type RunnerClientProps = {
    hydrationData: MockExamRunnerHydration;
    compilationName: string;
    compilationCorrections: ExamCorrectionContent[];
    speakA2Tasks: RunnerTask[];
    speakBranchA1Tasks: RunnerTask[];
    speakBranchB1Tasks: RunnerTask[];
    listeningA1Exams: Exam[];
    listeningA2Exams: Exam[];
    listeningB1Exams: Exam[];
    initialSpeakA2Answers: SpeakingAnswer[];
    initialSpeakA2ScoreSummary: ScoreSummary | null;
    initialSpeakBranchScoreSummary: ScoreSummary | null;
    initialListeningScenarioResults: ListeningScenarioResult[];
    initialListeningScoreSummary: ScoreSummary | null;
    initialSpeakA2CorrectionRetryCount: number;
    isAdmin: boolean;
};

const RUNNER_PHASES = ["Parler", "Comprendre", "Lire/Écrire"] as const;

const getRunnerPhaseIndex = (state?: string) => {
    if (!state) return 0;
    if (state.startsWith("READ_WRITE") || state.startsWith("WRITTEN_")) return 2;
    if (state === "ORAL_SECTION_SUMMARY") return 1;
    if (state.startsWith("LISTENING") || state.includes("COMPRENDRE")) return 1;
    return 0;
};

const getRunnerHeaderDetails = (state: string | undefined, speakA2Tasks: RunnerTask[], taskId?: string) => {
    if (!state) {
        return { title: "Exam Runner", subtitle: "-" };
    }

    if (state !== "SPEAK_A2_RUN") {
        const byState: Record<string, { title: string; subtitle: string }> = {
            EXAM_INTRO: { title: "Introduction", subtitle: "Prêt pour démarrer" },
            SPEAK_A2_TASK1_DESCRIPTION_INTRO: { title: "Tâche 1", subtitle: "Description d'image" },
            SPEAK_A2_TASK2_CONVERSATION_INTRO: { title: "Tâche 2", subtitle: "Conversation téléphonique" },
            SPEAK_A2_TASK3_DISCUSSION_INTRO: { title: "Tâche 3", subtitle: "Discussion guidée" },
            SPEAK_A2_RESULT: { title: "Parler A2", subtitle: "Section terminée" },
            SPEAK_A2_CORRECTION: { title: "Correction A2", subtitle: "Vidéo de correction" },
            SPEAK_BRANCH_INTRO: { title: "Parler Branche", subtitle: "Choix du niveau" },
            SPEAK_BRANCH_A1_INTRO: { title: "Parler Branche", subtitle: "Branche A1" },
            SPEAK_BRANCH_B1_INTRO: { title: "Parler Branche", subtitle: "Branche B1" },
            SPEAK_BRANCH_B1_CHOICE: { title: "Parler Branche", subtitle: "Choix de l'épreuve B1" },
            SPEAK_BRANCH_A1_RUN: { title: "Parler Branche", subtitle: "A1 - En cours" },
            SPEAK_BRANCH_B1_RUN: { title: "Parler Branche", subtitle: "B1 - En cours" },
            SPEAK_BRANCH_RESULT: { title: "Parler Branche", subtitle: "Section terminée" },
            SPEAK_BRANCH_CORRECTION: { title: "Correction branche", subtitle: "Vidéo de correction" },
            LISTENING_INTRO: { title: "Comprendre", subtitle: "Introduction" },
            LISTENING_RUN: { title: "Comprendre", subtitle: "Scénarios en cours" },
            LISTENING_RESULT: { title: "Comprendre", subtitle: "Section terminée" },
            ORAL_SECTION_SUMMARY: { title: "Bilan oral", subtitle: "Synthèse finale" },
            READ_WRITE_CHOICE: { title: "Lire/Écrire", subtitle: "Choix du parcours" },
            READ_WRITE_INTRO: { title: "Lire/Écrire", subtitle: "Introduction" },
        };
        return byState[state] || { title: state, subtitle: "-" };
    }

    const totalTasks = speakA2Tasks.length;
    if (!totalTasks) {
        return { title: "Parler A2", subtitle: "Aucune tâche" };
    }

    const fallbackTaskIndex = 0;
    const resolvedTaskIndex = taskId ? speakA2Tasks.findIndex((task) => task._id === taskId) : fallbackTaskIndex;
    const taskIndex = resolvedTaskIndex >= 0 ? resolvedTaskIndex : fallbackTaskIndex;
    const task = speakA2Tasks[taskIndex];

    if (!task) {
        return { title: "Parler A2", subtitle: "-" };
    }

    return getSpeakingTaskHeader(task, taskIndex, totalTasks);
};

export default function RunnerClient({
    hydrationData,
    compilationName,
    compilationCorrections,
    speakA2Tasks,
    speakBranchA1Tasks,
    speakBranchB1Tasks,
    listeningA1Exams,
    listeningA2Exams,
    listeningB1Exams,
    initialSpeakA2Answers,
    initialSpeakA2ScoreSummary,
    initialSpeakBranchScoreSummary,
    initialListeningScenarioResults,
    initialListeningScoreSummary,
    initialSpeakA2CorrectionRetryCount,
    isAdmin,
}: RunnerClientProps) {
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [speakA2Answers, setSpeakA2Answers] = useState<SpeakingAnswer[]>(initialSpeakA2Answers || []);
    const router = useRouter();
    const { toast } = useToast();
    const hydrate = useMockExamRunnerStore((state) => state.hydrate);
    const resume = useMockExamRunnerStore((state) => state.resume);
    const setResume = useMockExamRunnerStore((state) => state.setResume);
    const currentPhaseIndex = getRunnerPhaseIndex(resume?.state);
    const headerDetails = getRunnerHeaderDetails(resume?.state, speakA2Tasks, resume?.taskId);
    const isExamIntro =
        resume?.state === "EXAM_INTRO" ||
        resume?.state === "SPEAK_A2_TASK1_DESCRIPTION_INTRO" ||
        resume?.state === "SPEAK_A2_TASK2_CONVERSATION_INTRO" ||
        resume?.state === "SPEAK_A2_TASK3_DISCUSSION_INTRO" ||
        resume?.state === "SPEAK_BRANCH_A1_INTRO" ||
        resume?.state === "SPEAK_BRANCH_B1_INTRO" ||
        resume?.state === "LISTENING_INTRO";
    const isVariableHeightLayout =
        resume?.state === "SPEAK_A2_CORRECTION" ||
        resume?.state === "SPEAK_BRANCH_CORRECTION" ||
        resume?.state === "SPEAK_BRANCH_A1_RUN" ||
        resume?.state === "LISTENING_RUN" ||
        resume?.state === "ORAL_SECTION_SUMMARY";
    const hideTopHeaderOnSmall =
        resume?.state === "SPEAK_A2_RESULT" ||
        resume?.state === "SPEAK_A2_CORRECTION" ||
        resume?.state === "SPEAK_BRANCH_CORRECTION" ||
        resume?.state === "SPEAK_BRANCH_A1_RUN" ||
        resume?.state === "SPEAK_BRANCH_INTRO" ||
        resume?.state === "SPEAK_BRANCH_B1_CHOICE" ||
        resume?.state === "SPEAK_BRANCH_RESULT" ||
        resume?.state === "READ_WRITE_CHOICE" ||
        resume?.state === "LISTENING_RUN" ||
        resume?.state === "LISTENING_RESULT" ||
        resume?.state === "ORAL_SECTION_SUMMARY";

    useEffect(() => {
        hydrate(hydrationData);
        setSpeakA2Answers(initialSpeakA2Answers || []);
    }, [hydrate, hydrationData, initialSpeakA2Answers]);

    useEffect(() => {
        const guardState = { mockExamGuard: true, compilationId: hydrationData.compilationId };
        window.history.pushState(guardState, "", window.location.href);

        const onPopState = () => {
            if (isLeaving || isAdvancing) return;
            setShowQuitModal(true);
            window.history.pushState(guardState, "", window.location.href);
        };

        window.addEventListener("popstate", onPopState);

        return () => {
            window.removeEventListener("popstate", onPopState);
        };
    }, [hydrationData.compilationId, isAdvancing, isLeaving]);

    const handleAdvance = async ({
        nextState,
        taskId,
        activityKey,
        oralBranchChosen,
        oralBranchRecommended,
        writtenComboChosen,
        writtenComboRecommended,
    }: {
        nextState: string;
        taskId?: string;
        activityKey?: string;
        oralBranchChosen?: OralBranch;
        oralBranchRecommended?: OralBranch;
        writtenComboChosen?: WrittenCombo;
        writtenComboRecommended?: WrittenCombo;
    }) => {
        if (isAdvancing) return;

        setIsAdvancing(true);
        try {
            const result = await advanceMockExamResume({
                compilationId: hydrationData.compilationId,
                sessionKey: hydrationData.sessionKey,
                nextState,
                taskId,
                activityKey,
                oralBranchChosen,
                oralBranchRecommended,
                writtenComboChosen,
                writtenComboRecommended,
            });

            if (!result?.ok || !result.resume) {
                toast({
                    variant: "destructive",
                    title: "Transition impossible",
                    description: result?.error || "Impossible de sauvegarder l'état du runner.",
                });
                return;
            }

            setResume(result.resume);
        } catch {
            toast({
                variant: "destructive",
                title: "Erreur inattendue",
                description: "La mise à jour de l'état a échoué.",
            });
        } finally {
            setIsAdvancing(false);
        }
    };

    const handleAnswerSaved = (answer: SpeakingAnswer) => {
        setSpeakA2Answers((previous) => {
            const next = [...previous];
            const answerTaskId = getAnswerTaskId(answer);
            const existingIndex = next.findIndex((item) => getAnswerTaskId(item) === answerTaskId && item.activityKey === answer.activityKey);
            if (existingIndex >= 0) {
                next[existingIndex] = answer;
            } else {
                next.push(answer);
            }
            return next;
        });
    };

    const handleAnswersEvaluated = (answers: SpeakingAnswer[]) => {
        setSpeakA2Answers((previous) => {
            const byKey = new Map(previous.map((item) => [`${getAnswerTaskId(item)}::${item.activityKey}`, item] as const));
            for (const answer of answers || []) {
                byKey.set(`${getAnswerTaskId(answer)}::${answer.activityKey}`, answer);
            }
            return Array.from(byKey.values());
        });
    };

    return (
        <>
            <div className={`w-full min-h-[100dvh] flex flex-col items-center gap-6 p-4 md:p-6 [&_textarea]:bg-neutral-100 [&_input]:bg-neutral-100 ${isVariableHeightLayout ? "" : "md:h-[100dvh]"}`}>
                <section className="w-full max-w-[1600px] grid grid-cols-1 items-center gap-2 md:gap-4 py-0 lg:grid-cols-[minmax(0,800px)_minmax(0,1fr)_auto]">
                    <div className="flex w-full lg:max-w-[800px] justify-between flex-wrap gap-2 sm:gap-4">
                        <button
                            type="button"
                            className="inline-flex h-10 w-12 sm:w-14 items-center justify-center rounded-full text-neutral-800 transition-colors hover:text-secondary-2"
                            aria-label="Quitter l'examen"
                            title="Quitter l'examen"
                            onClick={() => setShowQuitModal(true)}
                        >
                            <FaArrowLeft className="text-2xl lg:text-4xl cursor-pointer color-neutral-800 translate_on_hover" title="Retour" />
                        </button>
                        <div className="min-w-0 grow">
                            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
                                {RUNNER_PHASES.map((phase, index) => {
                                    const isCompleted = index < currentPhaseIndex;
                                    const isCurrent = index === currentPhaseIndex;

                                    return (
                                        <Fragment key={phase}>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 whitespace-nowrap">
                                                <div
                                                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                                        isCompleted || isCurrent ? "bg-secondary-2 text-neutral-100" : "bg-neutral-300 text-neutral-600"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <span className={`text-[11px] md:text-xs font-semibold uppercase tracking-wide ${isCurrent ? "text-secondary-2" : "text-neutral-700"}`}>{phase}</span>
                                            </div>
                                            {index < RUNNER_PHASES.length - 1 && <div className={`h-[2px] rounded-full ${isCompleted ? "bg-secondary-2" : "bg-neutral-300"}`} />}
                                        </Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {!isExamIntro && (
                        <div className={`min-w-0 w-full ${hideTopHeaderOnSmall ? "hidden lg:flex" : "flex"} lg:flex-col justify-between items-end lg:justify-end shrink-0`}>
                            <p className="mb-0 text-lg font-semibold uppercase tracking-wide text-neutral-700 truncate">{headerDetails.title}</p>
                            <p className="mb-0 text-sm text-neutral-600 truncate">{headerDetails.subtitle}</p>
                        </div>
                    )}
                </section>

                <section className={`w-full grow max-w-[1600px] py-0 flex justify-center ${isVariableHeightLayout ? "" : "md:flex-1 md:min-h-0"}`}>
                    {resume && (
                        <RunnerScreenRouter
                            compilationId={hydrationData.compilationId}
                            sessionKey={hydrationData.sessionKey}
                            resume={resume}
                            compilationName={compilationName}
                            compilationCorrections={compilationCorrections}
                            speakA2Tasks={speakA2Tasks}
                            speakBranchA1Tasks={speakBranchA1Tasks}
                            speakBranchB1Tasks={speakBranchB1Tasks}
                            listeningA1Exams={listeningA1Exams}
                            listeningA2Exams={listeningA2Exams}
                            listeningB1Exams={listeningB1Exams}
                            speakA2Answers={speakA2Answers}
                            initialSpeakA2ScoreSummary={initialSpeakA2ScoreSummary}
                            initialSpeakBranchScoreSummary={initialSpeakBranchScoreSummary}
                            initialListeningScenarioResults={initialListeningScenarioResults}
                            initialListeningScoreSummary={initialListeningScoreSummary}
                            initialSpeakA2CorrectionRetryCount={initialSpeakA2CorrectionRetryCount}
                            isAdmin={isAdmin}
                            isAdvancing={isAdvancing}
                            onAdvance={handleAdvance}
                            onSpeakA2AnswerSaved={handleAnswerSaved}
                            onSpeakA2AnswersEvaluated={handleAnswersEvaluated}
                        />
                    )}
                </section>
            </div>

            <ModalFromBottomWithPortal
                open={showQuitModal}
                data={{
                    setOpen: setShowQuitModal,
                    title: "Quitter l'examen ?",
                    message: "Ta progression est enregistrée. Tu pourras reprendre plus tard.",
                    buttonAnnulerStr: "Continuer l'examen",
                    buttonOkStr: "Quitter",
                    clickOutside: true,
                    functionCancel: () => setShowQuitModal(false),
                    functionOk: () => {
                        setIsLeaving(true);
                        router.push("/fide/dashboard");
                    },
                }}
            />
        </>
    );
}
