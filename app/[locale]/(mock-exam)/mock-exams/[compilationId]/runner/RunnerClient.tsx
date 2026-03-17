"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import { useToast } from "@/app/hooks/use-toast";
import { useMockExamRunnerStore, type MockExamRunnerHydration } from "@/app/stores/mockExamRunnerStore";
import { advanceMockExamResume } from "@/app/serverActions/mockExamActions";
import { getAnswerTaskId } from "@/app/types/fide/mock-exam";
import type { ExamCorrectionContent, ListeningScenarioResult, OralBranch, ReadWriteAnswer, ScoreSummary, SpeakingAnswer, WrittenCombo } from "@/app/types/fide/mock-exam";
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
    readWriteA1A2Tasks: RunnerTask[];
    readWriteA2B1Tasks: RunnerTask[];
    initialSpeakA2Answers: SpeakingAnswer[];
    initialSpeakA2ScoreSummary: ScoreSummary | null;
    initialSpeakBranchScoreSummary: ScoreSummary | null;
    initialListeningScenarioResults: ListeningScenarioResult[];
    initialListeningScoreSummary: ScoreSummary | null;
    initialReadWriteAnswers: ReadWriteAnswer[];
    initialReadWriteScoreSummary: ScoreSummary | null;
    initialSpeakA2CorrectionRetryCount: number;
    initialSpeakBranchCorrectionRetryCount: number;
    initialReadWriteCorrectionRetryCount: number;
    isAdmin: boolean;
};

const RUNNER_PHASES = ["Parler", "Comprendre", "Lire/Écrire"] as const;
const EXAM_FINAL_SUMMARY = "EXAM_FINAL_SUMMARY";

type DebugPointer = {
    taskId?: string;
    activityKey?: string;
};

type DebugJumpOption = {
    key: string;
    label: string;
    payload: {
        nextState: string;
        taskId?: string;
        activityKey?: string;
        oralBranchChosen?: OralBranch;
        oralBranchRecommended?: OralBranch;
        writtenComboChosen?: WrittenCombo;
        writtenComboRecommended?: WrittenCombo;
    };
    disabled?: boolean;
};

const resolveFirstTaskPointer = (tasks: RunnerTask[]): DebugPointer => {
    for (const task of tasks || []) {
        const firstActivity = (task.activities || [])[0];
        if (task?._id && firstActivity?._key) {
            return { taskId: task._id, activityKey: firstActivity._key };
        }
    }
    return {};
};

