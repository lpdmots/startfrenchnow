"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { PortableText } from "@portabletext/react";
import urlFor from "@/app/lib/urlFor";
import {
    evaluateMockExamSpeakA2Section,
    evaluateMockExamSpeakBranchSection,
    saveMockExamListeningScenarioResult,
    type SpeakA2CorrectionSummary,
    type SpeakBranchCorrectionSummary,
} from "@/app/serverActions/mockExamActions";
import CircularProgressMagic from "@/app/components/common/CircularProgressMagic";
import { RichTextComponents } from "@/app/components/sanity/RichTextComponents";
import { getAnswerTaskId } from "@/app/types/fide/mock-exam";
import type { ExamCorrectionContent, ListeningScenarioResult, OralBranch, ResumePointer, ScoreSummary, WrittenCombo } from "@/app/types/fide/mock-exam";
import type { SpeakingAnswer } from "@/app/types/fide/mock-exam";
import type { Exam } from "@/app/types/fide/exam";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";
import ExpandableCardDemo from "@/app/components/ui/expandable-card-demo-standard";
import SpeakingResponsePanel from "./SpeakingResponsePanel";

type AdvancePayload = {
    nextState: string;
    taskId?: string;
    activityKey?: string;
    oralBranchChosen?: OralBranch;
    oralBranchRecommended?: OralBranch;
    writtenComboChosen?: WrittenCombo;
    writtenComboRecommended?: WrittenCombo;
};

type RunnerScreenRouterProps = {
    compilationId: string;
    sessionKey: string;
    resume: ResumePointer;
    compilationName: string;
    compilationCorrections: ExamCorrectionContent[];
    speakA2Tasks: RunnerTask[];
    speakBranchA1Tasks: RunnerTask[];
    speakBranchB1Tasks: RunnerTask[];
    listeningA1Exams: Exam[];
    listeningA2Exams: Exam[];
    listeningB1Exams: Exam[];
    speakA2Answers: SpeakingAnswer[];
    initialListeningScenarioResults: ListeningScenarioResult[];
    initialSpeakA2ScoreSummary?: ScoreSummary | null;
    initialSpeakBranchScoreSummary?: ScoreSummary | null;
    initialListeningScoreSummary?: ScoreSummary | null;
    initialSpeakA2CorrectionRetryCount?: number;
    isAdmin?: boolean;
    isAdvancing: boolean;
    onAdvance: (payload: AdvancePayload) => Promise<void>;
    onSpeakA2AnswerSaved: (answer: SpeakingAnswer) => void;
    onSpeakA2AnswersEvaluated: (answers: SpeakingAnswer[]) => void;
};

type RunnerPointer = {
    taskIndex: number;
    taskId: string;
    activityKey: string;
    activityIndex: number;
};

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;
const SPEAK_A2_TASK2_CONVERSATION_INTRO = "SPEAK_A2_TASK2_CONVERSATION_INTRO";
const SPEAK_A2_TASK3_DISCUSSION_INTRO = "SPEAK_A2_TASK3_DISCUSSION_INTRO";
const SPEAK_A2_CORRECTION = "SPEAK_A2_CORRECTION";
const SPEAK_BRANCH_CORRECTION = "SPEAK_BRANCH_CORRECTION";
const ORAL_SECTION_SUMMARY = "ORAL_SECTION_SUMMARY";
const TRANSITION = { duration: 0.28, ease: "easeOut" as const };
const RUNNER_LAYOUT_MAX_WIDTH = "max-w-[1240px]";
const RUNNER_LAYOUT_BOTTOM_PADDING = "pb-5";
const SPEAK_A2_MAX_MANUAL_RETRIES = 3;
const SPEAK_BRANCH_B1_RECOMMENDATION_THRESHOLD = 65;
const LISTENING_RECOMMENDED_SCENARIO_COUNT = 4;
const TASK_TYPE_LABELS: Record<string, string> = {
    IMAGE_DESCRIPTION_A2: "Tâche 1 - Description d'image",
    PHONE_CONVERSATION_A2: "Tâche 2 - Conversation téléphonique",
    DISCUSSION_A2: "Tâche 3 - Discussion guidée",
    IMAGE_DESCRIPTION_A1_T1: "Tâche 1 - Description d'image",
    IMAGE_DESCRIPTION_A1_T2: "Tâche 2 - Interaction à partir d'images",
    DISCUSSION_B1: "Discussion B1",
};

const detectExamLevel = (exam?: Exam): OralBranch | "A2" | null => {
    const levels = Array.isArray(exam?.levels) ? exam?.levels : [];
    if (levels.includes("B1")) return "B1";
    if (levels.includes("A2")) return "A2";
    if (levels.includes("A1")) return "A1";
    return null;
};

const clampPercentage = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
};

const buildListeningFeedback = (percentage: number) => {
    if (percentage >= 80) return "Très bonne compréhension globale. Bravo !";
    if (percentage >= 60) return "Bonne compréhension d'ensemble. Travaille encore la précision sur certains détails.";
    if (percentage >= 40) return "Compréhension partielle. Reprends les consignes et les informations essentielles.";
    return "Compréhension encore fragile. Entraîne-toi sur des scénarios progressifs et la prise d'indices.";
};

const getListeningScenarioCoefficient = (branch: OralBranch, scenarioLevel: OralBranch | "A2" | null) => {
    if (branch === "A1") {
        return scenarioLevel === "A2" ? 2 : 1;
    }
    return scenarioLevel === "B1" ? 2 : 1;
};

const getValidatedLevelLabel = (branch: OralBranch, finalPercentage: number) => {
    if (branch === "A1") {
        if (finalPercentage >= 65) return "A2 atteint";
        if (finalPercentage >= 26) return "A1 atteint";
        return "A1 non atteint";
    }
    if (finalPercentage >= 79) return "B1 atteint";
    if (finalPercentage >= 43) return "A2 atteint";
    return "A2 non atteint";
};

