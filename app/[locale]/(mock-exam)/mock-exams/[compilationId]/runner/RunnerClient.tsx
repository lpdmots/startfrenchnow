"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import { useToast } from "@/app/hooks/use-toast";
import { useMockExamRunnerStore, type MockExamRunnerHydration } from "@/app/stores/mockExamRunnerStore";
import { advanceMockExamResume } from "@/app/serverActions/mockExamActions";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";
import RunnerScreenRouter from "./RunnerScreenRouter";
import Link from "next-intl/link";
import { FaArrowLeft } from "react-icons/fa";

type RunnerClientProps = {
    hydrationData: MockExamRunnerHydration;
    speakA2Tasks: RunnerTask[];
};

const RUNNER_PHASES = ["Parler", "Comprendre", "Lire/Écrire"] as const;
const INTRO_KEY_PREFIX = "intro:";
const TASK_TITLE_BY_TYPE: Record<string, string> = {
    IMAGE_DESCRIPTION_A2: "Décrire une image - A2",
    PHONE_CONVERSATION_A2: "Conversation",
    DISCUSSION_A2: "Discussion A2",
    IMAGE_DESCRIPTION_A1_T1: "Décrire une image (1)",
    IMAGE_DESCRIPTION_A1_T2: "Décrire une image (2)",
    DISCUSSION_B1: "Discussion B1",
    READ_WRITE_M1: "Lire/Écrire - A1",
    READ_WRITE_M2: "Lire/Écrire - A1+",
    READ_WRITE_M3_M4: "Lire/Écrire - A2",
    READ_WRITE_M5: "Lire/Écrire - A2+",
    READ_WRITE_M6: "Lire/Écrire - B1",
};

const getRunnerPhaseIndex = (state?: string) => {
    if (!state) return 0;
    if (state.startsWith("READ_WRITE") || state.startsWith("WRITTEN_")) return 2;
    if (state.startsWith("LISTENING") || state.includes("COMPRENDRE")) return 1;
    return 0;
};

const getRunnerHeaderDetails = (state: string | undefined, speakA2Tasks: RunnerTask[], taskId?: string, activityKey?: string) => {
    if (!state) {
        return { title: "Exam Runner", subtitle: "-" };
    }

    if (state !== "SPEAK_A2_RUN") {
        const byState: Record<string, { title: string; subtitle: string }> = {
            EXAM_INTRO: { title: "Introduction", subtitle: "Prêt pour démarrer" },
            SPEAK_A2_RESULT: { title: "Parler A2", subtitle: "Section terminée" },
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

    const isIntro = Boolean(activityKey && activityKey.startsWith(INTRO_KEY_PREFIX));

    if (isIntro) {
        return {
            title: TASK_TITLE_BY_TYPE[task.taskType] || "Tâche orale",
            subtitle: `Tâche ${taskIndex + 1}/${totalTasks}`,
        };
    }

    return {
        title: TASK_TITLE_BY_TYPE[task.taskType] || "Tâche orale",
        subtitle: `Tâche ${taskIndex + 1}/${totalTasks}`,
    };
};

export default function RunnerClient({ hydrationData, speakA2Tasks }: RunnerClientProps) {
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const hydrate = useMockExamRunnerStore((state) => state.hydrate);
    const resume = useMockExamRunnerStore((state) => state.resume);
    const setResume = useMockExamRunnerStore((state) => state.setResume);
    const hasHydratedRef = useRef(false);
    const currentPhaseIndex = getRunnerPhaseIndex(resume?.state);
    const headerDetails = getRunnerHeaderDetails(resume?.state, speakA2Tasks, resume?.taskId, resume?.activityKey);

    useEffect(() => {
        if (hasHydratedRef.current) return;
        hydrate(hydrationData);
        hasHydratedRef.current = true;
    }, [hydrate, hydrationData]);

    useEffect(() => {
        const guardState = { mockExamGuard: true, compilationId: hydrationData.compilationId };
        window.history.pushState(guardState, "", window.location.href);

        const onPopState = () => {
            if (isLeaving) return;
            setShowQuitModal(true);
            window.history.pushState(guardState, "", window.location.href);
        };

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isLeaving) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("popstate", onPopState);
        window.addEventListener("beforeunload", onBeforeUnload);

        return () => {
            window.removeEventListener("popstate", onPopState);
            window.removeEventListener("beforeunload", onBeforeUnload);
        };
    }, [hydrationData.compilationId, isLeaving]);

    const handleAdvance = async ({ nextState, taskId, activityKey }: { nextState: string; taskId?: string; activityKey?: string }) => {
        if (isAdvancing) return;

        setIsAdvancing(true);
        try {
            const result = await advanceMockExamResume({
                compilationId: hydrationData.compilationId,
                sessionKey: hydrationData.sessionKey,
                nextState,
                taskId,
                activityKey,
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

    return (
        <>
            <div className="w-full h-[100dvh] flex flex-col items-center gap-6 p-4 md:p-6">
                <section className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-[minmax(0,800px)_minmax(0,1fr)_auto] items-center gap-2 md:gap-4 py-0">
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
                    <div className="min-w-0 w-full flex lg:flex-col justify-between items-end lg:justify-end shrink-0">
                        <p className="mb-0 text-sm font-semibold uppercase tracking-wide text-neutral-700 truncate">{headerDetails.title}</p>
                        <p className="mb-0 text-xs text-neutral-600 truncate">{headerDetails.subtitle}</p>
                    </div>
                </section>

                <section className="w-full max-w-[1600px] flex-1 min-h-0 py-0">
                    {resume && <RunnerScreenRouter resume={resume} speakA2Tasks={speakA2Tasks} isAdvancing={isAdvancing} onAdvance={handleAdvance} />}
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