const getRunnerPhaseIndex = (state?: string) => {
    if (!state) return 0;
    if (state === "EXAM_FINAL_SUMMARY") return 2;
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
            READ_WRITE_RUN: { title: "Lire/Écrire", subtitle: "Exercices en cours" },
            READ_WRITE_RESULT: { title: "Lire/Écrire", subtitle: "Section terminée" },
            EXAM_FINAL_SUMMARY: { title: "Bilan final", subtitle: "Examen terminé" },
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
    readWriteA1A2Tasks,
    readWriteA2B1Tasks,
    initialSpeakA2Answers,
    initialSpeakA2ScoreSummary,
    initialSpeakBranchScoreSummary,
    initialListeningScenarioResults,
    initialListeningScoreSummary,
    initialReadWriteAnswers,
    initialReadWriteScoreSummary,
    initialSpeakA2CorrectionRetryCount,
    initialSpeakBranchCorrectionRetryCount,
    initialReadWriteCorrectionRetryCount,
    isAdmin,
}: RunnerClientProps) {
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const [speakA2Answers, setSpeakA2Answers] = useState<SpeakingAnswer[]>(initialSpeakA2Answers || []);
    const [writtenCombo, setWrittenCombo] = useState<{ recommended?: WrittenCombo; chosen?: WrittenCombo }>(hydrationData.writtenCombo || { recommended: "A1_A2" });
    const adminMenuRef = useRef<HTMLDivElement | null>(null);
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
        resume?.state === "ORAL_SECTION_SUMMARY" ||
        resume?.state === "EXAM_FINAL_SUMMARY";
    const hideTopHeaderOnSmall =
        resume?.state === "SPEAK_A2_RESULT" ||
        resume?.state === "SPEAK_A2_CORRECTION" ||
        resume?.state === "SPEAK_BRANCH_CORRECTION" ||
        resume?.state === "SPEAK_BRANCH_A1_RUN" ||
        resume?.state === "SPEAK_BRANCH_INTRO" ||
        resume?.state === "SPEAK_BRANCH_B1_CHOICE" ||
        resume?.state === "SPEAK_BRANCH_RESULT" ||
        resume?.state === "READ_WRITE_CHOICE" ||
        resume?.state === "READ_WRITE_RUN" ||
        resume?.state === "READ_WRITE_RESULT" ||
        resume?.state === "EXAM_FINAL_SUMMARY" ||
        resume?.state === "LISTENING_RUN" ||
        resume?.state === "LISTENING_RESULT" ||
        resume?.state === "ORAL_SECTION_SUMMARY";
    const selectedWrittenCombo = writtenCombo?.chosen || writtenCombo?.recommended || "A1_A2";
    const readWriteTasks = selectedWrittenCombo === "A2_B1" ? readWriteA2B1Tasks : readWriteA1A2Tasks;
    const speakA2Pointer = useMemo(() => resolveFirstTaskPointer(speakA2Tasks), [speakA2Tasks]);
    const speakBranchA1Pointer = useMemo(() => resolveFirstTaskPointer(speakBranchA1Tasks), [speakBranchA1Tasks]);
    const speakBranchB1Pointer = useMemo(() => resolveFirstTaskPointer(speakBranchB1Tasks), [speakBranchB1Tasks]);
    const readWritePointer = useMemo(() => resolveFirstTaskPointer(readWriteTasks), [readWriteTasks]);
    const adminJumpOptions = useMemo<DebugJumpOption[]>(
        () => [
            {
                key: "speak-a2-run",
                label: "Parler A2 exercices",
                payload: { nextState: "SPEAK_A2_RUN", taskId: speakA2Pointer.taskId, activityKey: speakA2Pointer.activityKey },
                disabled: !speakA2Pointer.taskId || !speakA2Pointer.activityKey,
            },
            { key: "speak-a2-result", label: "Parler A2 résultats", payload: { nextState: "SPEAK_A2_RESULT" } },
            { key: "speak-branch-choice", label: "Parler branche choix", payload: { nextState: "SPEAK_BRANCH_INTRO" } },
            {
                key: "speak-branch-a1-run",
                label: "Parler branche A1 exercices",
                payload: {
                    nextState: "SPEAK_BRANCH_A1_RUN",
                    taskId: speakBranchA1Pointer.taskId,
                    activityKey: speakBranchA1Pointer.activityKey,
                    oralBranchChosen: "A1",
                    oralBranchRecommended: "A1",
                },
                disabled: !speakBranchA1Pointer.taskId || !speakBranchA1Pointer.activityKey,
            },
            {
                key: "speak-branch-b1-choice",
                label: "Parler branche B1 choix",
                payload: { nextState: "SPEAK_BRANCH_B1_CHOICE", oralBranchChosen: "B1", oralBranchRecommended: "B1" },
            },
            {
                key: "speak-branch-b1-run",
                label: "Parler branche B1 exercices",
                payload: {
                    nextState: "SPEAK_BRANCH_B1_RUN",
                    taskId: speakBranchB1Pointer.taskId,
                    activityKey: speakBranchB1Pointer.activityKey,
                    oralBranchChosen: "B1",
                    oralBranchRecommended: "B1",
                },
                disabled: !speakBranchB1Pointer.taskId || !speakBranchB1Pointer.activityKey,
            },
            { key: "speak-branch-result", label: "Parler branche résultats", payload: { nextState: "SPEAK_BRANCH_RESULT" } },
            { key: "oral-summary", label: "Bilan oral résultats", payload: { nextState: "ORAL_SECTION_SUMMARY" } },
            { key: "listening-run", label: "Comprendre exercices", payload: { nextState: "LISTENING_RUN" } },
            { key: "listening-result", label: "Comprendre résultats", payload: { nextState: "LISTENING_RESULT" } },
            { key: "read-write-choice", label: "Lire/Écrire choix", payload: { nextState: "READ_WRITE_CHOICE" } },
            {
                key: "read-write-run",
                label: "Lire/Écrire exercices",
                payload: {
                    nextState: "READ_WRITE_RUN",
                    taskId: readWritePointer.taskId,
                    activityKey: readWritePointer.activityKey,
                    writtenComboChosen: selectedWrittenCombo,
                    writtenComboRecommended: selectedWrittenCombo,
                },
                disabled: !readWritePointer.taskId || !readWritePointer.activityKey,
            },
            { key: "read-write-result", label: "Lire/Écrire résultats", payload: { nextState: "READ_WRITE_RESULT" } },
            { key: "final-summary", label: "Bilan final", payload: { nextState: EXAM_FINAL_SUMMARY } },
        ],
        [readWritePointer.activityKey, readWritePointer.taskId, selectedWrittenCombo, speakA2Pointer.activityKey, speakA2Pointer.taskId, speakBranchA1Pointer.activityKey, speakBranchA1Pointer.taskId, speakBranchB1Pointer.activityKey, speakBranchB1Pointer.taskId],
    );

    useEffect(() => {
        hydrate(hydrationData);
        setSpeakA2Answers(initialSpeakA2Answers || []);
        setWrittenCombo(hydrationData.writtenCombo || { recommended: "A1_A2" });
    }, [hydrate, hydrationData, initialSpeakA2Answers]);

    useEffect(() => {
        if (!isAdminMenuOpen) return;
        const onClick = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (adminMenuRef.current && target && !adminMenuRef.current.contains(target)) {
                setIsAdminMenuOpen(false);
            }
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [isAdminMenuOpen]);

    useEffect(() => {
        setIsAdminMenuOpen(false);
    }, [resume?.state]);

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
            if (writtenComboRecommended || writtenComboChosen) {
                setWrittenCombo((previous) => ({
                    recommended: writtenComboRecommended || previous.recommended || "A1_A2",
                    chosen: writtenComboChosen || previous.chosen,
                }));
            }
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

    const handleAdminJump = async (option: DebugJumpOption) => {
        if (isAdvancing || option.disabled) return;
        setIsAdminMenuOpen(false);
        setIsAdvancing(true);
        try {
            const result = await advanceMockExamResume({
                compilationId: hydrationData.compilationId,
                sessionKey: hydrationData.sessionKey,
                ...option.payload,
            });

            if (!result?.ok || !result.resume) {
                toast({
                    variant: "destructive",
                    title: "Transition impossible",
                    description: result?.error || "Impossible de changer de layout.",
                });
                return;
            }

            setResume(result.resume);
            if (option.payload.writtenComboRecommended || option.payload.writtenComboChosen) {
                setWrittenCombo((previous) => ({
                    recommended: option.payload.writtenComboRecommended || previous.recommended || "A1_A2",
                    chosen: option.payload.writtenComboChosen || previous.chosen,
                }));
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Erreur inattendue",
                description: "Le changement de layout a échoué.",
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
                    <div className="relative flex items-center justify-start min-h-[40px]" ref={adminMenuRef}>
                        {isAdmin ? (
                            <>
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg border border-solid border-neutral-400 bg-neutral-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-800 transition hover:border-neutral-600"
                                    onClick={() => setIsAdminMenuOpen((previous) => !previous)}
                                    aria-expanded={isAdminMenuOpen}
                                    aria-haspopup="menu"
                                    disabled={isAdvancing}
                                >
                                    Menu test
                                </button>
                                {isAdminMenuOpen ? (
                                    <div className="absolute left-0 top-full z-30 mt-2 max-h-[60vh] w-[320px] overflow-y-auto rounded-xl border border-solid border-neutral-300 bg-neutral-100 p-2 shadow-1">
                                        <ul className="mb-0 list-none p-0">
                                            {adminJumpOptions.map((option) => {
                                                const isCurrent = resume?.state === option.payload.nextState;
                                                return (
                                                    <li key={option.key}>
                                                        <button
                                                            type="button"
                                                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                                                                option.disabled || isAdvancing
                                                                    ? "cursor-not-allowed text-neutral-500"
                                                                    : isCurrent
                                                                      ? "bg-neutral-200 text-secondary-2 font-semibold"
                                                                      : "text-neutral-800 hover:bg-neutral-200 hover:text-secondary-2"
                                                            }`}
                                                            disabled={option.disabled || isAdvancing}
                                                            onClick={() => void handleAdminJump(option)}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ) : null}
                            </>
                        ) : null}
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
                            readWriteA1A2Tasks={readWriteA1A2Tasks}
                            readWriteA2B1Tasks={readWriteA2B1Tasks}
                            speakA2Answers={speakA2Answers}
                            initialSpeakA2ScoreSummary={initialSpeakA2ScoreSummary}
                            initialSpeakBranchScoreSummary={initialSpeakBranchScoreSummary}
                            initialListeningScenarioResults={initialListeningScenarioResults}
                            initialListeningScoreSummary={initialListeningScoreSummary}
                            initialReadWriteAnswers={initialReadWriteAnswers}
                            initialReadWriteScoreSummary={initialReadWriteScoreSummary}
                            initialSpeakA2CorrectionRetryCount={initialSpeakA2CorrectionRetryCount}
                            initialSpeakBranchCorrectionRetryCount={initialSpeakBranchCorrectionRetryCount}
                            initialReadWriteCorrectionRetryCount={initialReadWriteCorrectionRetryCount}
                            writtenCombo={writtenCombo}
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