const withCloudFrontPrefix = (resource?: string) => {
    if (!resource) return undefined;
    if (/^https?:\/\//i.test(resource)) return resource;
    if (!cloudFrontDomain) return resource;

    const normalizedDomain = cloudFrontDomain.endsWith("/") ? cloudFrontDomain : `${cloudFrontDomain}/`;
    const normalizedResource = resource.startsWith("/") ? resource.slice(1) : resource;

    return `${normalizedDomain}${normalizedResource}`;
};

const resolveTaskStartPointer = (task: RunnerTask, taskIndex: number): RunnerPointer | null => {
    const firstActivity = (task.activities || [])[0];
    if (!firstActivity) return null;

    return {
        taskIndex,
        taskId: task._id,
        activityKey: firstActivity._key,
        activityIndex: 0,
    };
};

const resolveFirstTaskPointer = (tasks: RunnerTask[]) => {
    for (let taskIndex = 0; taskIndex < tasks.length; taskIndex += 1) {
        const pointer = resolveTaskStartPointer(tasks[taskIndex], taskIndex);
        if (pointer) return pointer;
    }
    return null;
};

const resolvePointerFromResume = (tasks: RunnerTask[], resume: ResumePointer): RunnerPointer | null => {
    const firstPointer = resolveFirstTaskPointer(tasks);
    if (!firstPointer) return null;

    const taskIndex = resume.taskId ? tasks.findIndex((task) => task._id === resume.taskId) : firstPointer.taskIndex;
    const safeTaskIndex = taskIndex >= 0 ? taskIndex : firstPointer.taskIndex;
    const task = tasks[safeTaskIndex];

    const activityIndex = resume.activityKey ? (task.activities || []).findIndex((activity) => activity._key === resume.activityKey) : -1;
    if (activityIndex >= 0) {
        return {
            taskIndex: safeTaskIndex,
            taskId: task._id,
            activityKey: task.activities[activityIndex]._key,
            activityIndex,
        };
    }

    return resolveTaskStartPointer(task, safeTaskIndex) || firstPointer;
};

const resolveNextTaskPointer = (tasks: RunnerTask[], currentTaskIndex: number) => {
    for (let taskIndex = currentTaskIndex + 1; taskIndex < tasks.length; taskIndex += 1) {
        const pointer = resolveTaskStartPointer(tasks[taskIndex], taskIndex);
        if (pointer) return pointer;
    }
    return null;
};

const resolveNextPointer = (tasks: RunnerTask[], currentPointer: RunnerPointer): RunnerPointer | null => {
    const currentTask = tasks[currentPointer.taskIndex];
    if (!currentTask) return null;
    const currentActivityIndex = currentPointer.activityIndex || 0;
    const activities = currentTask.activities || [];
    if (currentActivityIndex + 1 < activities.length) {
        const nextActivity = activities[currentActivityIndex + 1];
        return {
            taskIndex: currentPointer.taskIndex,
            taskId: currentTask._id,
            activityKey: nextActivity._key,
            activityIndex: currentActivityIndex + 1,
        };
    }

    return resolveNextTaskPointer(tasks, currentPointer.taskIndex);
};

function ActivityImageStage({ task, activityIndex }: { task: RunnerTask; activityIndex: number }) {
    const activity = task.activities[activityIndex];
    if (!activity) {
        return (
            <article className="h-full w-full px-2 py-3 md:px-4 md:py-5">
                <p className="mb-0 text-sm text-neutral-700">Activité introuvable.</p>
                <div style={{ height: 61 }}></div>
            </article>
        );
    }

    const imageUrl = activity.image ? urlFor(activity.image).width(1800).fit("max").url() : null;
    const hasImage = Boolean(imageUrl);

    return (
        <article className="h-full w-full flex flex-col overflow-hidden px-2 py-2 md:px-4 md:py-5">
            <div className="flex w-full items-center justify-center rounded-[1.4rem] bg-neutral-200/70 px-2">
                {hasImage ? (
                    <div className="flex min-h-[240px] w-full max-w-full min-w-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-neutral-300/30 md:max-w-[640px] lg:max-w-[780px] xl:max-w-[920px]">
                        <Image
                            src={imageUrl as string}
                            alt="Image de l'activité"
                            width={1800}
                            height={1200}
                            className="h-auto w-full max-w-full object-contain rounded-3xl border-2 border-solid border-neutral-700 md:max-h-full"
                        />
                    </div>
                ) : (
                    <div className="flex h-full min-h-[240px] w-full items-center justify-center rounded-[1.2rem] bg-neutral-300/70 px-6 text-center text-neutral-700">
                        Aucun visuel pour cette activité.
                    </div>
                )}
            </div>
            <div className="hidden md:block" style={{ height: 61 }}></div>
        </article>
    );
}

export default function RunnerScreenRouter({
    compilationId,
    sessionKey,
    resume,
    compilationName,
    compilationCorrections,
    speakA2Tasks,
    speakBranchA1Tasks,
    speakBranchB1Tasks,
    listeningA1Exams,
    listeningA2Exams,
    listeningB1Exams,
    speakA2Answers,
    initialListeningScenarioResults,
    initialSpeakA2ScoreSummary,
    initialSpeakBranchScoreSummary,
    initialListeningScoreSummary,
    initialSpeakA2CorrectionRetryCount,
    isAdmin,
    isAdvancing,
    onAdvance,
    onSpeakA2AnswerSaved,
    onSpeakA2AnswersEvaluated,
}: RunnerScreenRouterProps) {
    const firstPointer = resolveFirstTaskPointer(speakA2Tasks);
    const branchA1FirstPointer = resolveFirstTaskPointer(speakBranchA1Tasks);
    const branchB1FirstPointer = resolveFirstTaskPointer(speakBranchB1Tasks);
    const taskTwoPointer = speakA2Tasks[1] ? resolveTaskStartPointer(speakA2Tasks[1], 1) : null;
    const taskThreePointer = speakA2Tasks[2] ? resolveTaskStartPointer(speakA2Tasks[2], 2) : null;
    const examIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const taskOneDescriptionIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const taskTwoConversationIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const taskThreeDiscussionIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const speakBranchA1TaskOneIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const speakBranchB1IntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const listeningIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const speakA2CorrectionContent = useMemo(() => (compilationCorrections || []).find((item) => String(item?.correctionType || "") === "SPEAK_A2_RESULT"), [compilationCorrections]);
    const speakA2CorrectionVideoUrl = withCloudFrontPrefix(String(speakA2CorrectionContent?.video || ""));
    const speakA2CorrectionImageUrl = speakA2CorrectionContent?.image ? urlFor(speakA2CorrectionContent.image).width(1800).fit("max").url() : null;
    const speakA2CorrectionBody = Array.isArray(speakA2CorrectionContent?.body) ? speakA2CorrectionContent.body : [];
    const hasSpeakA2CorrectionBody = speakA2CorrectionBody.length > 0;
    const [isEvaluatingA2, setIsEvaluatingA2] = useState(false);
    const [evaluationError, setEvaluationError] = useState<string>("");
    const [evaluationSummary, setEvaluationSummary] = useState<SpeakA2CorrectionSummary | null>(null);
    const [evaluationWaitSeconds, setEvaluationWaitSeconds] = useState(0);
    const [manualRetryCount, setManualRetryCount] = useState(Math.max(0, Number(initialSpeakA2CorrectionRetryCount || 0)));
    const evaluationRequestedRef = useRef(false);
    const resultAccordionInitRef = useRef(false);

    const taskRows = useMemo(() => {
        return speakA2Tasks.map((task) => {
            const answersForTask = speakA2Answers.filter((answer) => getAnswerTaskId(answer) === task._id);
            const hasTranscript = answersForTask.some((answer) => String(answer?.transcriptFinal || "").trim().length > 0);
            const scoredAnswer = answersForTask.find((answer) => typeof answer?.AiScore === "number");
            const feedbackAnswer = answersForTask.find((answer) => String(answer?.AiFeedback || "").trim().length > 0);
            const score = typeof scoredAnswer?.AiScore === "number" ? scoredAnswer.AiScore : null;
            const max = 6;
            const feedback = String(feedbackAnswer?.AiFeedback || "").trim();

            return {
                taskId: task._id,
                taskType: task.taskType,
                label: TASK_TYPE_LABELS[task.taskType] || task.taskType,
                hasTranscript,
                isEvaluated: hasTranscript && score !== null && feedback.length > 0,
                score,
                max,
                feedback,
            };
        });
    }, [speakA2Answers, speakA2Tasks]);

    const hasPendingEvaluation = useMemo(() => taskRows.some((row) => row.hasTranscript && !row.isEvaluated), [taskRows]);

    const totalRow = useMemo(() => {
        const evaluated = taskRows.filter((row) => row.isEvaluated && row.score !== null);
        return {
            score: evaluated.reduce((sum, row) => sum + Number(row.score || 0), 0),
            max: evaluated.reduce((sum, row) => sum + Number(row.max || 0), 0),
        };
    }, [taskRows]);

    const weakestTaskId = useMemo(() => {
        const evaluated = taskRows.filter((row) => row.isEvaluated && row.score !== null);
        if (!evaluated.length) return taskRows[0]?.taskId || null;
        const sorted = [...evaluated].sort((a, b) => Number(a.score || 0) - Number(b.score || 0));
        return sorted[0]?.taskId || null;
    }, [taskRows]);

    const [openedTaskId, setOpenedTaskId] = useState<string | null>(null);

    useEffect(() => {
        if (resume.state !== "SPEAK_A2_RESULT") {
            setOpenedTaskId(null);
            resultAccordionInitRef.current = false;
            return;
        }
        if (resultAccordionInitRef.current) {
            return;
        }
        if (weakestTaskId) {
            setOpenedTaskId(weakestTaskId);
            resultAccordionInitRef.current = true;
        }
    }, [resume.state, weakestTaskId]);

    useEffect(() => {
        setManualRetryCount(Math.max(0, Number(initialSpeakA2CorrectionRetryCount || 0)));
    }, [initialSpeakA2CorrectionRetryCount, sessionKey]);

    const persistedGlobalPercentage = useMemo(() => {
        if (typeof initialSpeakA2ScoreSummary?.percentage !== "number") return null;
        return Math.max(0, Math.min(100, Math.round(initialSpeakA2ScoreSummary.percentage)));
    }, [initialSpeakA2ScoreSummary?.percentage]);

    const persistedGlobalFeedback = useMemo(() => {
        const raw = String(initialSpeakA2ScoreSummary?.feedback || "").trim();
        return raw.length > 0 ? raw : null;
    }, [initialSpeakA2ScoreSummary?.feedback]);

    const globalPercentage = useMemo(() => {
        if (typeof evaluationSummary?.globalPercentage === "number") {
            return Math.max(0, Math.min(100, Math.round(evaluationSummary.globalPercentage)));
        }
        if (persistedGlobalPercentage !== null) {
            return persistedGlobalPercentage;
        }
        if (totalRow.max <= 0) return 0;
        return Math.max(0, Math.min(100, Math.round((totalRow.score / totalRow.max) * 100)));
    }, [evaluationSummary?.globalPercentage, persistedGlobalPercentage, totalRow.max, totalRow.score]);

    const globalFeedbackText = useMemo(() => {
        const runtimeFeedback = String(evaluationSummary?.globalFeedback || "").trim();
        if (runtimeFeedback) return runtimeFeedback;
        if (persistedGlobalFeedback) return persistedGlobalFeedback;
        return "Le feedback global apparaîtra ici après l'analyse IA.";
    }, [evaluationSummary?.globalFeedback, persistedGlobalFeedback]);

    const globalLevelLabel = useMemo(() => {
        if (globalPercentage >= 80) return "Très bon niveau";
        if (globalPercentage >= 60) return "Bon niveau";
        if (globalPercentage >= 40) return "À renforcer";
        return "À travailler";
    }, [globalPercentage]);

    const globalGaugePrimaryColor = useMemo(() => {
        if (globalPercentage < 30) return "var(--secondary-4)";
        if (globalPercentage <= 70) return "var(--secondary-1)";
        return "var(--secondary-5)";
    }, [globalPercentage]);

    const recommendedOralBranch: OralBranch = useMemo(() => {
        return globalPercentage > SPEAK_BRANCH_B1_RECOMMENDATION_THRESHOLD ? "B1" : "A1";
    }, [globalPercentage]);

    const evaluationWaitLabel = useMemo(() => {
        if (evaluationWaitSeconds < 10) return "Analyse IA en cours...";
        if (evaluationWaitSeconds < 25) return "L'IA finalise les scores détaillés...";
        return "Le traitement prend un peu de temps, merci de patienter.";
    }, [evaluationWaitSeconds]);

    const canRetryCorrection = useMemo(() => {
        if (isAdmin) return true;
        return manualRetryCount < SPEAK_A2_MAX_MANUAL_RETRIES;
    }, [isAdmin, manualRetryCount]);

    const remainingManualRetries = useMemo(() => {
        return Math.max(0, SPEAK_A2_MAX_MANUAL_RETRIES - manualRetryCount);
    }, [manualRetryCount]);

    const retryButtonSuffix = useMemo(() => {
        if (isAdmin) return "(∞)";
        return `(${remainingManualRetries}/${SPEAK_A2_MAX_MANUAL_RETRIES})`;
    }, [isAdmin, remainingManualRetries]);

    const runA2Evaluation = useCallback(
        async (options?: { isRetry?: boolean }) => {
            if (isEvaluatingA2) return;
            setIsEvaluatingA2(true);
            setEvaluationError("");
            try {
                const isRetry = options?.isRetry === true;
                const result = await evaluateMockExamSpeakA2Section({ compilationId, sessionKey, isRetry });
                if (typeof result?.retryCount === "number") {
                    setManualRetryCount(Math.max(0, result.retryCount));
                }
                if (!result?.ok) {
                    setEvaluationError(result?.error || "Correction IA impossible.");
                    return;
                }

                onSpeakA2AnswersEvaluated(result.answers || []);
                setEvaluationSummary(result.summary || null);
            } catch {
                setEvaluationError("Erreur inattendue pendant la correction IA.");
            } finally {
                setIsEvaluatingA2(false);
            }
        },
        [compilationId, isEvaluatingA2, onSpeakA2AnswersEvaluated, sessionKey],
    );

    useEffect(() => {
        if (resume.state !== "SPEAK_A2_RESULT") {
            evaluationRequestedRef.current = false;
            return;
        }
        if (evaluationRequestedRef.current || isEvaluatingA2 || !hasPendingEvaluation) {
            return;
        }
        evaluationRequestedRef.current = true;
        void runA2Evaluation();
    }, [hasPendingEvaluation, isEvaluatingA2, resume.state, runA2Evaluation]);

    useEffect(() => {
        if (!isEvaluatingA2) {
            setEvaluationWaitSeconds(0);
            return;
        }

        setEvaluationWaitSeconds(0);
        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
            setEvaluationWaitSeconds(elapsed);
        }, 1000);

        return () => {
            window.clearInterval(interval);
        };
    }, [isEvaluatingA2]);

    const branchA1TaskIds = useMemo(() => new Set((speakBranchA1Tasks || []).map((task) => task._id)), [speakBranchA1Tasks]);
    const branchB1TaskIds = useMemo(() => new Set((speakBranchB1Tasks || []).map((task) => task._id)), [speakBranchB1Tasks]);

    const inferredBranch: OralBranch = useMemo(() => {
        const answeredTaskIds = new Set(speakA2Answers.map((answer) => getAnswerTaskId(answer)).filter(Boolean));
        for (const taskId of answeredTaskIds) {
            if (branchB1TaskIds.has(taskId)) return "B1";
        }
        for (const taskId of answeredTaskIds) {
            if (branchA1TaskIds.has(taskId)) return "A1";
        }
        return "A1";
    }, [branchA1TaskIds, branchB1TaskIds, speakA2Answers]);

    const answeredBranchTaskIds = useMemo(() => {
        return new Set(speakA2Answers.map((answer) => getAnswerTaskId(answer)).filter((taskId) => branchA1TaskIds.has(taskId) || branchB1TaskIds.has(taskId)));
    }, [branchA1TaskIds, branchB1TaskIds, speakA2Answers]);

    const branchCorrectionChoiceIndex = useMemo(() => {
        if (inferredBranch === "B1") {
            const firstB1TaskId = String(speakBranchB1Tasks[0]?._id || "");
            const secondB1TaskId = String(speakBranchB1Tasks[1]?._id || "");
            if (firstB1TaskId && answeredBranchTaskIds.has(firstB1TaskId)) return 1;
            if (secondB1TaskId && answeredBranchTaskIds.has(secondB1TaskId)) return 2;
            return 1;
        }
        return 1;
    }, [answeredBranchTaskIds, inferredBranch, speakBranchB1Tasks]);

    const branchCorrectionType = useMemo(() => {
        if (inferredBranch === "A1") return "SPEAK_BRANCH_RESULT_A1";
        return branchCorrectionChoiceIndex === 2 ? "SPEAK_BRANCH_RESULT_CHOICE_2" : "SPEAK_BRANCH_RESULT_CHOICE_1";
    }, [branchCorrectionChoiceIndex, inferredBranch]);
    const branchCorrectionTaskTitle = useMemo(() => {
        if (inferredBranch === "B1") {
            const selectedTask = branchCorrectionChoiceIndex === 2 ? speakBranchB1Tasks[1] : speakBranchB1Tasks[0];
            const selectedTitle = String(selectedTask?.title || "").trim();
            if (selectedTitle) return selectedTitle;
            return `Tâche ${branchCorrectionChoiceIndex}`;
        }

        const selectedA1TaskId = (speakBranchA1Tasks || []).map((task) => task._id).find((taskId) => answeredBranchTaskIds.has(taskId));
        const selectedA1Task = (speakBranchA1Tasks || []).find((task) => task._id === selectedA1TaskId) || speakBranchA1Tasks[0];
        const selectedA1Title = String(selectedA1Task?.title || "").trim();
        return selectedA1Title || "Parler A1";
    }, [answeredBranchTaskIds, branchCorrectionChoiceIndex, inferredBranch, speakBranchA1Tasks, speakBranchB1Tasks]);

    const speakBranchCorrectionContent = useMemo(() => {
        const byType = (compilationCorrections || []).find((item) => String(item?.correctionType || "") === branchCorrectionType);
        if (byType) return byType;
        const fallbackGeneric = (compilationCorrections || []).find((item) => String(item?.correctionType || "") === "SPEAK_BRANCH_RESULT");
        if (fallbackGeneric) return fallbackGeneric;
        if (inferredBranch === "A1") {
            return (compilationCorrections || []).find((item) => String(item?.correctionType || "") === "SPEAK_BRANCH_RESULT_CHOICE_1");
        }
        return (compilationCorrections || []).find((item) => String(item?.correctionType || "") === "SPEAK_BRANCH_RESULT_CHOICE_1");
    }, [branchCorrectionType, compilationCorrections, inferredBranch]);

    const speakBranchCorrectionVideoUrl = withCloudFrontPrefix(String(speakBranchCorrectionContent?.video || ""));
    const speakBranchCorrectionImageUrl = speakBranchCorrectionContent?.image ? urlFor(speakBranchCorrectionContent.image).width(1800).fit("max").url() : null;
    const speakBranchCorrectionBody = Array.isArray(speakBranchCorrectionContent?.body) ? speakBranchCorrectionContent.body : [];
    const hasSpeakBranchCorrectionBody = speakBranchCorrectionBody.length > 0;

    const [isEvaluatingBranch, setIsEvaluatingBranch] = useState(false);
    const [branchEvaluationError, setBranchEvaluationError] = useState<string>("");
    const [branchEvaluationSummary, setBranchEvaluationSummary] = useState<SpeakBranchCorrectionSummary | null>(null);
    const [branchEvaluationWaitSeconds, setBranchEvaluationWaitSeconds] = useState(0);
    const branchEvaluationRequestedRef = useRef(false);
    const branchResultAccordionInitRef = useRef(false);
    const [openedBranchRowId, setOpenedBranchRowId] = useState<string | null>(null);

    const branchRows = useMemo(() => {
        if (inferredBranch === "B1") {
            const taskById = new Map((speakBranchB1Tasks || []).map((task) => [task._id, task] as const));
            const taskIndexById = new Map((speakBranchB1Tasks || []).map((task, index) => [task._id, index] as const));
            const rows = speakA2Answers
                .filter((answer) => branchB1TaskIds.has(getAnswerTaskId(answer)))
                .map((answer) => {
                    const taskId = getAnswerTaskId(answer);
                    const task = taskById.get(taskId);
                    const activityIndex = (task?.activities || []).findIndex((activity) => activity._key === answer.activityKey);
                    const score = typeof answer?.AiScore === "number" ? answer.AiScore : null;
                    const feedback = String(answer?.AiFeedback || "").trim();
                    const hasTranscript = String(answer?.transcriptFinal || "").trim().length > 0;
                    const questionNumber = activityIndex >= 0 ? activityIndex + 1 : 1;
                    const taskLabel = String(task?.title || "").trim();
                    return {
                        rowId: `${taskId}:${answer.activityKey}`,
                        taskId,
                        taskType: String(task?.taskType || "DISCUSSION_B1"),
                        label: taskLabel ? `${taskLabel} - Question ${questionNumber}` : `Question ${questionNumber}`,
                        order: `${String(taskIndexById.get(taskId) ?? 999).padStart(4, "0")}-${String(questionNumber).padStart(4, "0")}`,
                        hasTranscript,
                        isEvaluated: hasTranscript && score !== null && feedback.length > 0,
                        score,
                        max: 6,
                        feedback,
                    };
                })
                .sort((a, b) => a.order.localeCompare(b.order));
            return rows;
        }

        return (speakBranchA1Tasks || [])
            .map((task, index) => {
                const answersForTask = speakA2Answers.filter((answer) => getAnswerTaskId(answer) === task._id);
                const hasTranscript = answersForTask.some((answer) => String(answer?.transcriptFinal || "").trim().length > 0);
                const scoredAnswer = answersForTask.find((answer) => typeof answer?.AiScore === "number");
                const feedbackAnswer = answersForTask.find((answer) => String(answer?.AiFeedback || "").trim().length > 0);
                const score = typeof scoredAnswer?.AiScore === "number" ? scoredAnswer.AiScore : null;
                const feedback = String(feedbackAnswer?.AiFeedback || "").trim();
                const label = String(task.title || "").trim() || TASK_TYPE_LABELS[task.taskType] || `Tâche ${index + 1}`;
                return {
                    rowId: task._id,
                    taskId: task._id,
                    taskType: task.taskType,
                    label,
                    order: `${String(index).padStart(4, "0")}`,
                    hasTranscript,
                    isEvaluated: hasTranscript && score !== null && feedback.length > 0,
                    score,
                    max: 4,
                    feedback,
                };
            })
            .filter((row) => row.hasTranscript)
            .sort((a, b) => a.order.localeCompare(b.order));
    }, [branchB1TaskIds, inferredBranch, speakA2Answers, speakBranchA1Tasks, speakBranchB1Tasks]);

    const hasPendingBranchEvaluation = useMemo(() => branchRows.some((row) => row.hasTranscript && !row.isEvaluated), [branchRows]);

    const branchTotalRow = useMemo(() => {
        const evaluated = branchRows.filter((row) => row.isEvaluated && row.score !== null);
        return {
            score: evaluated.reduce((sum, row) => sum + Number(row.score || 0), 0),
            max: evaluated.reduce((sum, row) => sum + Number(row.max || 0), 0),
        };
    }, [branchRows]);

    const weakestBranchRowId = useMemo(() => {
        const evaluated = branchRows.filter((row) => row.isEvaluated && row.score !== null);
        if (!evaluated.length) return branchRows[0]?.rowId || null;
        const sorted = [...evaluated].sort((a, b) => Number(a.score || 0) - Number(b.score || 0));
        return sorted[0]?.rowId || null;
    }, [branchRows]);

    useEffect(() => {
        if (resume.state !== "SPEAK_BRANCH_RESULT") {
            setOpenedBranchRowId(null);
            branchResultAccordionInitRef.current = false;
            return;
        }
        if (branchResultAccordionInitRef.current) return;
        if (weakestBranchRowId) {
            setOpenedBranchRowId(weakestBranchRowId);
            branchResultAccordionInitRef.current = true;
        }
    }, [resume.state, weakestBranchRowId]);

    const persistedBranchGlobalPercentage = useMemo(() => {
        if (typeof initialSpeakBranchScoreSummary?.percentage !== "number") return null;
        return Math.max(0, Math.min(100, Math.round(initialSpeakBranchScoreSummary.percentage)));
    }, [initialSpeakBranchScoreSummary?.percentage]);

    const persistedBranchGlobalFeedback = useMemo(() => {
        const raw = String(initialSpeakBranchScoreSummary?.feedback || "").trim();
        return raw.length > 0 ? raw : null;
    }, [initialSpeakBranchScoreSummary?.feedback]);

    const branchGlobalPercentage = useMemo(() => {
        if (typeof branchEvaluationSummary?.globalPercentage === "number") {
            return Math.max(0, Math.min(100, Math.round(branchEvaluationSummary.globalPercentage)));
        }
        if (persistedBranchGlobalPercentage !== null) {
            return persistedBranchGlobalPercentage;
        }
        if (branchTotalRow.max <= 0) return 0;
        return Math.max(0, Math.min(100, Math.round((branchTotalRow.score / branchTotalRow.max) * 100)));
    }, [branchEvaluationSummary?.globalPercentage, branchTotalRow.max, branchTotalRow.score, persistedBranchGlobalPercentage]);

    const branchGlobalFeedbackText = useMemo(() => {
        const runtimeFeedback = String(branchEvaluationSummary?.globalFeedback || "").trim();
        if (runtimeFeedback) return runtimeFeedback;
        if (persistedBranchGlobalFeedback) return persistedBranchGlobalFeedback;
        return "Le feedback global apparaîtra ici après l'analyse IA.";
    }, [branchEvaluationSummary?.globalFeedback, persistedBranchGlobalFeedback]);

    const branchGlobalLevelLabel = useMemo(() => {
        if (branchGlobalPercentage >= 80) return "Très bon niveau";
        if (branchGlobalPercentage >= 60) return "Bon niveau";
        if (branchGlobalPercentage >= 40) return "À renforcer";
        return "À travailler";
    }, [branchGlobalPercentage]);

    const branchGlobalGaugePrimaryColor = useMemo(() => {
        if (branchGlobalPercentage < 30) return "var(--secondary-4)";
        if (branchGlobalPercentage <= 70) return "var(--secondary-1)";
        return "var(--secondary-5)";
    }, [branchGlobalPercentage]);

    const branchEvaluationWaitLabel = useMemo(() => {
        if (branchEvaluationWaitSeconds < 10) return "Analyse IA en cours...";
        if (branchEvaluationWaitSeconds < 25) return "L'IA finalise les scores détaillés...";
        return "Le traitement prend un peu de temps, merci de patienter.";
    }, [branchEvaluationWaitSeconds]);

    const runBranchEvaluation = useCallback(async () => {
        if (isEvaluatingBranch) return;
        setIsEvaluatingBranch(true);
        setBranchEvaluationError("");
        try {
            const result = await evaluateMockExamSpeakBranchSection({ compilationId, sessionKey });
            if (!result?.ok) {
                setBranchEvaluationError(result?.error || "Correction IA impossible.");
                return;
            }
            onSpeakA2AnswersEvaluated(result.answers || []);
            setBranchEvaluationSummary(result.summary || null);
        } catch {
            setBranchEvaluationError("Erreur inattendue pendant la correction IA.");
        } finally {
            setIsEvaluatingBranch(false);
        }
    }, [compilationId, isEvaluatingBranch, onSpeakA2AnswersEvaluated, sessionKey]);

    useEffect(() => {
        if (resume.state !== "SPEAK_BRANCH_RESULT") {
            branchEvaluationRequestedRef.current = false;
            return;
        }
        if (branchEvaluationRequestedRef.current || isEvaluatingBranch || !hasPendingBranchEvaluation) {
            return;
        }
        branchEvaluationRequestedRef.current = true;
        void runBranchEvaluation();
    }, [hasPendingBranchEvaluation, isEvaluatingBranch, resume.state, runBranchEvaluation]);

    useEffect(() => {
        if (!isEvaluatingBranch) {
            setBranchEvaluationWaitSeconds(0);
            return;
        }

        setBranchEvaluationWaitSeconds(0);
        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
            setBranchEvaluationWaitSeconds(elapsed);
        }, 1000);

        return () => {
            window.clearInterval(interval);
        };
    }, [isEvaluatingBranch]);

    const [listeningScenarioResults, setListeningScenarioResults] = useState<ListeningScenarioResult[]>(Array.isArray(initialListeningScenarioResults) ? initialListeningScenarioResults : []);
    const [listeningSummary, setListeningSummary] = useState<ScoreSummary | null>(initialListeningScoreSummary || null);
    const [isSavingListeningScenario, setIsSavingListeningScenario] = useState(false);
    const [listeningSaveError, setListeningSaveError] = useState("");
    const [activeListeningIndex, setActiveListeningIndex] = useState(0);

    useEffect(() => {
        setListeningScenarioResults(Array.isArray(initialListeningScenarioResults) ? initialListeningScenarioResults : []);
        setListeningSummary(initialListeningScoreSummary || null);
        setListeningSaveError("");
    }, [initialListeningScenarioResults, initialListeningScoreSummary, sessionKey]);

    const orderedListeningScenarios = useMemo(() => {
        const source =
            inferredBranch === "B1"
                ? [...(listeningA2Exams || []).slice(0, 2), ...(listeningB1Exams || []).slice(0, 2)]
                : [...(listeningA1Exams || []).slice(0, 2), ...(listeningA2Exams || []).slice(0, 2)];
        const deduped: Exam[] = [];
        const seenIds = new Set<string>();
        for (const exam of source) {
            const id = String(exam?._id || "");
            if (!id || seenIds.has(id)) continue;
            seenIds.add(id);
            deduped.push(exam);
        }
        return deduped.slice(0, LISTENING_RECOMMENDED_SCENARIO_COUNT);
    }, [inferredBranch, listeningA1Exams, listeningA2Exams, listeningB1Exams]);

    const listeningResultsByExamId = useMemo(() => {
        const byId = new Map<string, ListeningScenarioResult>();
        for (const item of listeningScenarioResults || []) {
            const examId = String(item?.examRef?._ref || "");
            if (!examId) continue;
            byId.set(examId, item);
        }
        return byId;
    }, [listeningScenarioResults]);

    const listeningCompletedCount = useMemo(() => {
        return orderedListeningScenarios.reduce((count, exam) => (listeningResultsByExamId.has(exam._id) ? count + 1 : count), 0);
    }, [listeningResultsByExamId, orderedListeningScenarios]);

    const listeningFirstIncompleteIndex = useMemo(() => {
        return orderedListeningScenarios.findIndex((exam) => !listeningResultsByExamId.has(exam._id));
    }, [listeningResultsByExamId, orderedListeningScenarios]);

    const listeningAllCompleted = useMemo(() => {
        return orderedListeningScenarios.length > 0 && listeningFirstIncompleteIndex === -1;
    }, [listeningFirstIncompleteIndex, orderedListeningScenarios.length]);

    useEffect(() => {
        if (resume.state !== "LISTENING_RUN") return;
        if (!orderedListeningScenarios.length) {
            setActiveListeningIndex(0);
            return;
        }
        const fallbackIndex = listeningAllCompleted ? orderedListeningScenarios.length - 1 : Math.max(0, listeningFirstIncompleteIndex);
        // Force strict step-by-step navigation: always stay on current required scenario.
        setActiveListeningIndex(fallbackIndex);
    }, [listeningAllCompleted, listeningFirstIncompleteIndex, orderedListeningScenarios, resume.state]);

    const activeListeningScenario = useMemo(() => {
        if (!orderedListeningScenarios.length) return null;
        const safeIndex = Math.max(0, Math.min(activeListeningIndex, orderedListeningScenarios.length - 1));
        return orderedListeningScenarios[safeIndex] || null;
    }, [activeListeningIndex, orderedListeningScenarios]);

    const listeningRowsDetailed = useMemo(() => {
        return orderedListeningScenarios.map((scenario, index) => {
            const level = detectExamLevel(scenario);
            const result = listeningResultsByExamId.get(scenario._id);
            const rawScore = Number(result?.score || 0);
            const rawMax = Math.max(1, Number(result?.max || 3));
            const coefficient = getListeningScenarioCoefficient(inferredBranch, level);
            return {
                scenario,
                index,
                level,
                result,
                rawScore,
                rawMax,
                coefficient,
                weightedScore: rawScore * coefficient,
                weightedMax: rawMax * coefficient,
            };
        });
    }, [inferredBranch, listeningResultsByExamId, orderedListeningScenarios]);

    const listeningTotalRow = useMemo(() => {
        if (!listeningRowsDetailed.length) {
            return { score: 0, max: 0 };
        }
        return listeningRowsDetailed.reduce(
            (acc, row) => ({
                score: acc.score + row.weightedScore,
                max: acc.max + row.weightedMax,
            }),
            { score: 0, max: 0 },
        );
    }, [listeningRowsDetailed]);

    const listeningGlobalPercentage = useMemo(() => {
        if (listeningTotalRow.max > 0) {
            return clampPercentage((listeningTotalRow.score / listeningTotalRow.max) * 100);
        }
        if (typeof listeningSummary?.percentage === "number") {
            return clampPercentage(listeningSummary.percentage);
        }
        return 0;
    }, [listeningSummary?.percentage, listeningTotalRow.max, listeningTotalRow.score]);

    const listeningGlobalFeedback = useMemo(() => {
        const persisted = String(listeningSummary?.feedback || "").trim();
        if (persisted) return persisted;
        return buildListeningFeedback(listeningGlobalPercentage);
    }, [listeningGlobalPercentage, listeningSummary?.feedback]);

    const listeningGlobalGaugePrimaryColor = useMemo(() => {
        if (listeningGlobalPercentage < 30) return "var(--secondary-4)";
        if (listeningGlobalPercentage <= 70) return "var(--secondary-1)";
        return "var(--secondary-5)";
    }, [listeningGlobalPercentage]);

    const listeningGlobalLevelLabel = useMemo(() => {
        if (listeningGlobalPercentage >= 80) return "Très bon niveau";
        if (listeningGlobalPercentage >= 60) return "Bon niveau";
        if (listeningGlobalPercentage >= 40) return "À renforcer";
        return "À travailler";
    }, [listeningGlobalPercentage]);

    const speakCompositeRow = useMemo(() => {
        const branchMax = inferredBranch === "B1" ? 24 : 8;
        const score = Number(totalRow.score || 0) + Number(branchTotalRow.score || 0);
        const max = 18 + branchMax;
        const percentage = max > 0 ? clampPercentage((score / max) * 100) : 0;
        return {
            score,
            max,
            percentage,
            branchMax,
        };
    }, [branchTotalRow.score, inferredBranch, totalRow.score]);

    const finalOralPercentage = useMemo(() => {
        return clampPercentage(speakCompositeRow.percentage * (2 / 3) + listeningGlobalPercentage * (1 / 3));
    }, [listeningGlobalPercentage, speakCompositeRow.percentage]);

    const validatedLevelLabel = useMemo(() => {
        return getValidatedLevelLabel(inferredBranch, finalOralPercentage);
    }, [finalOralPercentage, inferredBranch]);
    const validatedLevelCode = useMemo(() => {
        const normalizedLabel = String(validatedLevelLabel || "").toLowerCase();
        if (normalizedLabel.includes("non atteint")) return "Aucun";
        return String(validatedLevelLabel || "").split(" ")[0] || "-";
    }, [validatedLevelLabel]);
    const recommendedWrittenCombo: WrittenCombo = useMemo(() => {
        return validatedLevelCode === "A2" || validatedLevelCode === "B1" ? "A2_B1" : "A1_A2";
    }, [validatedLevelCode]);

    const finalOralFeedback = useMemo(() => {
        if (finalOralPercentage >= 80) {
            return "Très bon niveau oral : les consignes sont bien maîtrisées, les réponses sont claires et l’ensemble est solide en production comme en compréhension.";
        }
        if (finalOralPercentage >= 65) {
            return "Niveau oral satisfaisant : l’essentiel est acquis et les échanges restent globalement efficaces. Il faut maintenant gagner en précision et en régularité pour viser le niveau supérieur.";
        }
        if (finalOralPercentage >= 43) {
            return "Niveau oral en construction : les bases permettent de répondre aux tâches, mais les réponses manquent encore parfois de clarté, de détail ou de stabilité.";
        }
        if (finalOralPercentage >= 26) {
            return "Niveau oral élémentaire : certaines intentions de communication sont comprises, mais la précision et la compréhension des informations importantes restent à renforcer.";
        }
        return "Niveau oral encore insuffisant : les réponses restent trop fragiles pour valider les attendus. Il faut reprendre les structures de base et s’entraîner sur des situations simples et guidées.";
    }, [finalOralPercentage]);

    const [oralDetailsTab, setOralDetailsTab] = useState<"A2" | "BRANCH" | "LISTENING">("A2");

    useEffect(() => {
        if (resume.state !== ORAL_SECTION_SUMMARY) return;
        setOralDetailsTab("A2");
    }, [resume.state]);

    const onListeningScenarioCompleted = useCallback(
        async (payload: { examId: string; score: number; max: number }) => {
            if (isSavingListeningScenario) return;
            setIsSavingListeningScenario(true);
            setListeningSaveError("");
            try {
                const result = await saveMockExamListeningScenarioResult({
                    compilationId,
                    sessionKey,
                    examId: payload.examId,
                    score: payload.score,
                    max: payload.max,
                });

                if (!result?.ok) {
                    setListeningSaveError(result?.error || "Impossible de sauvegarder ce scénario.");
                    return;
                }

                const nextResults = Array.isArray(result.results) ? result.results : [];
                setListeningScenarioResults(nextResults);
                setListeningSummary((result.summary as ScoreSummary) || null);

                const completedCount = orderedListeningScenarios.reduce((count, exam) => {
                    return nextResults.some((item) => String(item?.examRef?._ref || "") === exam._id) ? count + 1 : count;
                }, 0);

                const allDone = orderedListeningScenarios.length > 0 && completedCount >= orderedListeningScenarios.length;
                if (allDone) {
                    await onAdvance({ nextState: "LISTENING_RESULT" });
                    return;
                }

                const nextIndex = orderedListeningScenarios.findIndex((exam) => !nextResults.some((item) => String(item?.examRef?._ref || "") === exam._id));
                if (nextIndex >= 0) {
                    setActiveListeningIndex(nextIndex);
                }
            } catch {
                setListeningSaveError("Erreur inattendue pendant la sauvegarde du scénario.");
            } finally {
                setIsSavingListeningScenario(false);
            }
        },
        [compilationId, isSavingListeningScenario, onAdvance, orderedListeningScenarios, sessionKey],
    );

    if (resume.state === "EXAM_INTRO") {
        return (
            <section className={` w-full h-full overflow-hidden px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative mx-auto flex h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} flex-col justify-between items-center gap-6`}>
                    <div className="grow grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:items-center">
                        <div className="space-y-4">
                            <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">L'Examen Blanc</p>
                            <h1 className="display-2 font-medium mb-0 text-neutral-900">Déroulement de l'examen</h1>
                            <p className="mb-0 text-neutral-700">Regarde cette courte vidéo de préparation. Tu y verras les épreuves et l'ordre de passage pour te lancer sereinement.</p>
                            <div className="grid gap-2 text-sm text-neutral-700">
                                <p className="mb-0">
                                    <span className="font-semibold text-neutral-900">1.</span> Parler
                                </p>
                                <p className="mb-0">
                                    <span className="font-semibold text-neutral-900">2.</span> Comprendre
                                </p>
                                <p className="mb-0">
                                    <span className="font-semibold text-neutral-900">3.</span> Lire/Écrire
                                </p>
                            </div>
                            <p className="mb-0 text-xs text-neutral-600">Votre progression est sauvegardée automatiquement.</p>
                        </div>

                        <div className="card relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {examIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={examIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full justify-center lg:justify-end">
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() =>
                                onAdvance({
                                    nextState: "SPEAK_A2_TASK1_DESCRIPTION_INTRO",
                                })
                            }
                            disabled={isAdvancing || !firstPointer}
                        >
                            {isAdvancing ? "Chargement..." : "Commencer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_A2_TASK1_DESCRIPTION_INTRO") {
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Tâche 1</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Description d'image</h1>
                        <p className="mb-0 text-sm text-neutral-600">Objectif: structurer ta réponse simplement, clairement, et dans le temps imparti.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {taskOneDescriptionIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={taskOneDescriptionIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div className="">
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() =>
                                onAdvance({
                                    nextState: "SPEAK_A2_RUN",
                                    taskId: firstPointer?.taskId,
                                    activityKey: firstPointer?.activityKey,
                                })
                            }
                            disabled={isAdvancing || !firstPointer}
                        >
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === SPEAK_A2_TASK2_CONVERSATION_INTRO) {
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Tâche 2</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Conversation téléphonique</h1>
                        <p className="mb-0 text-sm text-neutral-600">Objectif: tenir un échange simple, écouter les relances et répondre clairement.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {taskTwoConversationIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={taskTwoConversationIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div className="">
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() =>
                                onAdvance({
                                    nextState: "SPEAK_A2_RUN",
                                    taskId: taskTwoPointer?.taskId,
                                    activityKey: taskTwoPointer?.activityKey,
                                })
                            }
                            disabled={isAdvancing || !taskTwoPointer}
                        >
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === SPEAK_A2_TASK3_DISCUSSION_INTRO) {
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Tâche 3</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Discussion guidée</h1>
                        <p className="mb-0 text-sm text-neutral-600">Objectif: exprimer ton avis de façon simple, justifier brièvement et interagir avec l'examinateur.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {taskThreeDiscussionIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={taskThreeDiscussionIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div className="">
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() =>
                                onAdvance({
                                    nextState: "SPEAK_A2_RUN",
                                    taskId: taskThreePointer?.taskId,
                                    activityKey: taskThreePointer?.activityKey,
                                })
                            }
                            disabled={isAdvancing || !taskThreePointer}
                        >
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_BRANCH_A1_INTRO") {
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Branche A1 - Tâche 1</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Description d'image</h1>
                        <p className="mb-0 text-sm text-neutral-600">Objectif: décrire l'image simplement, en phrases courtes et claires.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {speakBranchA1TaskOneIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={speakBranchA1TaskOneIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_A1_RUN", taskId: branchA1FirstPointer?.taskId, activityKey: branchA1FirstPointer?.activityKey })}
                            disabled={isAdvancing || !branchA1FirstPointer}
                        >
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_BRANCH_B1_INTRO") {
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Branche B1</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Discussion guidée</h1>
                        <p className="mb-0 text-sm text-neutral-600">Objectif: décrire une expérience, un processus ou une situation hypothétique.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {speakBranchB1IntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={speakBranchB1IntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div>
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_B1_CHOICE" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_BRANCH_B1_CHOICE") {
        const b1Tasks = speakBranchB1Tasks || [];
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} px-2 py-2 md:px-4 md:py-5 flex items-start pt-12 lg:pt-24 justify-center`}>
                <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Parler Branche B1</p>
                        <h1 className="display-2 mb-0 text-neutral-900">Choisis ton épreuve</h1>
                        <p className="mb-0 text-sm text-neutral-600">Sélectionne l'une des deux tâches B1 proposées dans ce template.</p>
                    </div>

                    {b1Tasks.length > 0 ? (
                        <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
                            {b1Tasks.slice(0, 2).map((task, index) => {
                                const pointer = resolveTaskStartPointer(task, index);
                                const label = String(task.title || "").trim() || TASK_TYPE_LABELS[task.taskType] || `Tâche B1 ${index + 1}`;
                                return (
                                    <button
                                        key={task._id}
                                        type="button"
                                        className="flex h-full flex-col items-center text-center btn btn-secondary small"
                                        onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_B1_RUN", taskId: pointer?.taskId, activityKey: pointer?.activityKey })}
                                        disabled={isAdvancing || !pointer}
                                    >
                                        <p className="mb-1 text-lg font-semibold uppercase tracking-[0.14em] text-inherit">Épreuve {index + 1}</p>
                                        <p className="mb-0 text-xl font-semibold text-inherit">{label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-solid border-neutral-300 bg-neutral-100 px-5 py-4 text-neutral-700">Aucune tâche B1 disponible dans ce template.</div>
                    )}
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_BRANCH_B1_RUN") {
        const currentPointer = resolvePointerFromResume(speakBranchB1Tasks, resume);
        if (!currentPointer) {
            return (
                <section
                    className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}
                >
                    <div className="flex flex-col gap-3">
                        <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">SECTION</p>
                        <h1 className="display-2 font-medium mb-0">Parler Branche B1</h1>
                        <p className="mb-0 text-neutral-700">Aucune tâche B1 disponible dans cette compilation.</p>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Passer à la suite"}
                        </button>
                    </div>
                </section>
            );
        }

        const currentTask = speakBranchB1Tasks[currentPointer.taskIndex];
        const activities = currentTask.activities || [];
        const safeActivityIndex = Math.max(0, Math.min(currentPointer.activityIndex || 0, Math.max(activities.length - 1, 0)));
        const activeActivity = activities[safeActivityIndex];

        if (!activeActivity) {
            return (
                <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8`}>
                    <p className="mb-0 text-neutral-700">Aucune question disponible pour cette tâche B1.</p>
                </section>
            );
        }

        const answersForTask = speakA2Answers.filter((answer) => getAnswerTaskId(answer) === currentPointer.taskId);
        const answersByActivityKey = new Map(answersForTask.map((answer) => [answer.activityKey, answer] as const));
        const isActivityValidated = (activityKey: string) => {
            const answer = answersByActivityKey.get(activityKey);
            return Boolean(answer?.audioUrl && String(answer?.transcriptFinal || "").trim().length > 0);
        };

        const validatedCount = activities.reduce((count, activity) => (isActivityValidated(activity._key) ? count + 1 : count), 0);
        const firstUnvalidatedIndex = activities.findIndex((activity) => !isActivityValidated(activity._key));
        const highestUnlockedIndex = firstUnvalidatedIndex === -1 ? activities.length - 1 : firstUnvalidatedIndex;
        const progressPercent = activities.length > 0 ? Math.round((validatedCount / activities.length) * 100) : 0;
        const activeAnswer = answersByActivityKey.get(activeActivity._key);

        return (
            <section
                className={`pt-0 md:pt-8 lg:pt-12 grid w-full lg:w-auto ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-4 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(240px,320px)_minmax(0,600px)]`}
            >
                <aside className="min-h-0">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="hidden lg:block mb-0 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Discussion B1</p>
                            <h2 className="mb-0 text-xl font-semibold text-neutral-900">{String(currentTask.title || "").trim() || "Épreuve B1"}</h2>
                            <p className="mb-0 text-sm text-neutral-600">
                                {validatedCount}/{activities.length} validée{validatedCount > 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                            <div className="h-full rounded-full bg-secondary-2 transition-all" style={{ width: `${progressPercent}%` }} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                            {activities.map((activity, index) => {
                                const isValidated = isActivityValidated(activity._key);
                                const isActive = index === safeActivityIndex;
                                const isUnlocked = index <= highestUnlockedIndex || isValidated;

                                return (
                                    <button
                                        type="button"
                                        key={activity._key}
                                        onClick={() =>
                                            onAdvance({
                                                nextState: "SPEAK_BRANCH_B1_RUN",
                                                taskId: currentPointer.taskId,
                                                activityKey: activity._key,
                                            })
                                        }
                                        disabled={isAdvancing || !isUnlocked}
                                        className={clsx(
                                            "w-full rounded-xl border border-solid p-3 text-left transition",
                                            isActive
                                                ? "border-neutral-600 border-2 bg-neutral-100 text-secondary-2 font-bold"
                                                : isValidated
                                                  ? "border-secondary-2 bg-secondary-2"
                                                  : isUnlocked
                                                    ? "border-neutral-300 bg-secondary-2 hover:border-neutral-600"
                                                    : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed",
                                        )}
                                    >
                                        <p className="mb-0 text-sm font-semibold text-inherit">Question {index + 1}</p>
                                        <p className="mb-0 text-xs text-inherit">{isValidated ? "Validée" : isActive ? "En cours" : isUnlocked ? "À faire" : "Verrouillée"}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                <div className="min-h-0 flex flex-col gap-2 lg:min-w-[600px]">
                    <div className="px-2 md:px-4">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
                            Question {safeActivityIndex + 1}/{activities.length}
                        </p>
                    </div>

                    <SpeakingResponsePanel
                        key={`${currentPointer.taskId}-${activeActivity._key}`}
                        compilationId={compilationId}
                        sessionKey={sessionKey}
                        taskId={currentPointer.taskId}
                        activityKey={activeActivity._key}
                        taskType={currentTask.taskType}
                        activityAiContext={activeActivity.aiContext}
                        activityAiVoiceGender={activeActivity.aiVoiceGender}
                        questionAudioUrl={activeActivity.audioUrl}
                        promptText={activeActivity.promptText}
                        existingAnswer={activeAnswer}
                        isAdvancing={isAdvancing}
                        onAnswerSaved={onSpeakA2AnswerSaved}
                        onValidated={() => {
                            const nextIndex = safeActivityIndex + 1;
                            if (nextIndex < activities.length) {
                                return onAdvance({
                                    nextState: "SPEAK_BRANCH_B1_RUN",
                                    taskId: currentPointer.taskId,
                                    activityKey: activities[nextIndex]._key,
                                });
                            }
                            return onAdvance({ nextState: "SPEAK_BRANCH_RESULT" });
                        }}
                    />
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_BRANCH_A1_RUN") {
        const currentPointer = resolvePointerFromResume(speakBranchA1Tasks, resume);
        if (!currentPointer) {
            return (
                <section
                    className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}
                >
                    <div className="flex flex-col gap-3">
                        <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">SECTION</p>
                        <h1 className="display-2 font-medium mb-0">Parler Branche A1</h1>
                        <p className="mb-0 text-neutral-700">Aucune tâche A1 disponible dans cette compilation.</p>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Passer à la suite"}
                        </button>
                    </div>
                </section>
            );
        }

        const currentTask = speakBranchA1Tasks[currentPointer.taskIndex];
        const nextPointer = resolveNextPointer(speakBranchA1Tasks, currentPointer);
        const nextAdvancePayload: AdvancePayload = nextPointer
            ? {
                  nextState: "SPEAK_BRANCH_A1_RUN",
                  taskId: nextPointer.taskId,
                  activityKey: nextPointer.activityKey,
              }
            : { nextState: "SPEAK_BRANCH_RESULT" };

        const currentAnswer = speakA2Answers.find((answer) => getAnswerTaskId(answer) === currentPointer.taskId && answer.activityKey === currentPointer.activityKey);

        if (currentTask.taskType === "IMAGE_DESCRIPTION_A1_T2") {
            const activities = currentTask.activities || [];
            const hasSituationStep = activities.length > 1;
            const situationActivity = hasSituationStep ? activities[0] : null;
            const imageActivities = hasSituationStep ? activities.slice(1) : activities;
            const isSituationStep = hasSituationStep && currentPointer.activityIndex === 0;
            const activeImageIndex = hasSituationStep ? Math.max(0, (currentPointer.activityIndex || 0) - 1) : currentPointer.activityIndex || 0;

            const answersForTask = speakA2Answers.filter((answer) => getAnswerTaskId(answer) === currentPointer.taskId);
            const answersByActivityKey = new Map(answersForTask.map((answer) => [answer.activityKey, answer] as const));
            const isImageValidated = (activityKey: string) => {
                const answer = answersByActivityKey.get(activityKey);
                return Boolean(answer?.audioUrl && String(answer?.transcriptFinal || "").trim().length > 0);
            };

            const firstUnvalidatedImageIndex = imageActivities.findIndex((activity) => !isImageValidated(activity._key));
            const highestUnlockedImageIndex = firstUnvalidatedImageIndex === -1 ? imageActivities.length - 1 : firstUnvalidatedImageIndex;
            const situationCompleted = !hasSituationStep || (currentPointer.activityIndex || 0) > 0;
            const firstImageActivity = imageActivities[0];
            const activeActivity = isSituationStep ? firstImageActivity || activities[0] : activities[currentPointer.activityIndex || 0];
            const activeAnswer = activeActivity ? answersByActivityKey.get(activeActivity._key) : undefined;
            const shouldShowSpeakingPanel = !isSituationStep && Boolean(activeActivity);

            return (
                <section
                    className={`pt-0 md:pt-8 lg:pt-12 grid w-full max-w-[1200px] mx-auto ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-4 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]`}
                >
                    <div className="min-h-0 min-w-0 flex flex-col w-full max-w-[720px] mx-auto lg:max-w-none">
                        <div className="px-2 pb-2 md:px-4">
                            <p className="pl-2 md:pl-4 mb-0 text-lg font-semibold uppercase tracking-[0.14em] text-neutral-600">Parler Branche A1</p>
                            <h2 className="pl-2 md:pl-4 mb-0 font-semibold leading-tight text-neutral-900 display-2">{isSituationStep ? "Situation" : `Image ${activeImageIndex + 1}`}</h2>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`branch-a1-t2-activity-${currentPointer.activityKey}`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={TRANSITION}
                                className="h-full flex items-center"
                            >
                                <ActivityImageStage task={currentTask} activityIndex={currentPointer.activityIndex || 0} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="min-h-0 min-w-0 flex flex-col gap-3">
                        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-xl bg-neutral-200 px-2 py-3 md:px-4">
                            <div
                                className={clsx(
                                    "rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em]",
                                    isSituationStep ? "bg-secondary-2 text-neutral-100" : situationCompleted ? "bg-neutral-800 text-neutral-100" : "bg-neutral-300 text-neutral-700",
                                )}
                            >
                                Situation
                            </div>

                            {imageActivities.map((activity, index) => {
                                const isActive = !isSituationStep && index === activeImageIndex;
                                const isCompleted = isImageValidated(activity._key);
                                const isUnlocked = situationCompleted && (index <= highestUnlockedImageIndex || isActive || isCompleted);

                                return (
                                    <div
                                        key={activity._key}
                                        className={clsx(
                                            "rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em]",
                                            isActive
                                                ? "bg-secondary-2 text-neutral-100"
                                                : isCompleted
                                                  ? "bg-neutral-800 text-neutral-100"
                                                  : isUnlocked
                                                    ? "bg-neutral-300 text-neutral-700"
                                                    : "bg-neutral-200 text-neutral-500",
                                        )}
                                    >
                                        Image {index + 1}
                                    </div>
                                );
                            })}
                        </div>

                        {shouldShowSpeakingPanel && activeActivity ? (
                            <SpeakingResponsePanel
                                key={`branch-a1-t2-${currentPointer.taskId}-${activeActivity._key}`}
                                compilationId={compilationId}
                                sessionKey={sessionKey}
                                taskId={currentPointer.taskId}
                                activityKey={activeActivity._key}
                                taskType={currentTask.taskType}
                                activityAiContext={activeActivity.aiContext}
                                activityAiVoiceGender={activeActivity.aiVoiceGender}
                                questionAudioUrl={activeActivity.audioUrl}
                                promptText={activeActivity.promptText}
                                existingAnswer={activeAnswer}
                                isAdvancing={isAdvancing}
                                onAnswerSaved={onSpeakA2AnswerSaved}
                                onValidated={() => onAdvance(nextAdvancePayload)}
                            />
                        ) : (
                            <article className="rounded-2xl border border-solid border-neutral-400 bg-neutral-100 p-4 md:p-5 shadow-1">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">Étape obligatoire</p>
                                <h3 className="mb-3 text-lg font-semibold text-neutral-900">Écoute la situation</h3>
                                {situationActivity?.audioUrl ? (
                                    <audio controls className="w-full" src={withCloudFrontPrefix(situationActivity.audioUrl)} />
                                ) : (
                                    <p className="mb-0 text-sm text-neutral-600">Aucun audio de situation disponible pour cette activité.</p>
                                )}

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary small min-w-[220px]"
                                        disabled={isAdvancing}
                                        onClick={() => {
                                            if (!firstImageActivity) {
                                                void onAdvance(nextAdvancePayload);
                                                return;
                                            }
                                            void onAdvance({
                                                nextState: "SPEAK_BRANCH_A1_RUN",
                                                taskId: currentPointer.taskId,
                                                activityKey: firstImageActivity._key,
                                            });
                                        }}
                                    >
                                        {isAdvancing ? "Chargement..." : firstImageActivity ? "Passer à l'image 1" : "Continuer"}
                                    </button>
                                </div>
                            </article>
                        )}
                    </div>
                </section>
            );
        }

        return (
            <section
                className={`grid w-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-2 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.7fr)] lg:grid-rows-1 lg:gap-6`}
            >
                <div className="min-h-0 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`branch-a1-activity-${currentPointer.activityKey}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={TRANSITION}
                            className="h-full grow flex items-center"
                        >
                            <ActivityImageStage task={currentTask} activityIndex={currentPointer.activityIndex || 0} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="min-h-0">
                    <SpeakingResponsePanel
                        key={`branch-a1-${currentPointer.taskId}-${currentPointer.activityKey}`}
                        compilationId={compilationId}
                        sessionKey={sessionKey}
                        taskId={currentPointer.taskId}
                        activityKey={currentPointer.activityKey}
                        taskType={currentTask.taskType}
                        activityAiContext={currentTask.activities[currentPointer.activityIndex || 0]?.aiContext}
                        activityAiVoiceGender={currentTask.activities[currentPointer.activityIndex || 0]?.aiVoiceGender}
                        questionAudioUrl={currentTask.activities[currentPointer.activityIndex || 0]?.audioUrl}
                        promptText={currentTask.activities[currentPointer.activityIndex || 0]?.promptText}
                        existingAnswer={currentAnswer}
                        isAdvancing={isAdvancing}
                        onAnswerSaved={onSpeakA2AnswerSaved}
                        onValidated={() => onAdvance(nextAdvancePayload)}
                    />
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_A2_RUN") {
        const currentPointer = resolvePointerFromResume(speakA2Tasks, resume);
        if (!currentPointer) {
            return (
                <section
                    className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}
                >
                    <div className="flex flex-col gap-3">
                        <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">SECTION</p>
                        <h1 className="display-2 font-medium mb-0">Parler A2</h1>
                        <p className="mb-0 text-neutral-700">Aucune tâche A2 disponible dans cette compilation.</p>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "SPEAK_A2_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Passer à la suite"}
                        </button>
                    </div>
                </section>
            );
        }

        const currentTask = speakA2Tasks[currentPointer.taskIndex];
        const nextPointer = resolveNextPointer(speakA2Tasks, currentPointer);
        const buildAdvancePayload = (pointer: RunnerPointer | null): AdvancePayload => {
            if (!pointer) return { nextState: "SPEAK_A2_RESULT" };

            if (pointer.taskIndex !== currentPointer.taskIndex) {
                if (pointer.taskIndex === 1) {
                    return {
                        nextState: SPEAK_A2_TASK2_CONVERSATION_INTRO,
                        taskId: pointer.taskId,
                        activityKey: pointer.activityKey,
                    };
                }
                if (pointer.taskIndex === 2) {
                    return {
                        nextState: SPEAK_A2_TASK3_DISCUSSION_INTRO,
                        taskId: pointer.taskId,
                        activityKey: pointer.activityKey,
                    };
                }
            }

            return {
                nextState: "SPEAK_A2_RUN",
                taskId: pointer.taskId,
                activityKey: pointer.activityKey,
            };
        };

        const nextAdvancePayload = buildAdvancePayload(nextPointer);
        const nextTaskIntroState =
            nextAdvancePayload.nextState === SPEAK_A2_TASK2_CONVERSATION_INTRO || nextAdvancePayload.nextState === SPEAK_A2_TASK3_DISCUSSION_INTRO ? nextAdvancePayload.nextState : null;

        const continueLabel = !nextPointer ? "Terminer la section A2" : nextTaskIntroState ? "Tâche suivante" : "Activité suivante";

        if (currentTask.taskType === "DISCUSSION_A2") {
            const activities = currentTask.activities || [];
            const safeActivityIndex = Math.max(0, Math.min(currentPointer.activityIndex || 0, Math.max(activities.length - 1, 0)));
            const activeActivity = activities[safeActivityIndex];

            if (!activeActivity) {
                return (
                    <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8`}>
                        <p className="mb-0 text-neutral-700">Aucune question de discussion disponible.</p>
                    </section>
                );
            }

            const answersForTask = speakA2Answers.filter((answer) => getAnswerTaskId(answer) === currentPointer.taskId);
            const answersByActivityKey = new Map(answersForTask.map((answer) => [answer.activityKey, answer] as const));
            const isActivityValidated = (activityKey: string) => {
                const answer = answersByActivityKey.get(activityKey);
                return Boolean(answer?.audioUrl && String(answer?.transcriptFinal || "").trim().length > 0);
            };

            const validatedCount = activities.reduce((count, activity) => (isActivityValidated(activity._key) ? count + 1 : count), 0);
            const firstUnvalidatedIndex = activities.findIndex((activity) => !isActivityValidated(activity._key));
            const highestUnlockedIndex = firstUnvalidatedIndex === -1 ? activities.length - 1 : firstUnvalidatedIndex;
            const progressPercent = activities.length > 0 ? Math.round((validatedCount / activities.length) * 100) : 0;
            const lastActivity = activities[activities.length - 1];
            const afterDiscussionPointer = lastActivity
                ? resolveNextPointer(speakA2Tasks, {
                      taskIndex: currentPointer.taskIndex,
                      taskId: currentPointer.taskId,
                      activityIndex: activities.length - 1,
                      activityKey: lastActivity._key,
                  })
                : null;
            const afterDiscussionPayload = buildAdvancePayload(afterDiscussionPointer);
            const activeAnswer = answersByActivityKey.get(activeActivity._key);

            return (
                <section
                    className={`pt-0 md:pt-8 lg:pt-12 grid w-full lg:w-auto ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-4 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(240px,320px)_minmax(0,600px)]`}
                >
                    <aside className="min-h-0">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <p className="hidden lg:block mb-0 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Discussion</p>
                                <h2 className="mb-0 text-xl font-semibold text-neutral-900">{activities.length} questions à traiter</h2>
                                <p className="mb-0 text-sm text-neutral-600">
                                    {validatedCount}/{activities.length} validée{validatedCount > 1 ? "s" : ""}
                                </p>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                <div className="h-full rounded-full bg-secondary-2 transition-all" style={{ width: `${progressPercent}%` }} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                                {activities.map((activity, index) => {
                                    const isValidated = isActivityValidated(activity._key);
                                    const isActive = index === safeActivityIndex;
                                    const isUnlocked = index <= highestUnlockedIndex || isValidated;

                                    return (
                                        <button
                                            type="button"
                                            key={activity._key}
                                            onClick={() =>
                                                onAdvance({
                                                    nextState: "SPEAK_A2_RUN",
                                                    taskId: currentPointer.taskId,
                                                    activityKey: activity._key,
                                                })
                                            }
                                            disabled={isAdvancing || !isUnlocked}
                                            className={clsx(
                                                "w-full rounded-xl border border-solid p-3 text-left transition",
                                                isActive
                                                    ? "border-neutral-600 border-2 bg-neutral-100 text-secondary-2 font-bold"
                                                    : isValidated
                                                      ? "border-secondary-2 bg-secondary-2"
                                                      : isUnlocked
                                                        ? "border-neutral-300 bg-secondary-2 hover:border-neutral-600"
                                                        : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed",
                                            )}
                                        >
                                            <p className="mb-0 text-sm font-semibold text-inherit">Question {index + 1}</p>
                                            <p className="mb-0 text-xs text-inherit">{isValidated ? "Validée" : isActive ? "En cours" : isUnlocked ? "À faire" : "Verrouillée"}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <div className="min-h-0 flex flex-col gap-2 lg:min-w-[600px]">
                        <div className="px-2 md:px-4">
                            <p className="mb-0 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
                                Question {safeActivityIndex + 1}/{activities.length}
                            </p>
                        </div>

                        <SpeakingResponsePanel
                            key={`${currentPointer.taskId}-${activeActivity._key}`}
                            compilationId={compilationId}
                            sessionKey={sessionKey}
                            taskId={currentPointer.taskId}
                            activityKey={activeActivity._key}
                            taskType={currentTask.taskType}
                            activityAiContext={activeActivity.aiContext}
                            activityAiVoiceGender={activeActivity.aiVoiceGender}
                            questionAudioUrl={activeActivity.audioUrl}
                            promptText={activeActivity.promptText}
                            existingAnswer={activeAnswer}
                            isAdvancing={isAdvancing}
                            onAnswerSaved={onSpeakA2AnswerSaved}
                            onValidated={() => {
                                const nextIndex = safeActivityIndex + 1;
                                if (nextIndex < activities.length) {
                                    return onAdvance({
                                        nextState: "SPEAK_A2_RUN",
                                        taskId: currentPointer.taskId,
                                        activityKey: activities[nextIndex]._key,
                                    });
                                }
                                return onAdvance(afterDiscussionPayload);
                            }}
                        />
                    </div>
                </section>
            );
        }

        const currentAnswer = speakA2Answers.find((answer) => getAnswerTaskId(answer) === currentPointer.taskId && answer.activityKey === currentPointer.activityKey);

        return (
            <section
                className={`grid w-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-2 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.7fr)] lg:grid-rows-1 lg:gap-6`}
            >
                <div className="min-h-0 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`activity-${currentPointer.activityKey}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={TRANSITION}
                            className="h-full grow flex items-center"
                        >
                            <ActivityImageStage task={currentTask} activityIndex={currentPointer.activityIndex || 0} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="min-h-0">
                    <SpeakingResponsePanel
                        key={`${currentPointer.taskId}-${currentPointer.activityKey}`}
                        compilationId={compilationId}
                        sessionKey={sessionKey}
                        taskId={currentPointer.taskId}
                        activityKey={currentPointer.activityKey}
                        taskType={currentTask.taskType}
                        activityAiContext={currentTask.activities[currentPointer.activityIndex || 0]?.aiContext}
                        activityAiVoiceGender={currentTask.activities[currentPointer.activityIndex || 0]?.aiVoiceGender}
                        questionAudioUrl={currentTask.activities[currentPointer.activityIndex || 0]?.audioUrl}
                        promptText={currentTask.activities[currentPointer.activityIndex || 0]?.promptText}
                        existingAnswer={currentAnswer}
                        isAdvancing={isAdvancing}
                        onAnswerSaved={onSpeakA2AnswerSaved}
                        onValidated={() => onAdvance(nextAdvancePayload)}
                    />
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_A2_RESULT") {
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0`}>
                <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">RÉSULTAT</p>
                    <h1 className="display-2 font-medium mb-0">Parler A2 terminé</h1>
                </div>

                <AnimatePresence initial={false}>
                    {isEvaluatingA2 ? (
                        <motion.div
                            key="evaluating-a2"
                            initial={{ maxHeight: 0, opacity: 0 }}
                            animate={{ maxHeight: 220, opacity: 1 }}
                            exit={{ maxHeight: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="overflow-hidden shrink-0"
                        >
                            <div className="min-h-[72px] rounded-2xl border border-solid border-neutral-600 px-4 py-4 text-neutral-700">
                                <div className="flex items-center gap-3">
                                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-neutral-700 border-t-neutral-300" />
                                    <div className="flex flex-col">
                                        <p className="mb-0 text-sm font-semibold text-neutral-800">{evaluationWaitLabel}</p>
                                        <p className="mb-0 text-xs text-neutral-600">Temps d'attente: {evaluationWaitSeconds}s</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {evaluationError && <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{evaluationError}</div>}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
                    <aside className="rounded-2xl border border-solid border-neutral-600 shadow-1 p-4 md:p-5 flex flex-col items-center gap-4">
                        <CircularProgressMagic
                            max={100}
                            min={0}
                            value={globalPercentage}
                            gaugePrimaryColor={globalGaugePrimaryColor}
                            gaugeSecondaryColor="var(--neutral-300)"
                            className="h-40 w-40"
                            withSize={false}
                            fontHeight="text-4xl"
                        />
                        <p className="mb-0 text-xs uppercase tracking-wide text-neutral-600">Global</p>
                        <p className="mb-0 rounded-full border border-solid border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-700">{globalLevelLabel}</p>
                        <p className="mb-0 text-sm text-neutral-700 text-center">{globalFeedbackText}</p>
                        <div className="w-full rounded-xl border border-solid border-neutral-300 p-3">
                            <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Points totaux</p>
                            <p className="mb-0 text-lg font-semibold text-neutral-800">
                                {totalRow.score}/{totalRow.max || taskRows.length * 6}
                            </p>
                        </div>
                    </aside>

                    <div className="flex flex-col gap-3">
                        {taskRows.map((row, index) => {
                            const taskPercentage = row.score !== null ? Math.round((Number(row.score) / Number(row.max || 6)) * 100) : 0;
                            const isOpen = openedTaskId === row.taskId;
                            const scoreValue = typeof row.score === "number" ? row.score : null;
                            const taskGaugeColor = scoreValue === null ? "var(--neutral-400)" : scoreValue < 2 ? "var(--secondary-4)" : scoreValue <= 4 ? "var(--secondary-1)" : "var(--secondary-5)";
                            return (
                                <article key={row.taskId} className="rounded-2xl border border-solid border-neutral-600 p-4">
                                    <button type="button" className="w-full text-left" onClick={() => setOpenedTaskId((prev) => (prev === row.taskId ? null : row.taskId))} aria-expanded={isOpen}>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="mb-0 font-semibold text-neutral-800">{row.label || `Tâche ${index + 1}`}</p>
                                            <p className="mb-0 text-sm font-semibold text-neutral-800">
                                                {row.isEvaluated ? `${row.score}/${row.max}` : row.hasTranscript ? "En attente" : "Non répondu"}
                                            </p>
                                        </div>
                                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${row.isEvaluated ? taskPercentage : 0}%`, backgroundColor: taskGaugeColor }} />
                                        </div>
                                        <p className="mt-2 mb-0 text-xs text-neutral-600">
                                            {row.isEvaluated ? `${taskPercentage}%` : row.hasTranscript ? "Analyse en cours" : "Aucune réponse enregistrée"}
                                        </p>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen ? (
                                            <motion.div
                                                key={`task-feedback-${row.taskId}`}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22, ease: "easeOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-3 rounded-xl border border-solid border-neutral-300 bg-neutral-200 p-3">
                                                    <p className="mb-0 text-sm text-neutral-700">{row.feedback || "Aucun feedback disponible pour l'instant."}</p>
                                                </div>
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto mb-3 md:mb-5 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        className="btn btn-secondary small min-w-[220px]"
                        disabled={isEvaluatingA2 || !canRetryCorrection}
                        onClick={async () => {
                            evaluationRequestedRef.current = true;
                            await runA2Evaluation({ isRetry: true });
                        }}
                    >
                        {isEvaluatingA2
                            ? `Correction en cours... ${retryButtonSuffix}`
                            : !canRetryCorrection
                              ? `Relances IA épuisées ${retryButtonSuffix}`
                              : `Relancer la correction IA ${retryButtonSuffix}`}
                    </button>
                    <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: SPEAK_A2_CORRECTION })} disabled={isAdvancing || isEvaluatingA2}>
                        {isAdvancing ? "Chargement..." : "Voir la correction A2"}
                    </button>
                </div>
            </section>
        );
    }

    if (resume.state === SPEAK_A2_CORRECTION) {
        return (
            <section className={`w-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} px-2 py-2 md:px-4 md:py-5 !max-w-4xl`}>
                <div className="mx-auto flex w-full flex-col gap-6">
                    <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Correction Parler A2</p>
                    <h1 className="display-2 mb-0 text-neutral-900">{compilationName || "Examen blanc"}</h1>
                    <p className="mb-0 text-sm text-neutral-600">Regarde la correction et compare-la à tes réponses.</p>

                    <div className="w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {speakA2CorrectionVideoUrl ? (
                                <video
                                    controls
                                    preload="metadata"
                                    poster={speakA2CorrectionImageUrl || undefined}
                                    className="block aspect-video w-full rounded-[0.85rem] bg-neutral-950 object-contain"
                                >
                                    <source src={speakA2CorrectionVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            ) : speakA2CorrectionImageUrl ? (
                                <Image src={speakA2CorrectionImageUrl} alt="Correction Parler A2" width={1800} height={1200} className="h-auto w-full rounded-[0.85rem] object-contain" />
                            ) : (
                                <div className="flex min-h-[240px] w-full items-center justify-center rounded-xl bg-neutral-200 px-6 text-center text-neutral-700">
                                    Aucun support de correction disponible.
                                </div>
                            )}
                        </div>
                    </div>

                    {hasSpeakA2CorrectionBody ? (
                        <article className="p-1 md:p-2">
                            <div className="max-w-none">
                                <PortableText value={speakA2CorrectionBody as any} components={RichTextComponents()} />
                            </div>
                        </article>
                    ) : null}

                    <div className="mb-8 flex flex-wrap justify-end gap-3">
                        <button type="button" className="btn btn-secondary small min-w-[220px]" onClick={() => onAdvance({ nextState: "SPEAK_A2_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Revoir les résultats"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_INTRO", oralBranchRecommended: recommendedOralBranch })}
                            disabled={isAdvancing}
                        >
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_BRANCH_INTRO") {
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} px-2 py-2 md:px-4 md:py-5 flex items-start pt-12 lg:pt-24 justify-center`}>
                <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Parler - Branche</p>
                        <h1 className="display-2 mb-0 text-neutral-900">Choisis ton niveau</h1>
                        <p className="mb-0 text-neutral-700">
                            Recommandation IA: <span className="font-semibold text-neutral-900">{recommendedOralBranch}</span> (score Parler A2: {globalPercentage}%).
                        </p>
                        <p className="mb-0 text-sm text-neutral-600">Tu peux suivre la recommandation ou choisir l'autre branche.</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            className={clsx(
                                "flex flex-col items-center rounded-2xl border border-solid px-5 py-4 text-center transition translate_on_hover",
                                recommendedOralBranch === "A1" ? "border-secondary-2 bg-secondary-2 text-neutral-100" : "border-neutral-300 bg-neutral-100 text-neutral-800 hover:border-neutral-500",
                            )}
                            onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_A1_INTRO", oralBranchChosen: "A1" })}
                            disabled={isAdvancing}
                        >
                            <p className="mb-1 text-lg font-semibold uppercase tracking-[0.14em] text-inherit">Branche</p>
                            <p className="mb-0 text-3xl font-semibold text-inherit">A1</p>
                        </button>

                        <button
                            type="button"
                            className={clsx(
                                "flex flex-col items-center rounded-2xl border border-solid px-5 py-4 text-center transition translate_on_hover",
                                recommendedOralBranch === "B1" ? "border-secondary-2 bg-secondary-2 text-neutral-100" : "border-neutral-300 bg-neutral-100 text-neutral-800 hover:border-neutral-500",
                            )}
                            onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_B1_INTRO", oralBranchChosen: "B1" })}
                            disabled={isAdvancing}
                        >
                            <p className="mb-1 text-lg font-semibold uppercase tracking-[0.14em] text-inherit">Branche</p>
                            <p className="mb-0 text-3xl font-semibold text-inherit">B1</p>
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_BRANCH_RESULT") {
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0`}>
                <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">RÉSULTAT</p>
                    <h1 className="display-2 font-medium mb-0">Parler Branche {inferredBranch} terminée</h1>
                </div>

                <AnimatePresence initial={false}>
                    {isEvaluatingBranch ? (
                        <motion.div
                            key="evaluating-branch"
                            initial={{ maxHeight: 0, opacity: 0 }}
                            animate={{ maxHeight: 220, opacity: 1 }}
                            exit={{ maxHeight: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="overflow-hidden shrink-0"
                        >
                            <div className="min-h-[72px] rounded-2xl border border-solid border-neutral-600 px-4 py-4 text-neutral-700">
                                <div className="flex items-center gap-3">
                                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-neutral-700 border-t-neutral-300" />
                                    <div className="flex flex-col">
                                        <p className="mb-0 text-sm font-semibold text-neutral-800">{branchEvaluationWaitLabel}</p>
                                        <p className="mb-0 text-xs text-neutral-600">Temps d'attente: {branchEvaluationWaitSeconds}s</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {branchEvaluationError && <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{branchEvaluationError}</div>}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
                    <aside className="rounded-2xl border border-solid border-neutral-600 shadow-1 p-4 md:p-5 flex flex-col items-center gap-4">
                        <CircularProgressMagic
                            max={100}
                            min={0}
                            value={branchGlobalPercentage}
                            gaugePrimaryColor={branchGlobalGaugePrimaryColor}
                            gaugeSecondaryColor="var(--neutral-300)"
                            className="h-40 w-40"
                            withSize={false}
                            fontHeight="text-4xl"
                        />
                        <p className="mb-0 text-xs uppercase tracking-wide text-neutral-600">Global</p>
                        <p className="mb-0 rounded-full border border-solid border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-700">{branchGlobalLevelLabel}</p>
                        <p className="mb-0 text-sm text-neutral-700 text-center">{branchGlobalFeedbackText}</p>
                        <div className="w-full rounded-xl border border-solid border-neutral-300 p-3">
                            <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Points totaux</p>
                            <p className="mb-0 text-lg font-semibold text-neutral-800">
                                {branchTotalRow.score}/{branchTotalRow.max || (inferredBranch === "B1" ? Math.max(6, branchRows.length * 6) : Math.max(4, branchRows.length * 4))}
                            </p>
                        </div>
                    </aside>

                    <div className="flex flex-col gap-3">
                        {branchRows.length > 0 ? (
                            branchRows.map((row, index) => {
                                const rowPercentage = row.score !== null ? Math.round((Number(row.score) / Number(row.max || 1)) * 100) : 0;
                                const isOpen = openedBranchRowId === row.rowId;
                                const scoreValue = typeof row.score === "number" ? row.score : null;
                                const scoreRatio = scoreValue === null ? 0 : Number(scoreValue) / Math.max(1, Number(row.max || 1));
                                const rowGaugeColor =
                                    scoreValue === null ? "var(--neutral-400)" : scoreRatio < 0.34 ? "var(--secondary-4)" : scoreRatio <= 0.7 ? "var(--secondary-1)" : "var(--secondary-5)";
                                return (
                                    <article key={row.rowId} className="rounded-2xl border border-solid border-neutral-600 p-4">
                                        <button
                                            type="button"
                                            className="w-full text-left"
                                            onClick={() => setOpenedBranchRowId((prev) => (prev === row.rowId ? null : row.rowId))}
                                            aria-expanded={isOpen}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="mb-0 font-semibold text-neutral-800">{row.label || `Élément ${index + 1}`}</p>
                                                <p className="mb-0 text-sm font-semibold text-neutral-800">
                                                    {row.isEvaluated ? `${row.score}/${row.max}` : row.hasTranscript ? "En attente" : "Non répondu"}
                                                </p>
                                            </div>
                                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${row.isEvaluated ? rowPercentage : 0}%`, backgroundColor: rowGaugeColor }} />
                                            </div>
                                            <p className="mt-2 mb-0 text-xs text-neutral-600">
                                                {row.isEvaluated ? `${rowPercentage}%` : row.hasTranscript ? "Analyse en cours" : "Aucune réponse enregistrée"}
                                            </p>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen ? (
                                                <motion.div
                                                    key={`branch-feedback-${row.rowId}`}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.22, ease: "easeOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-3 rounded-xl border border-solid border-neutral-300 bg-neutral-200 p-3">
                                                        <p className="mb-0 text-sm text-neutral-700">{row.feedback || "Aucun feedback disponible pour l'instant."}</p>
                                                    </div>
                                                </motion.div>
                                            ) : null}
                                        </AnimatePresence>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-solid border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-neutral-700">Aucune réponse enregistrée pour cette branche.</div>
                        )}
                    </div>
                </div>

                <div className="mt-auto pb-3 md:pb-5 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        className="btn btn-secondary small min-w-[220px]"
                        disabled={isEvaluatingBranch}
                        onClick={async () => {
                            branchEvaluationRequestedRef.current = true;
                            await runBranchEvaluation();
                        }}
                    >
                        {isEvaluatingBranch ? "Correction en cours..." : "Relancer la correction IA"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary small min-w-[220px]"
                        onClick={() => onAdvance({ nextState: SPEAK_BRANCH_CORRECTION })}
                        disabled={isAdvancing || isEvaluatingBranch}
                    >
                        {isAdvancing ? "Chargement..." : "Voir la correction"}
                    </button>
                </div>
            </section>
        );
    }

    if (resume.state === SPEAK_BRANCH_CORRECTION) {
        return (
            <section className={`w-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} px-2 py-2 md:px-4 md:py-5 !max-w-4xl`}>
                <div className="mx-auto flex w-full flex-col gap-6">
                    <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Correction Parler {inferredBranch}</p>
                    <h1 className="display-2 mb-0 text-neutral-900">{branchCorrectionTaskTitle}</h1>
                    <p className="mb-0 text-sm text-neutral-600">Regarde la correction et compare-la à tes réponses.</p>

                    <div className="w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {speakBranchCorrectionVideoUrl ? (
                                <video
                                    controls
                                    preload="metadata"
                                    poster={speakBranchCorrectionImageUrl || undefined}
                                    className="block aspect-video w-full rounded-[0.85rem] bg-neutral-950 object-contain"
                                >
                                    <source src={speakBranchCorrectionVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            ) : speakBranchCorrectionImageUrl ? (
                                <Image
                                    src={speakBranchCorrectionImageUrl}
                                    alt={`Correction Parler ${inferredBranch}`}
                                    width={1800}
                                    height={1200}
                                    className="h-auto w-full rounded-[0.85rem] object-contain"
                                />
                            ) : (
                                <div className="flex min-h-[240px] w-full items-center justify-center rounded-xl bg-neutral-200 px-6 text-center text-neutral-700">
                                    Aucun support de correction disponible.
                                </div>
                            )}
                        </div>
                    </div>

                    {hasSpeakBranchCorrectionBody ? (
                        <article className="p-1 md:p-2">
                            <div className="max-w-none">
                                <PortableText value={speakBranchCorrectionBody as any} components={RichTextComponents()} />
                            </div>
                        </article>
                    ) : null}

                    <div className="mb-8 flex flex-wrap justify-end gap-3">
                        <button type="button" className="btn btn-secondary small min-w-[220px]" onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Revoir les résultats"}
                        </button>
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "LISTENING_INTRO" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "LISTENING_INTRO") {
        const targetScenariosLabel = inferredBranch === "B1" ? "2 scénarios A2 + 2 scénarios B1" : "2 scénarios A1 + 2 scénarios A2";
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Comprendre</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Scénarios de compréhension orale</h1>
                        <p className="mb-0 text-sm text-neutral-600">
                            Suis l'ordre proposé et complète les {LISTENING_RECOMMENDED_SCENARIO_COUNT} scénarios. Tu auras {targetScenariosLabel}.
                        </p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {listeningIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={listeningIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() => onAdvance({ nextState: "LISTENING_RUN" })}
                            disabled={isAdvancing || orderedListeningScenarios.length === 0}
                        >
                            {isAdvancing ? "Chargement..." : "Commencer"}
                        </button>
                    </div>
                    {orderedListeningScenarios.length === 0 ? <p className="mb-0 text-sm text-secondary-4">Aucun scénario disponible dans ce template pour cette branche.</p> : null}
                </div>
            </section>
        );
    }

    if (resume.state === "LISTENING_RUN") {
        if (!orderedListeningScenarios.length) {
            return (
                <section
                    className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}
                >
                    <div className="flex flex-col gap-3">
                        <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">SECTION</p>
                        <h1 className="display-2 font-medium mb-0">Comprendre</h1>
                        <p className="mb-0 text-neutral-700">Aucun scénario disponible pour cette branche.</p>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "LISTENING_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Passer à la suite"}
                        </button>
                    </div>
                </section>
            );
        }

        const activeScenario = activeListeningScenario || orderedListeningScenarios[0];
        const progressPercent = Math.round((listeningCompletedCount / orderedListeningScenarios.length) * 100);
        const unlockedLimit = listeningAllCompleted ? orderedListeningScenarios.length - 1 : Math.max(0, listeningFirstIncompleteIndex);

        return (
            <section
                className={`pt-0 md:pt-8 lg:pt-12 grid w-full lg:w-auto ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-4 lg:gap-8 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(220px,280px)_minmax(0,1.18fr)]`}
            >
                <aside className="min-h-0">
                    <div className="flex flex-col gap-4 lg:gap-8">
                        <div className="flex flex-col gap-1">
                            <p className="hidden lg:block mb-0 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Comprendre</p>
                            <h2 className="mb-0 text-xl font-semibold text-neutral-900">{orderedListeningScenarios.length} scénarios</h2>
                            <p className="mb-0 text-sm text-neutral-600">
                                {listeningCompletedCount}/{orderedListeningScenarios.length} validé{listeningCompletedCount > 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                            <div className="h-full rounded-full bg-secondary-2 transition-all" style={{ width: `${progressPercent}%` }} />
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {orderedListeningScenarios.map((scenario, index) => {
                                const isCompleted = listeningResultsByExamId.has(scenario._id);
                                const isActive = scenario._id === activeScenario?._id;
                                const result = listeningResultsByExamId.get(scenario._id);
                                const scenarioLevel = detectExamLevel(scenario);
                                return (
                                    <button
                                        type="button"
                                        key={scenario._id}
                                        disabled={!isActive}
                                        className={clsx(
                                            "w-full rounded-xl border border-solid p-3 text-left transition",
                                            !isActive && "cursor-not-allowed",
                                            isActive
                                                ? "border-neutral-600 border-2 bg-neutral-100 text-secondary-2 font-bold"
                                                : isCompleted
                                                  ? "border-secondary-2 bg-secondary-2"
                                                  : index <= unlockedLimit
                                                    ? "border-neutral-300 bg-neutral-100 hover:border-neutral-600"
                                                    : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed",
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="mb-0 text-sm font-semibold text-inherit">Scénario {index + 1}</p>
                                            {result ? (
                                                <p className="mb-0 text-xs font-semibold text-inherit">
                                                    {result.score}/{result.max || 3}
                                                </p>
                                            ) : null}
                                        </div>
                                        <p className="mb-0 text-xs text-inherit line-clamp-1">{scenario.secondaryTitle || scenario.title}</p>
                                        <p className="mt-1 mb-0 text-xs text-inherit">
                                            {isCompleted ? "Validé" : isActive ? "En cours" : index <= unlockedLimit ? "À faire" : "Verrouillé"}
                                            {scenarioLevel ? ` - ${scenarioLevel}` : ""}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                <div className="min-h-0 flex flex-col gap-3">
                    <div className="w-full lg:mt-24">
                        <ExpandableCardDemo
                            exams={[activeScenario]}
                            withStars={false}
                            hasPack={true}
                            isPreviewSection={true}
                            isLargePreviewCard={true}
                            onExamCompleted={onListeningScenarioCompleted}
                        />
                    </div>

                    <AnimatePresence initial={false}>
                        {isSavingListeningScenario ? (
                            <motion.div
                                key="listening-saving"
                                initial={{ maxHeight: 0, opacity: 0 }}
                                animate={{ maxHeight: 220, opacity: 1 }}
                                exit={{ maxHeight: 0, opacity: 0 }}
                                transition={{ duration: 0.24, ease: "easeOut" }}
                                className="overflow-hidden"
                            >
                                <div className="min-h-[72px] rounded-2xl border border-solid border-neutral-600 px-4 py-4 text-neutral-700">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-neutral-700 border-t-neutral-300" />
                                        <p className="mb-0 text-sm font-semibold text-neutral-800">Sauvegarde du scénario...</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {listeningSaveError ? <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{listeningSaveError}</div> : null}
                </div>
            </section>
        );
    }

    if (resume.state === "LISTENING_RESULT") {
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0`}>
                <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">RÉSULTAT</p>
                    <h1 className="display-2 font-medium mb-0">Comprendre terminé</h1>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
                    <aside className="rounded-2xl border border-solid border-neutral-600 shadow-1 p-4 md:p-5 flex flex-col items-center gap-4">
                        <CircularProgressMagic
                            max={100}
                            min={0}
                            value={listeningGlobalPercentage}
                            gaugePrimaryColor={listeningGlobalGaugePrimaryColor}
                            gaugeSecondaryColor="var(--neutral-300)"
                            className="h-40 w-40"
                            withSize={false}
                            fontHeight="text-4xl"
                        />
                        <p className="mb-0 text-xs uppercase tracking-wide text-neutral-600">Global</p>
                        <p className="mb-0 rounded-full border border-solid border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-700">{listeningGlobalLevelLabel}</p>
                        <p className="mb-0 text-sm text-neutral-700 text-center">{listeningGlobalFeedback}</p>
                        <div className="w-full rounded-xl border border-solid border-neutral-300 p-3">
                            <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Points totaux</p>
                            <p className="mb-0 text-lg font-semibold text-neutral-800">
                                {listeningTotalRow.score}/{listeningTotalRow.max || 18}
                            </p>
                        </div>
                    </aside>

                    <div className="flex flex-col gap-3">
                        {listeningRowsDetailed.map((row) => {
                            const ratio = row.weightedMax > 0 ? row.weightedScore / row.weightedMax : 0;
                            const percentage = Math.round(ratio * 100);
                            const barColor = ratio < 0.34 ? "var(--secondary-4)" : ratio <= 0.7 ? "var(--secondary-1)" : "var(--secondary-5)";

                            return (
                                <article key={row.scenario._id} className="rounded-2xl border border-solid border-neutral-600 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="mb-0 font-semibold text-neutral-800">
                                            Scénario {row.index + 1}
                                            {row.level ? ` - ${row.level}` : ""}
                                        </p>
                                        <p className="mb-0 text-sm font-semibold text-neutral-800">{row.result ? `${row.weightedScore}/${row.weightedMax}` : "Non réalisé"}</p>
                                    </div>
                                    <p className="mb-0 mt-1 text-sm text-neutral-600 line-clamp-1">{row.scenario.secondaryTitle || row.scenario.title}</p>
                                    <p className="mt-1 mb-0 text-xs text-neutral-600">Coefficient: x{row.coefficient}</p>
                                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${row.result ? percentage : 0}%`, backgroundColor: barColor }} />
                                    </div>
                                    <p className="mt-2 mb-0 text-xs text-neutral-600">{row.result ? `${percentage}%` : "Aucun score enregistré"}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto pb-3 md:pb-5 flex flex-wrap justify-end gap-3">
                    <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: ORAL_SECTION_SUMMARY })} disabled={isAdvancing}>
                        {isAdvancing ? "Chargement..." : "Continuer"}
                    </button>
                </div>
            </section>
        );
    }

    if (resume.state === ORAL_SECTION_SUMMARY) {
        const branchPointsMax = inferredBranch === "B1" ? 24 : 8;
        const oralPathLabel = inferredBranch === "B1" ? "A2/B1" : "A1/A2";
        const finalGaugeColor = finalOralPercentage < 30 ? "var(--secondary-4)" : finalOralPercentage <= 70 ? "var(--secondary-1)" : "var(--secondary-5)";
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0`}>
                <div className="flex flex-col gap-2">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">BILAN</p>
                    <h1 className="display-2 font-medium mb-0">Bilan partie orale</h1>
                    <p className="mb-0 text-sm text-neutral-600">
                        Parcours: <span className="font-semibold text-neutral-800">{oralPathLabel}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <article className="rounded-2xl border border-solid border-neutral-600 p-4">
                        <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Parler A2</p>
                        <p className="mb-1 text-2xl font-semibold text-neutral-900">
                            {totalRow.score}/{18}
                        </p>
                        <p className="mb-0 text-sm text-neutral-600">{globalPercentage}%</p>
                    </article>
                    <article className="rounded-2xl border border-solid border-neutral-600 p-4">
                        <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Parler {inferredBranch}</p>
                        <p className="mb-1 text-2xl font-semibold text-neutral-900">
                            {branchTotalRow.score}/{branchPointsMax}
                        </p>
                        <p className="mb-0 text-sm text-neutral-600">{branchGlobalPercentage}%</p>
                    </article>
                    <article className="rounded-2xl border border-solid border-neutral-600 p-4">
                        <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Comprendre</p>
                        <p className="mb-1 text-2xl font-semibold text-neutral-900">
                            {listeningTotalRow.score}/{18}
                        </p>
                        <p className="mb-0 text-sm text-neutral-600">{listeningGlobalPercentage}%</p>
                    </article>
                </div>

                <div className="rounded-2xl border border-solid border-neutral-600 p-4 md:p-5">
                    <p className="mb-0 text-xs uppercase tracking-wide text-neutral-600">Résultat final oral (2/3 Parler + 1/3 Comprendre)</p>
                    <div className="mt-3 w-full flex gap-8 lg:gap-12 items-center justify-between flex-wrap">
                        <div className="flex flex-col gap-2 max-w-[500px]">
                            <p className="mb-0 text-sm font-semibold text-neutral-800">Feedback global</p>
                            <p className="mb-0 text-sm text-neutral-700">{finalOralFeedback}</p>
                        </div>

                        <div className="flex gap-4 lg:gap-8 items-center w-full md:w-auto justify-center">
                            <div className="flex justify-start md:justify-center">
                                <CircularProgressMagic
                                    max={100}
                                    min={0}
                                    value={finalOralPercentage}
                                    gaugePrimaryColor={finalGaugeColor}
                                    gaugeSecondaryColor="var(--neutral-300)"
                                    className="h-28 w-28"
                                    withSize={false}
                                    fontHeight="text-2xl"
                                />
                            </div>

                            <div className="flex flex-col items-start gap-1 md:items-end shrink-0">
                                <p className="mb-0 text-xs uppercase tracking-wide text-neutral-600">Niveau atteint</p>
                                <p className={clsx("mb-0 text-7xl font-semibold tracking-tight text-neutral-900 md:text-8xl", validatedLevelCode === "Aucun" && "text-neutral-400 !text-4xl")}>
                                    {validatedLevelCode}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-solid border-neutral-600 p-4 md:p-5">
                    <p className="mb-3 text-xs uppercase tracking-wide text-neutral-600">Détails consultables</p>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" className={clsx("btn btn-secondary small", oralDetailsTab === "A2" && "bg-secondary-2 text-neutral-100")} onClick={() => setOralDetailsTab("A2")}>
                            Parler A2
                        </button>
                        <button type="button" className={clsx("btn btn-secondary small", oralDetailsTab === "BRANCH" && "bg-secondary-2 text-neutral-100")} onClick={() => setOralDetailsTab("BRANCH")}>
                            Parler {inferredBranch}
                        </button>
                        <button
                            type="button"
                            className={clsx("btn btn-secondary small", oralDetailsTab === "LISTENING" && "bg-secondary-2 text-neutral-100")}
                            onClick={() => setOralDetailsTab("LISTENING")}
                        >
                            Comprendre
                        </button>
                    </div>

                    <div className="mt-4">
                        {oralDetailsTab === "A2" ? (
                            <div className="flex flex-col gap-3">
                                {taskRows.map((row) => {
                                    const rowPct = row.score !== null ? Math.round((Number(row.score) / Number(row.max || 1)) * 100) : 0;
                                    const rowColor = row.score === null ? "var(--neutral-400)" : row.score < 2 ? "var(--secondary-4)" : row.score <= 4 ? "var(--secondary-1)" : "var(--secondary-5)";
                                    return (
                                        <article key={row.taskId} className="rounded-xl border border-solid border-neutral-300 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="mb-0 text-sm font-semibold text-neutral-800">{row.label}</p>
                                                <p className="mb-0 text-sm font-semibold text-neutral-800">
                                                    {row.score ?? 0}/{row.max}
                                                </p>
                                            </div>
                                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${rowPct}%`, backgroundColor: rowColor }} />
                                            </div>
                                            <p className="mt-2 mb-0 text-xs text-neutral-600 line-clamp-2">{row.feedback || "Feedback indisponible."}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : null}

                        {oralDetailsTab === "BRANCH" ? (
                            <div className="flex flex-col gap-3">
                                {branchRows.map((row) => {
                                    const rowPct = row.score !== null ? Math.round((Number(row.score) / Number(row.max || 1)) * 100) : 0;
                                    const ratio = row.score !== null ? Number(row.score) / Math.max(1, Number(row.max || 1)) : 0;
                                    const rowColor = row.score === null ? "var(--neutral-400)" : ratio < 0.34 ? "var(--secondary-4)" : ratio <= 0.7 ? "var(--secondary-1)" : "var(--secondary-5)";
                                    return (
                                        <article key={row.rowId} className="rounded-xl border border-solid border-neutral-300 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="mb-0 text-sm font-semibold text-neutral-800">{row.label}</p>
                                                <p className="mb-0 text-sm font-semibold text-neutral-800">
                                                    {row.score ?? 0}/{row.max}
                                                </p>
                                            </div>
                                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${rowPct}%`, backgroundColor: rowColor }} />
                                            </div>
                                            <p className="mt-2 mb-0 text-xs text-neutral-600 line-clamp-2">{row.feedback || "Feedback indisponible."}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : null}

                        {oralDetailsTab === "LISTENING" ? (
                            <div className="flex flex-col gap-3">
                                {listeningRowsDetailed.map((row) => {
                                    const ratio = row.weightedMax > 0 ? row.weightedScore / row.weightedMax : 0;
                                    const rowPct = Math.round(ratio * 100);
                                    const rowColor = ratio < 0.34 ? "var(--secondary-4)" : ratio <= 0.7 ? "var(--secondary-1)" : "var(--secondary-5)";
                                    return (
                                        <article key={row.scenario._id} className="rounded-xl border border-solid border-neutral-300 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="mb-0 text-sm font-semibold text-neutral-800">
                                                    Scénario {row.index + 1} {row.level ? `- ${row.level}` : ""}
                                                </p>
                                                <p className="mb-0 text-sm font-semibold text-neutral-800">
                                                    {row.weightedScore}/{row.weightedMax}
                                                </p>
                                            </div>
                                            <p className="mb-0 mt-1 text-xs text-neutral-600 line-clamp-1">{row.scenario.secondaryTitle || row.scenario.title}</p>
                                            <p className="mb-0 mt-1 text-xs text-neutral-600">Coefficient x{row.coefficient}</p>
                                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${rowPct}%`, backgroundColor: rowColor }} />
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="rounded-2xl border border-solid border-neutral-600 p-4 md:p-5">
                    <p className="mb-3 text-xs uppercase tracking-wide text-neutral-600">Vidéos de correction</p>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <article className="rounded-xl border border-solid border-neutral-300 p-3">
                            <p className="mb-2 text-sm font-semibold text-neutral-800">Correction Parler A2</p>
                            {speakA2CorrectionVideoUrl ? (
                                <video controls preload="metadata" poster={speakA2CorrectionImageUrl || undefined} className="block aspect-video w-full rounded-lg bg-neutral-950 object-contain">
                                    <source src={speakA2CorrectionVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            ) : speakA2CorrectionImageUrl ? (
                                <Image src={speakA2CorrectionImageUrl} alt="Correction Parler A2" width={1600} height={1000} className="h-auto w-full rounded-lg object-contain" />
                            ) : (
                                <div className="flex min-h-[180px] w-full items-center justify-center rounded-lg bg-neutral-200 text-sm text-neutral-700">Aucun support disponible.</div>
                            )}
                        </article>

                        <article className="rounded-xl border border-solid border-neutral-300 p-3">
                            <p className="mb-2 text-sm font-semibold text-neutral-800">Correction Parler {inferredBranch}</p>
                            {speakBranchCorrectionVideoUrl ? (
                                <video controls preload="metadata" poster={speakBranchCorrectionImageUrl || undefined} className="block aspect-video w-full rounded-lg bg-neutral-950 object-contain">
                                    <source src={speakBranchCorrectionVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            ) : speakBranchCorrectionImageUrl ? (
                                <Image src={speakBranchCorrectionImageUrl} alt={`Correction Parler ${inferredBranch}`} width={1600} height={1000} className="h-auto w-full rounded-lg object-contain" />
                            ) : (
                                <div className="flex min-h-[180px] w-full items-center justify-center rounded-lg bg-neutral-200 text-sm text-neutral-700">Aucun support disponible.</div>
                            )}
                        </article>
                    </div>
                </div>

                <div className="mt-auto mb-3 md:mb-5 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        className="btn btn-primary small min-w-[220px]"
                        onClick={() => onAdvance({ nextState: "READ_WRITE_CHOICE", writtenComboRecommended: recommendedWrittenCombo })}
                        disabled={isAdvancing}
                    >
                        {isAdvancing ? "Chargement..." : "Continuer"}
                    </button>
                </div>
            </section>
        );
    }

    if (resume.state === "READ_WRITE_CHOICE") {
        const recommendedLabel = recommendedWrittenCombo === "A2_B1" ? "A2-B1" : "A1-A2";
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col items-center justify-center gap-6 px-2 pt-0`}>
                <div className="w-full max-w-3xl text-center">
                    <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Lire/Écrire</p>
                    <h1 className="display-2 mb-3 text-neutral-900">Choisis ton parcours</h1>
                    <p className="mb-0 text-sm text-neutral-700">
                        Recommandation IA selon tes résultats à l’oral: <span className="font-semibold text-secondary-2">{recommendedLabel}</span>
                    </p>
                </div>

                <div className="w-full max-w-3xl grid grid-cols-1 gap-4 md:grid-cols-2">
                    <button
                        type="button"
                        className={clsx(
                            "flex min-h-[90px] flex-col items-center justify-center rounded-2xl border border-solid p-4 md:p-5 text-center transition",
                            recommendedWrittenCombo === "A1_A2"
                                ? "border-secondary-2 bg-secondary-2 !text-neutral-100"
                                : "border-neutral-600 bg-neutral-100 !text-neutral-800 hover:border-neutral-700",
                        )}
                        onClick={() => onAdvance({ nextState: "READ_WRITE_INTRO", writtenComboChosen: "A1_A2", writtenComboRecommended: recommendedWrittenCombo })}
                        disabled={isAdvancing}
                    >
                        <p className="mb-1 text-[11px] uppercase tracking-wide opacity-90">Parcours</p>
                        <p className="mb-0 text-2xl font-semibold leading-none">A1-A2</p>
                    </button>

                    <button
                        type="button"
                        className={clsx(
                            "flex min-h-[90px] flex-col items-center justify-center rounded-2xl border border-solid p-4 md:p-5 text-center transition",
                            recommendedWrittenCombo === "A2_B1"
                                ? "border-secondary-2 bg-secondary-2 !text-neutral-100"
                                : "border-neutral-600 bg-neutral-100 !text-neutral-800 hover:border-neutral-700",
                        )}
                        onClick={() => onAdvance({ nextState: "READ_WRITE_INTRO", writtenComboChosen: "A2_B1", writtenComboRecommended: recommendedWrittenCombo })}
                        disabled={isAdvancing}
                    >
                        <p className="mb-1 text-[11px] uppercase tracking-wide opacity-90">Parcours</p>
                        <p className="mb-0 text-2xl font-semibold leading-none">A2-B1</p>
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section
            className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}
        >
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">ÉTAT</p>
                <h1 className="display-2 font-medium mb-0">Écran non branché</h1>
                <p className="mb-0 text-neutral-700">
                    L'état <span className="font-semibold">{resume.state}</span> n'a pas encore de composant dédié.
                </p>
            </div>

            <div className="flex justify-end">
                <button type="button" className="btn btn-secondary small min-w-[180px]" onClick={() => onAdvance({ nextState: "EXAM_INTRO" })} disabled={isAdvancing}>
                    Revenir à l'intro
                </button>
            </div>
        </section>
    );
}
