"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { FaArrowLeft, FaArrowRight, FaImage, FaRegEye, FaRegFileAlt } from "react-icons/fa";
import urlFor from "@/app/lib/urlFor";
import {
    evaluateMockExamReadWriteSection,
    evaluateMockExamSpeakA2Section,
    evaluateMockExamSpeakBranchSection,
    type ReadWriteCorrectionSummary,
    saveMockExamListeningScenarioResult,
    saveMockExamReadWriteAnswer,
    type SpeakA2CorrectionSummary,
    type SpeakBranchCorrectionSummary,
} from "@/app/serverActions/mockExamActions";
import CircularProgressMagic from "@/app/components/common/CircularProgressMagic";
import { RichTextComponents } from "@/app/components/sanity/RichTextComponents";
import { getAnswerTaskId } from "@/app/types/fide/mock-exam";
import type { ExamCorrectionContent, ListeningScenarioResult, OralBranch, ReadWriteAnswer, ResumePointer, ScoreSummary, WrittenCombo } from "@/app/types/fide/mock-exam";
import type { SpeakingAnswer } from "@/app/types/fide/mock-exam";
import type { Exam } from "@/app/types/fide/exam";
import type { RunnerReadWriteItem, RunnerTask } from "@/app/types/fide/mock-exam-runner";
import ExpandableCardDemo from "@/app/components/ui/expandable-card-demo-standard";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import SpeakingResponsePanel from "./SpeakingResponsePanel";
import Link from "next/link";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { useRouter } from "next/navigation";
import { PopupModal } from "react-calendly";

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
    readWriteA1A2Tasks: RunnerTask[];
    readWriteA2B1Tasks: RunnerTask[];
    speakA2Answers: SpeakingAnswer[];
    initialListeningScenarioResults: ListeningScenarioResult[];
    initialReadWriteAnswers: ReadWriteAnswer[];
    initialReadWriteScoreSummary?: ScoreSummary | null;
    initialSpeakA2ScoreSummary?: ScoreSummary | null;
    initialSpeakBranchScoreSummary?: ScoreSummary | null;
    initialListeningScoreSummary?: ScoreSummary | null;
    writtenCombo?: { recommended?: WrittenCombo; chosen?: WrittenCombo };
    initialSpeakA2CorrectionRetryCount?: number;
    initialSpeakBranchCorrectionRetryCount?: number;
    initialReadWriteCorrectionRetryCount?: number;
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
const EXAM_FINAL_SUMMARY = "EXAM_FINAL_SUMMARY";
const TRANSITION = { duration: 0.28, ease: "easeOut" as const };
const RUNNER_LAYOUT_MAX_WIDTH = "max-w-[1240px]";
const RUNNER_LAYOUT_BOTTOM_PADDING = "pb-5";
const SPEAK_A2_MAX_MANUAL_RETRIES = 3;
const SPEAK_BRANCH_MAX_MANUAL_RETRIES = 3;
const READ_WRITE_MAX_MANUAL_RETRIES = 3;
const SPEAK_BRANCH_B1_RECOMMENDATION_THRESHOLD = 65;
const LISTENING_RECOMMENDED_SCENARIO_COUNT = 4;
const READ_WRITE_AUTO_NEXT_DELAY_MS = 220;
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

const getReadWriteExpectedTotalMax = (combo: WrittenCombo) => (combo === "A2_B1" ? 59 : 48);

const getReadWriteValidatedLevel = (combo: WrittenCombo, totalScore: number) => {
    const safeScore = Number.isFinite(totalScore) ? totalScore : 0;
    if (combo === "A1_A2") {
        if (safeScore >= 35) return "A2";
        if (safeScore >= 15) return "A1";
        return "Aucun";
    }
    if (safeScore >= 44) return "B1";
    if (safeScore >= 20) return "A2";
    return "Aucun";
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

const getReadWriteAnswerKey = (taskId: string, activityKey: string, questionKey: string) => `${taskId}::${activityKey}::${questionKey}`;

const isReadWriteInstructionItem = (item?: RunnerReadWriteItem | null) => String(item?.itemType || "") === "instruction";

const isReadWriteQuestionItem = (item?: RunnerReadWriteItem | null): item is RunnerReadWriteItem => Boolean(item?._key) && !isReadWriteInstructionItem(item);

const getReadWriteAutoInstruction = (itemType: string) => {
    if (itemType === "single_choice") return "Coche la bonne réponse.";
    if (itemType === "numbered_fill") return "Complète selon le numéro.";
    if (itemType === "text_extract") return "Copie ou colle la partie de texte correspondante.";
    return "";
};

const getReadWriteModuleNumber = (taskType: string, selectedCombo: WrittenCombo): number | null => {
    if (taskType === "READ_WRITE_M1") return 1;
    if (taskType === "READ_WRITE_M2") return 2;
    if (taskType === "READ_WRITE_M3_M4") return selectedCombo === "A2_B1" ? 4 : 3;
    if (taskType === "READ_WRITE_M5") return 5;
    if (taskType === "READ_WRITE_M6") return 6;
    return null;
};

const hasUsableImageAsset = (image?: { asset?: { _ref?: string; _id?: string } } | null) => {
    return Boolean(image?.asset?._ref || image?.asset?._id);
};

const getReadWriteItemTabLabel = (item: RunnerReadWriteItem, index: number) => {
    const itemType = String(item?.itemType || "");
    if (itemType === "instruction") return "Consigne";
    if (itemType === "numbered_fill") {
        const numericLabel = String(item?.question || "").trim();
        return `N°${numericLabel || index}`;
    }
    if (itemType === "text_extract") return `Extrait ${index}`;
    if (itemType === "single_choice") return `Choix ${index}`;
    if (itemType === "long_text") return `Texte ${index}`;
    return `Q${index}`;
};

const parseReadWriteNumberList = (raw: string) => {
    const seen = new Set<string>();
    const list = String(raw || "")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => /^\d+$/.test(item))
        .filter((item) => {
            if (seen.has(item)) return false;
            seen.add(item);
            return true;
        });
    return list;
};

const NUMBERED_DRAFT_PREFIX = "__RW_NUM__";

const parseReadWriteNumberedAnswerDraft = (rawDraft: string, numbers: string[]) => {
    const draft = String(rawDraft || "");
    const base: Record<string, string> = Object.fromEntries(numbers.map((number) => [number, ""]));

    if (draft.startsWith(NUMBERED_DRAFT_PREFIX)) {
        try {
            const payload = JSON.parse(draft.slice(NUMBERED_DRAFT_PREFIX.length)) as Record<string, unknown>;
            for (const number of numbers) {
                base[number] = String(payload?.[number] ?? "");
            }
            return base;
        } catch {
            // fallback legacy format below
        }
    }

    const lines = draft
        .split("\n")
        .map((line) => line.replace(/\r$/, ""))
        .filter(Boolean);

    for (const line of lines) {
        const match = line.match(/^(\d+)\s*[:\-]\s*(.*)$/);
        if (!match) continue;
        const number = match[1];
        if (!numbers.includes(number)) continue;
        base[number] = String(match[2] || "");
    }

    if (numbers.length === 1 && !base[numbers[0]].trim() && draft.trim()) {
        base[numbers[0]] = draft;
    }

    return base;
};

const buildReadWriteNumberedDraft = (numbers: string[], valuesByNumber: Record<string, string>) => {
    const safePayload: Record<string, string> = {};
    for (const number of numbers) {
        safePayload[number] = String(valuesByNumber[number] || "");
    }
    return `${NUMBERED_DRAFT_PREFIX}${JSON.stringify(safePayload)}`;
};

const buildReadWriteNumberedAnswerDraft = (numbers: string[], valuesByNumber: Record<string, string>) => {
    if (!numbers.length) return "";
    if (numbers.length === 1) {
        return String(valuesByNumber[numbers[0]] || "");
    }
    return numbers.map((number) => `${number}: ${String(valuesByNumber[number] || "")}`).join("\n");
};

const normalizeReadWriteItemAnswer = (item: RunnerReadWriteItem, rawDraft: string) => {
    const itemType = String(item?.itemType || "");
    const draft = String(rawDraft || "");

    if (itemType === "numbered_fill") {
        const numbers = parseReadWriteNumberList(String(item?.question || ""));
        if (!numbers.length) {
            const value = draft.trim();
            return { value, complete: Boolean(value) };
        }
        const valuesByNumber = parseReadWriteNumberedAnswerDraft(draft, numbers);
        const complete = numbers.every((number) => String(valuesByNumber[number] || "").trim().length > 0);
        const value = buildReadWriteNumberedAnswerDraft(numbers, valuesByNumber).trim();
        return { value, complete };
    }

    const value = draft.trim();
    return { value, complete: Boolean(value) };
};

const getReadWriteItemQuestionCount = (item: RunnerReadWriteItem) => {
    const itemType = String(item?.itemType || "");
    if (itemType === "numbered_fill") {
        const numbers = parseReadWriteNumberList(String(item?.question || ""));
        return numbers.length || 1;
    }
    return 1;
};

const getReadWriteItemAnsweredCount = (item: RunnerReadWriteItem, rawDraft: string) => {
    const itemType = String(item?.itemType || "");
    const draft = String(rawDraft || "");
    if (itemType === "numbered_fill") {
        const numbers = parseReadWriteNumberList(String(item?.question || ""));
        if (!numbers.length) {
            return draft.trim().length > 0 ? 1 : 0;
        }
        const valuesByNumber = parseReadWriteNumberedAnswerDraft(draft, numbers);
        return numbers.reduce((count, number) => (String(valuesByNumber[number] || "").trim().length > 0 ? count + 1 : count), 0);
    }
    return draft.trim().length > 0 ? 1 : 0;
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
    readWriteA1A2Tasks,
    readWriteA2B1Tasks,
    speakA2Answers,
    initialListeningScenarioResults,
    initialReadWriteAnswers,
    initialReadWriteScoreSummary,
    initialSpeakA2ScoreSummary,
    initialSpeakBranchScoreSummary,
    initialListeningScoreSummary,
    writtenCombo,
    initialSpeakA2CorrectionRetryCount,
    initialSpeakBranchCorrectionRetryCount,
    initialReadWriteCorrectionRetryCount,
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
    const readWriteIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
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
    const [branchManualRetryCount, setBranchManualRetryCount] = useState(Math.max(0, Number(initialSpeakBranchCorrectionRetryCount || 0)));
    const [readWriteManualRetryCount, setReadWriteManualRetryCount] = useState(Math.max(0, Number(initialReadWriteCorrectionRetryCount || 0)));
    const evaluationRequestedRef = useRef(false);
    const resultAccordionInitRef = useRef(false);
    const finalizationRequestedRef = useRef(false);

    useEffect(() => {
        setManualRetryCount(Math.max(0, Number(initialSpeakA2CorrectionRetryCount || 0)));
        setBranchManualRetryCount(Math.max(0, Number(initialSpeakBranchCorrectionRetryCount || 0)));
        setReadWriteManualRetryCount(Math.max(0, Number(initialReadWriteCorrectionRetryCount || 0)));
    }, [initialReadWriteCorrectionRetryCount, initialSpeakA2CorrectionRetryCount, initialSpeakBranchCorrectionRetryCount, sessionKey]);

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

    const canRetryBranchCorrection = useMemo(() => {
        if (isAdmin) return true;
        return branchManualRetryCount < SPEAK_BRANCH_MAX_MANUAL_RETRIES;
    }, [branchManualRetryCount, isAdmin]);

    const remainingBranchManualRetries = useMemo(() => {
        return Math.max(0, SPEAK_BRANCH_MAX_MANUAL_RETRIES - branchManualRetryCount);
    }, [branchManualRetryCount]);

    const branchRetryButtonSuffix = useMemo(() => {
        if (isAdmin) return "(∞)";
        return `(${remainingBranchManualRetries}/${SPEAK_BRANCH_MAX_MANUAL_RETRIES})`;
    }, [isAdmin, remainingBranchManualRetries]);

    const runBranchEvaluation = useCallback(
        async (options?: { isRetry?: boolean }) => {
            if (isEvaluatingBranch) return;
            setIsEvaluatingBranch(true);
            setBranchEvaluationError("");
            try {
                const isRetry = options?.isRetry === true;
                const result = await evaluateMockExamSpeakBranchSection({ compilationId, sessionKey, isRetry });
                if (typeof result?.retryCount === "number") {
                    setBranchManualRetryCount(Math.max(0, result.retryCount));
                }
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
        },
        [compilationId, isEvaluatingBranch, onSpeakA2AnswersEvaluated, sessionKey],
    );

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
        if (inferredBranch !== "B1") {
            return "A1_A2";
        }
        return finalOralPercentage > 80 ? "A2_B1" : "A1_A2";
    }, [finalOralPercentage, inferredBranch]);
    const selectedWrittenCombo: WrittenCombo = useMemo(() => {
        return writtenCombo?.chosen || writtenCombo?.recommended || recommendedWrittenCombo;
    }, [recommendedWrittenCombo, writtenCombo?.chosen, writtenCombo?.recommended]);
    const readWriteTasks = useMemo(() => {
        return selectedWrittenCombo === "A2_B1" ? readWriteA2B1Tasks || [] : readWriteA1A2Tasks || [];
    }, [readWriteA1A2Tasks, readWriteA2B1Tasks, selectedWrittenCombo]);
    const readWriteModulePdfLinks = useMemo(() => {
        return readWriteTasks
            .map((task, index) => {
                const moduleNumber = getReadWriteModuleNumber(String(task.taskType || ""), selectedWrittenCombo) || index + 1;
                const label = `Module ${moduleNumber} • ${String(task.title || "").trim() || String(task.taskType || "")}`;
                const url = withCloudFrontPrefix(String(task.supportPdfUrl || "").trim());
                if (!url) return null;
                return { moduleNumber, label, url };
            })
            .filter(Boolean)
            .sort((a, b) => Number(a?.moduleNumber || 0) - Number(b?.moduleNumber || 0)) as Array<{
            moduleNumber: number;
            label: string;
            url: string;
        }>;
    }, [readWriteTasks, selectedWrittenCombo]);
    const readWriteExpectedTotalMax = useMemo(() => getReadWriteExpectedTotalMax(selectedWrittenCombo), [selectedWrittenCombo]);
    const readWriteFirstPointer = useMemo(() => resolveFirstTaskPointer(readWriteTasks), [readWriteTasks]);
    const readWriteCurrentPointer = useMemo(() => {
        if (resume.state !== "READ_WRITE_RUN") return null;
        return resolvePointerFromResume(readWriteTasks, resume);
    }, [readWriteTasks, resume]);
    const readWriteCurrentTask = readWriteCurrentPointer ? readWriteTasks[readWriteCurrentPointer.taskIndex] : null;
    const readWriteCurrentActivity = readWriteCurrentPointer ? readWriteCurrentTask?.activities?.[readWriteCurrentPointer.activityIndex] : null;
    const readWriteItems = useMemo(() => (Array.isArray(readWriteCurrentActivity?.items) ? readWriteCurrentActivity.items : []), [readWriteCurrentActivity?.items]);
    const readWriteInstructionItem = useMemo(() => readWriteItems.find((item) => isReadWriteInstructionItem(item)), [readWriteItems]);
    const readWriteQuestionItems = useMemo(() => readWriteItems.filter((item) => isReadWriteQuestionItem(item)), [readWriteItems]);

    const [readWriteAnswers, setReadWriteAnswers] = useState<ReadWriteAnswer[]>(Array.isArray(initialReadWriteAnswers) ? initialReadWriteAnswers : []);
    const [isSavingReadWriteAnswer, setIsSavingReadWriteAnswer] = useState(false);
    const [readWriteSaveError, setReadWriteSaveError] = useState("");
    const [readWriteStep, setReadWriteStep] = useState<"SITUATION" | "QUESTION">("SITUATION");
    const [activeReadWriteItemIndex, setActiveReadWriteItemIndex] = useState(0);
    const [readWriteDrafts, setReadWriteDrafts] = useState<Record<string, string>>({});
    const [readWriteVisualMode, setReadWriteVisualMode] = useState<"IMAGE" | "TEXT">("IMAGE");
    const [isReadWritePdfMenuOpen, setIsReadWritePdfMenuOpen] = useState(false);
    const [isReadWriteImageModalOpen, setIsReadWriteImageModalOpen] = useState(false);
    const readWritePdfMenuRef = useRef<HTMLDivElement | null>(null);
    const readWriteAutoNextTimerRef = useRef<number | null>(null);
    const readWriteActivityInitRef = useRef("");

    useEffect(() => {
        setReadWriteAnswers(Array.isArray(initialReadWriteAnswers) ? initialReadWriteAnswers : []);
        setReadWriteSaveError("");
    }, [initialReadWriteAnswers, sessionKey]);

    const readWriteAnswersByKey = useMemo(() => {
        const map = new Map<string, ReadWriteAnswer>();
        for (const answer of readWriteAnswers || []) {
            const taskId = getAnswerTaskId(answer);
            const activityKey = String(answer?.activityKey || "");
            const questionKey = String(answer?.questionKey || "");
            if (!taskId || !activityKey || !questionKey) continue;
            map.set(getReadWriteAnswerKey(taskId, activityKey, questionKey), answer);
        }
        return map;
    }, [readWriteAnswers]);

    const readWriteActivityIdentity = `${readWriteCurrentPointer?.taskId || ""}::${readWriteCurrentPointer?.activityKey || ""}`;

    useEffect(() => {
        setIsReadWriteImageModalOpen(false);
    }, [readWriteActivityIdentity, resume.state]);

    useEffect(() => {
        if (resume.state !== "READ_WRITE_RESULT") {
            setIsReadWritePdfMenuOpen(false);
        }
    }, [resume.state]);

    useOutsideClick(readWritePdfMenuRef, () => {
        setIsReadWritePdfMenuOpen(false);
    });

    useEffect(() => {
        return () => {
            if (readWriteAutoNextTimerRef.current) {
                window.clearTimeout(readWriteAutoNextTimerRef.current);
                readWriteAutoNextTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (readWriteAutoNextTimerRef.current) {
            window.clearTimeout(readWriteAutoNextTimerRef.current);
            readWriteAutoNextTimerRef.current = null;
        }
    }, [readWriteActivityIdentity]);

    useEffect(() => {
        if (!isReadWriteImageModalOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsReadWriteImageModalOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isReadWriteImageModalOpen]);

    useEffect(() => {
        if (resume.state !== "READ_WRITE_RUN") {
            readWriteActivityInitRef.current = "";
            return;
        }
        if (readWriteActivityInitRef.current === readWriteActivityIdentity) return;
        readWriteActivityInitRef.current = readWriteActivityIdentity;

        const instructionIndex = readWriteItems.findIndex((item) => isReadWriteInstructionItem(item));
        const firstQuestionIndex = readWriteItems.findIndex((item) => isReadWriteQuestionItem(item));
        const initialItemIndex = instructionIndex >= 0 ? instructionIndex : firstQuestionIndex >= 0 ? firstQuestionIndex : 0;
        // Always show the activity presentation step (image + situation) for each activity.
        setReadWriteStep("SITUATION");
        setActiveReadWriteItemIndex(initialItemIndex);
        setReadWriteVisualMode("IMAGE");
        setReadWriteSaveError("");

        if (!readWriteCurrentPointer) {
            setReadWriteDrafts({});
            return;
        }

        const nextDrafts: Record<string, string> = {};
        for (const item of readWriteQuestionItems) {
            const questionKey = String(item?._key || "");
            if (!questionKey) continue;
            const answerKey = getReadWriteAnswerKey(readWriteCurrentPointer.taskId, readWriteCurrentPointer.activityKey, questionKey);
            nextDrafts[questionKey] = String(readWriteAnswersByKey.get(answerKey)?.textAnswer || "");
        }
        setReadWriteDrafts(nextDrafts);
    }, [readWriteActivityIdentity, readWriteAnswersByKey, readWriteCurrentPointer, readWriteItems, readWriteQuestionItems, resume.state]);

    const currentReadWriteItem = readWriteItems[activeReadWriteItemIndex];
    const currentReadWriteItemType = String(currentReadWriteItem?.itemType || "");
    const currentReadWriteItemKey = String(currentReadWriteItem?._key || "");
    const isCurrentReadWriteInstructionItem = isReadWriteInstructionItem(currentReadWriteItem);
    const currentReadWriteDraft = currentReadWriteItemKey ? String(readWriteDrafts[currentReadWriteItemKey] || "") : "";
    const currentReadWriteAutoInstruction = getReadWriteAutoInstruction(currentReadWriteItemType);
    const currentReadWriteNumberLabels = useMemo(() => {
        if (!currentReadWriteItem || currentReadWriteItemType !== "numbered_fill") return [] as string[];
        return parseReadWriteNumberList(String(currentReadWriteItem.question || ""));
    }, [currentReadWriteItem, currentReadWriteItemType]);
    const currentReadWriteNumberValues = useMemo(() => parseReadWriteNumberedAnswerDraft(currentReadWriteDraft, currentReadWriteNumberLabels), [currentReadWriteDraft, currentReadWriteNumberLabels]);

    const readWriteTotalQuestions = useMemo(() => {
        return readWriteTasks.reduce((sum, task) => {
            const taskCount = (task.activities || []).reduce((acc, activity) => {
                const items = Array.isArray(activity.items) ? activity.items : [];
                return (
                    acc +
                    items.reduce((itemCount, item) => {
                        if (!isReadWriteQuestionItem(item)) return itemCount;
                        return itemCount + getReadWriteItemQuestionCount(item);
                    }, 0)
                );
            }, 0);
            return sum + taskCount;
        }, 0);
    }, [readWriteTasks]);

    const readWriteAnsweredCount = useMemo(() => {
        let count = 0;
        for (const task of readWriteTasks) {
            for (const activity of task.activities || []) {
                const items = Array.isArray(activity.items) ? activity.items : [];
                for (const item of items) {
                    if (!isReadWriteQuestionItem(item)) continue;
                    const answerKey = getReadWriteAnswerKey(task._id, activity._key, item._key);
                    const answer = readWriteAnswersByKey.get(answerKey);
                    count += Math.min(getReadWriteItemQuestionCount(item), getReadWriteItemAnsweredCount(item, String(answer?.textAnswer || "")));
                }
            }
        }
        return count;
    }, [readWriteAnswersByKey, readWriteTasks]);

    const readWriteCurrentActivityQuestionTotal = useMemo(() => {
        return readWriteQuestionItems.reduce((count, item) => count + getReadWriteItemQuestionCount(item), 0);
    }, [readWriteQuestionItems]);

    const readWriteCurrentActivityAnsweredCount = useMemo(() => {
        return readWriteQuestionItems.reduce((count, item) => {
            const questionKey = String(item?._key || "");
            const draft = String(readWriteDrafts[questionKey] || "");
            return count + Math.min(getReadWriteItemQuestionCount(item), getReadWriteItemAnsweredCount(item, draft));
        }, 0);
    }, [readWriteDrafts, readWriteQuestionItems]);

    const readWriteRemainingInCurrentActivity = useMemo(() => {
        return Math.max(0, readWriteCurrentActivityQuestionTotal - readWriteCurrentActivityAnsweredCount);
    }, [readWriteCurrentActivityAnsweredCount, readWriteCurrentActivityQuestionTotal]);

    const persistCurrentReadWriteActivityAnswers = useCallback(async () => {
        if (!readWriteCurrentPointer) {
            return { ok: false as const, error: "Activité introuvable." };
        }
        if (!readWriteQuestionItems.length) {
            return { ok: true as const };
        }

        setIsSavingReadWriteAnswer(true);
        setReadWriteSaveError("");
        try {
            const updatedAnswers: ReadWriteAnswer[] = [];

            for (const item of readWriteQuestionItems) {
                const questionKey = String(item?._key || "");
                if (!questionKey) continue;

                const normalized = normalizeReadWriteItemAnswer(item, String(readWriteDrafts[questionKey] || ""));
                if (!normalized.complete) {
                    const error = "Merci de compléter toutes les réponses avant de valider la tâche.";
                    setReadWriteSaveError(error);
                    return { ok: false as const, error };
                }
                const textAnswer = normalized.value;

                const answerKey = getReadWriteAnswerKey(readWriteCurrentPointer.taskId, readWriteCurrentPointer.activityKey, questionKey);
                const existingAnswer = readWriteAnswersByKey.get(answerKey);
                if (String(existingAnswer?.textAnswer || "").trim() === textAnswer) {
                    continue;
                }

                const result = await saveMockExamReadWriteAnswer({
                    compilationId,
                    sessionKey,
                    taskId: readWriteCurrentPointer.taskId,
                    activityKey: readWriteCurrentPointer.activityKey,
                    questionKey,
                    textAnswer,
                });
                if (!result?.ok || !result.answer) {
                    const error = result?.error || "Impossible de sauvegarder la réponse.";
                    setReadWriteSaveError(error);
                    return { ok: false as const, error };
                }
                updatedAnswers.push(result.answer);
            }

            if (updatedAnswers.length) {
                setReadWriteAnswers((previous) => {
                    const byKey = new Map(previous.map((item) => [getReadWriteAnswerKey(getAnswerTaskId(item), item.activityKey, String(item.questionKey || "")), item] as const));
                    for (const answer of updatedAnswers) {
                        const answerTaskId = getAnswerTaskId(answer);
                        if (!answerTaskId) continue;
                        byKey.set(getReadWriteAnswerKey(answerTaskId, answer.activityKey, String(answer.questionKey || "")), answer);
                    }
                    return Array.from(byKey.values());
                });
            }

            return { ok: true as const };
        } catch {
            const error = "Erreur inattendue pendant la sauvegarde.";
            setReadWriteSaveError(error);
            return { ok: false as const, error };
        } finally {
            setIsSavingReadWriteAnswer(false);
        }
    }, [compilationId, readWriteAnswersByKey, readWriteCurrentPointer, readWriteDrafts, readWriteQuestionItems, sessionKey]);

    const [isEvaluatingReadWrite, setIsEvaluatingReadWrite] = useState(false);
    const [readWriteEvaluationError, setReadWriteEvaluationError] = useState("");
    const [readWriteEvaluationSummary, setReadWriteEvaluationSummary] = useState<ReadWriteCorrectionSummary | null>(null);
    const [readWriteEvaluationWaitSeconds, setReadWriteEvaluationWaitSeconds] = useState(0);
    const readWriteEvaluationRequestedRef = useRef(false);
    const readWriteResultAccordionInitRef = useRef(false);
    const [openedReadWriteRowId, setOpenedReadWriteRowId] = useState<string | null>(null);

    const readWriteRows = useMemo(() => {
        const rows: Array<{
            rowId: string;
            taskId: string;
            activityKey: string;
            questionKey: string;
            moduleNumber: number;
            moduleTitle: string;
            label: string;
            itemType: string;
            score: number | null;
            max: number;
            feedback: string;
            hasAnswer: boolean;
            isEvaluated: boolean;
            order: string;
        }> = [];

        for (let taskIndex = 0; taskIndex < readWriteTasks.length; taskIndex += 1) {
            const task = readWriteTasks[taskIndex];
            const moduleNumber = getReadWriteModuleNumber(String(task.taskType || ""), selectedWrittenCombo) || taskIndex + 1;

            for (let activityIndex = 0; activityIndex < (task.activities || []).length; activityIndex += 1) {
                const activity = task.activities[activityIndex];
                const activityNumber = (moduleNumber - 1) * 2 + activityIndex + 1;
                const questionItems = (Array.isArray(activity.items) ? activity.items : []).filter((item) => isReadWriteQuestionItem(item));

                for (let questionIndex = 0; questionIndex < questionItems.length; questionIndex += 1) {
                    const item = questionItems[questionIndex];
                    const questionNumber = questionIndex + 1;
                    const questionKey = String(item?._key || "");
                    if (!questionKey) continue;
                    const answerKey = getReadWriteAnswerKey(task._id, activity._key, questionKey);
                    const answer = readWriteAnswersByKey.get(answerKey);
                    const hasAnswer = String(answer?.textAnswer || "").trim().length > 0;
                    const score = typeof answer?.AiScore === "number" ? answer.AiScore : null;
                    const feedback = String(answer?.AiFeedback || "").trim();
                    const isEvaluated = hasAnswer && score !== null && feedback.length > 0;
                    const max = Math.max(1, Math.round(Number(item?.maxPoints || 1)));

                    rows.push({
                        rowId: `${task._id}:${activity._key}:${questionKey}`,
                        taskId: task._id,
                        activityKey: activity._key,
                        questionKey,
                        moduleNumber,
                        moduleTitle: String(task.title || "").trim() || String(task.taskType || ""),
                        label: `Module ${moduleNumber} • Tâche ${activityNumber} • Question ${questionNumber}`,
                        itemType: String(item?.itemType || ""),
                        score,
                        max,
                        feedback,
                        hasAnswer,
                        isEvaluated,
                        order: `${String(taskIndex).padStart(4, "0")}-${String(activityIndex).padStart(4, "0")}-${String(questionIndex).padStart(4, "0")}`,
                    });
                }
            }
        }

        return rows.sort((a, b) => a.order.localeCompare(b.order));
    }, [readWriteAnswersByKey, readWriteTasks, selectedWrittenCombo]);

    const hasPendingReadWriteEvaluation = useMemo(() => {
        return readWriteRows.some((row) => row.hasAnswer && !row.isEvaluated);
    }, [readWriteRows]);

    const readWriteTotalRow = useMemo(() => {
        const evaluated = readWriteRows.filter((row) => row.isEvaluated && row.score !== null);
        return {
            score: evaluated.reduce((sum, row) => sum + Number(row.score || 0), 0),
            max: evaluated.reduce((sum, row) => sum + Number(row.max || 0), 0),
        };
    }, [readWriteRows]);

    const readWriteModuleRows = useMemo(() => {
        const runtimeModules = Array.isArray(readWriteEvaluationSummary?.modules) ? readWriteEvaluationSummary.modules : [];
        if (runtimeModules.length) {
            return runtimeModules
                .map((module) => ({
                    moduleKey: module.moduleKey,
                    moduleNumber: module.moduleNumber,
                    moduleTitle: module.moduleTitle || `Module ${module.moduleNumber}`,
                    score: Number(module.score || 0),
                    max: Math.max(1, Number(module.max || 1)),
                    feedback: String(module.feedback || "").trim() || "Feedback indisponible pour ce module.",
                }))
                .sort((a, b) => a.moduleNumber - b.moduleNumber);
        }

        const grouped = new Map<
            string,
            {
                moduleKey: string;
                moduleNumber: number;
                moduleTitle: string;
                score: number;
                max: number;
                feedbacks: string[];
            }
        >();

        for (const row of readWriteRows) {
            const moduleKey = `${row.taskId}:${row.moduleNumber}`;
            if (!grouped.has(moduleKey)) {
                grouped.set(moduleKey, {
                    moduleKey,
                    moduleNumber: row.moduleNumber,
                    moduleTitle: row.moduleTitle || `Module ${row.moduleNumber}`,
                    score: 0,
                    max: 0,
                    feedbacks: [],
                });
            }
            const bucket = grouped.get(moduleKey)!;
            bucket.score += Number(row.score || 0);
            bucket.max += Number(row.max || 0);
            if (row.feedback) bucket.feedbacks.push(row.feedback);
        }

        return Array.from(grouped.values())
            .map((bucket) => ({
                moduleKey: bucket.moduleKey,
                moduleNumber: bucket.moduleNumber,
                moduleTitle: bucket.moduleTitle,
                score: bucket.score,
                max: Math.max(1, bucket.max),
                feedback:
                    bucket.max > 0
                        ? (() => {
                              const pct = Math.round((bucket.score / Math.max(1, bucket.max)) * 100);
                              if (pct >= 80) return "Très bon module: réponses globalement pertinentes et bien structurées. Continue avec ce niveau de précision.";
                              if (pct >= 60) return "Module solide: bonnes bases. Renforce la précision des informations et la formulation pour gagner encore des points.";
                              if (pct >= 40) return "Module partiellement réussi: plusieurs réponses sont pertinentes, mais la précision reste inégale.";
                              return "Module à retravailler: relis bien la consigne et entraîne-toi à répondre plus directement et précisément.";
                          })()
                        : "Le feedback de module apparaîtra ici après la correction IA.",
            }))
            .sort((a, b) => a.moduleNumber - b.moduleNumber);
    }, [readWriteEvaluationSummary?.modules, readWriteRows]);

    const weakestReadWriteModuleId = useMemo(() => {
        if (!readWriteModuleRows.length) return null;
        const sorted = [...readWriteModuleRows].sort((a, b) => a.score / Math.max(1, a.max) - b.score / Math.max(1, b.max));
        return sorted[0]?.moduleKey || readWriteModuleRows[0]?.moduleKey || null;
    }, [readWriteModuleRows]);

    useEffect(() => {
        if (resume.state !== "READ_WRITE_RESULT") {
            setOpenedReadWriteRowId(null);
            readWriteResultAccordionInitRef.current = false;
            return;
        }
        if (readWriteResultAccordionInitRef.current) return;
        if (weakestReadWriteModuleId) {
            setOpenedReadWriteRowId(weakestReadWriteModuleId);
            readWriteResultAccordionInitRef.current = true;
        }
    }, [resume.state, weakestReadWriteModuleId]);

    const persistedReadWriteGlobalPercentage = useMemo(() => {
        if (typeof initialReadWriteScoreSummary?.percentage !== "number") return null;
        return Math.max(0, Math.min(100, Math.round(initialReadWriteScoreSummary.percentage)));
    }, [initialReadWriteScoreSummary?.percentage]);

    const persistedReadWriteGlobalFeedback = useMemo(() => {
        const raw = String(initialReadWriteScoreSummary?.feedback || "").trim();
        return raw.length > 0 ? raw : null;
    }, [initialReadWriteScoreSummary?.feedback]);

    const readWriteGlobalPercentage = useMemo(() => {
        if (typeof readWriteEvaluationSummary?.globalPercentage === "number") {
            return Math.max(0, Math.min(100, Math.round(readWriteEvaluationSummary.globalPercentage)));
        }
        if (persistedReadWriteGlobalPercentage !== null) {
            return persistedReadWriteGlobalPercentage;
        }
        if (readWriteTotalRow.max <= 0) return 0;
        return Math.max(0, Math.min(100, Math.round((readWriteTotalRow.score / readWriteTotalRow.max) * 100)));
    }, [persistedReadWriteGlobalPercentage, readWriteEvaluationSummary?.globalPercentage, readWriteTotalRow.max, readWriteTotalRow.score]);

    const readWriteGlobalFeedback = useMemo(() => {
        const runtimeFeedback = String(readWriteEvaluationSummary?.globalFeedback || "").trim();
        if (runtimeFeedback) return runtimeFeedback;
        if (persistedReadWriteGlobalFeedback) return persistedReadWriteGlobalFeedback;
        return "Le feedback global apparaîtra ici après l'analyse IA.";
    }, [persistedReadWriteGlobalFeedback, readWriteEvaluationSummary?.globalFeedback]);

    const readWriteValidatedLevel = useMemo(() => {
        const runtimeLevel = String(readWriteEvaluationSummary?.validatedLevel || "").trim();
        if (runtimeLevel) return runtimeLevel;
        return getReadWriteValidatedLevel(selectedWrittenCombo, Number(readWriteTotalRow.score || 0));
    }, [readWriteEvaluationSummary?.validatedLevel, readWriteTotalRow.score, selectedWrittenCombo]);

    const readWriteGlobalLevelLabel = useMemo(() => {
        if (readWriteGlobalPercentage >= 80) return "Très bon niveau";
        if (readWriteGlobalPercentage >= 60) return "Bon niveau";
        if (readWriteGlobalPercentage >= 40) return "À renforcer";
        return "À travailler";
    }, [readWriteGlobalPercentage]);

    const readWriteGlobalGaugePrimaryColor = useMemo(() => {
        if (readWriteGlobalPercentage < 30) return "var(--secondary-4)";
        if (readWriteGlobalPercentage <= 70) return "var(--secondary-1)";
        return "var(--secondary-5)";
    }, [readWriteGlobalPercentage]);

    const readWriteEvaluationWaitLabel = useMemo(() => {
        if (readWriteEvaluationWaitSeconds < 10) return "Analyse IA en cours...";
        if (readWriteEvaluationWaitSeconds < 25) return "L'IA finalise la correction détaillée...";
        return "Le traitement prend un peu de temps, merci de patienter.";
    }, [readWriteEvaluationWaitSeconds]);

    const canRetryReadWriteCorrection = useMemo(() => {
        if (isAdmin) return true;
        return readWriteManualRetryCount < READ_WRITE_MAX_MANUAL_RETRIES;
    }, [isAdmin, readWriteManualRetryCount]);

    const remainingReadWriteManualRetries = useMemo(() => {
        return Math.max(0, READ_WRITE_MAX_MANUAL_RETRIES - readWriteManualRetryCount);
    }, [readWriteManualRetryCount]);

    const readWriteRetryButtonSuffix = useMemo(() => {
        if (isAdmin) return "(∞)";
        return `(${remainingReadWriteManualRetries}/${READ_WRITE_MAX_MANUAL_RETRIES})`;
    }, [isAdmin, remainingReadWriteManualRetries]);

    const runReadWriteEvaluation = useCallback(
        async (options?: { isRetry?: boolean }) => {
            if (isEvaluatingReadWrite) return;
            setIsEvaluatingReadWrite(true);
            setReadWriteEvaluationError("");
            try {
                const isRetry = options?.isRetry === true;
                const result = await evaluateMockExamReadWriteSection({ compilationId, sessionKey, isRetry });
                if (typeof result?.retryCount === "number") {
                    setReadWriteManualRetryCount(Math.max(0, result.retryCount));
                }
                if (!result?.ok) {
                    setReadWriteEvaluationError(result?.error || "Correction IA impossible.");
                    return;
                }
                setReadWriteAnswers(Array.isArray(result.answers) ? result.answers : []);
                setReadWriteEvaluationSummary(result.summary || null);
            } catch {
                setReadWriteEvaluationError("Erreur inattendue pendant la correction IA.");
            } finally {
                setIsEvaluatingReadWrite(false);
            }
        },
        [compilationId, isEvaluatingReadWrite, sessionKey],
    );

    useEffect(() => {
        if (resume.state !== "READ_WRITE_RESULT") {
            readWriteEvaluationRequestedRef.current = false;
            return;
        }
        if (readWriteEvaluationRequestedRef.current || isEvaluatingReadWrite || !hasPendingReadWriteEvaluation) {
            return;
        }
        readWriteEvaluationRequestedRef.current = true;
        void runReadWriteEvaluation();
    }, [hasPendingReadWriteEvaluation, isEvaluatingReadWrite, resume.state, runReadWriteEvaluation]);

    useEffect(() => {
        if (!isEvaluatingReadWrite) {
            setReadWriteEvaluationWaitSeconds(0);
            return;
        }
        setReadWriteEvaluationWaitSeconds(0);
        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
            setReadWriteEvaluationWaitSeconds(elapsed);
        }, 1000);
        return () => {
            window.clearInterval(interval);
        };
    }, [isEvaluatingReadWrite]);

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
    const [finalDetailsOpenKey, setFinalDetailsOpenKey] = useState<"ORAL" | "LISTENING" | "READ_WRITE" | null>("ORAL");
    const [isHumanFeedbackModalOpen, setIsHumanFeedbackModalOpen] = useState(false);
    const [isFeedbackCalendlyOpen, setIsFeedbackCalendlyOpen] = useState(false);
    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (resume.state !== ORAL_SECTION_SUMMARY) return;
        setOralDetailsTab("A2");
    }, [resume.state]);

    useEffect(() => {
        if (resume.state !== EXAM_FINAL_SUMMARY) {
            setFinalDetailsOpenKey("ORAL");
            setIsHumanFeedbackModalOpen(false);
            setIsFeedbackCalendlyOpen(false);
            finalizationRequestedRef.current = false;
        }
    }, [resume.state]);

    useEffect(() => {
        if (resume.state !== EXAM_FINAL_SUMMARY) return;
        if (finalizationRequestedRef.current) return;
        finalizationRequestedRef.current = true;

        void fetch("/api/mock-exams/session/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ compilationId, sessionKey }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                    throw new Error(payload?.error || "Finalisation impossible.");
                }
            })
            .catch((error) => {
                console.error("[MockExam] Finalisation session en erreur", error);
                finalizationRequestedRef.current = false;
            });
    }, [compilationId, resume.state, sessionKey]);

    useEffect(() => {
        setRootElement(document.getElementById("root") || document.body);
    }, []);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (!isFeedbackCalendlyOpen) return;

            try {
                const host = new URL(event.origin).hostname;
                if (!host.endsWith("calendly.com")) return;
            } catch {
                return;
            }

            const data = event.data as { event?: string; payload?: { event?: { uri?: string } } } | null;
            if (!data || data.event !== "calendly.event_scheduled") return;
            const eventUri = String(data.payload?.event?.uri || "").trim();
            if (!eventUri) return;

            setIsFeedbackCalendlyOpen(false);

            const qs = new URLSearchParams();
            qs.set("event_uri", eventUri);
            qs.set("continue_url", "/fide/dashboard");
            qs.set("session_key", sessionKey);
            qs.set("compilation_id", compilationId);
            router.push(`/rdv-success/your-exam-feedback?${qs.toString()}`);
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [compilationId, isFeedbackCalendlyOpen, router, sessionKey]);

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
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0 overflow-y-auto`}>
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

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,270px)_minmax(0,1fr)]">
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

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,270px)_minmax(0,1fr)]">
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
                        disabled={isEvaluatingBranch || !canRetryBranchCorrection}
                        onClick={async () => {
                            branchEvaluationRequestedRef.current = true;
                            await runBranchEvaluation({ isRetry: true });
                        }}
                    >
                        {isEvaluatingBranch
                            ? `Correction en cours... ${branchRetryButtonSuffix}`
                            : !canRetryBranchCorrection
                              ? `Relances IA épuisées ${branchRetryButtonSuffix}`
                              : `Relancer la correction IA ${branchRetryButtonSuffix}`}
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

    if (resume.state === "READ_WRITE_INTRO") {
        const selectedLabel = selectedWrittenCombo === "A2_B1" ? "A2-B1" : "A1-A2";
        if (!readWriteTasks.length) {
            return (
                <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0`}>
                    <div className="flex flex-col gap-3">
                        <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">Lire/Écrire</p>
                        <h1 className="display-2 font-medium mb-0">Aucune tâche disponible</h1>
                        <p className="mb-0 text-neutral-700">Aucun module n’est configuré pour le parcours {selectedLabel}.</p>
                    </div>
                    <div className="mt-auto pb-3 md:pb-5 flex flex-wrap justify-end gap-3">
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "READ_WRITE_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </section>
            );
        }

        return (
            <section className={`flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Lire/Écrire</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Parcours {selectedLabel}</h1>
                        <p className="mb-0 text-sm text-neutral-600">
                            Tu vas réaliser <span className="font-semibold">{readWriteTasks.length}</span> module{readWriteTasks.length > 1 ? "s" : ""}, avec 2 tâches par module.
                        </p>
                        <p className="mb-0 mt-2 text-sm text-neutral-600">Commence quand tu es prêt. Tes réponses sont enregistrées question par question.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {readWriteIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={readWriteIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() => onAdvance({ nextState: "READ_WRITE_RUN", taskId: readWriteFirstPointer?.taskId, activityKey: readWriteFirstPointer?.activityKey })}
                            disabled={isAdvancing || !readWriteFirstPointer}
                        >
                            {isAdvancing ? "Chargement..." : "Commencer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "READ_WRITE_RUN") {
        if (!readWriteCurrentPointer || !readWriteCurrentTask || !readWriteCurrentActivity) {
            return (
                <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0`}>
                    <div className="flex flex-col gap-3">
                        <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">Lire/Écrire</p>
                        <h1 className="display-2 font-medium mb-0">Activité introuvable</h1>
                        <p className="mb-0 text-neutral-700">Impossible de retrouver la tâche en cours.</p>
                    </div>
                    <div className="mt-auto pb-3 md:pb-5 flex flex-wrap justify-end gap-3">
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "READ_WRITE_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Chargement..." : "Continuer"}
                        </button>
                    </div>
                </section>
            );
        }

        const isSituationStep = readWriteStep === "SITUATION";
        const moduleLabel = readWriteCurrentTask.title || readWriteCurrentTask.taskType;
        const readWriteModuleNumber = getReadWriteModuleNumber(String(readWriteCurrentTask.taskType || ""), selectedWrittenCombo);
        const displayedModuleNumber = readWriteModuleNumber || readWriteCurrentPointer.taskIndex + 1;
        const readWriteGlobalTaskNumber = (displayedModuleNumber - 1) * 2 + readWriteCurrentPointer.activityIndex + 1;
        const activityTitle = String(readWriteCurrentActivity.title || "").trim() || `Tâche ${readWriteGlobalTaskNumber}`;
        const supportPdfUrl = String(readWriteCurrentTask.supportPdfUrl || "").trim();
        const supportPdfHref = supportPdfUrl ? withCloudFrontPrefix(supportPdfUrl) : "";

        const activeVisualItem = isSituationStep ? undefined : currentReadWriteItem || readWriteInstructionItem || readWriteItems[0];
        const activeItemHasOwnImage = hasUsableImageAsset(activeVisualItem?.image as { asset?: { _ref?: string; _id?: string } } | null | undefined);
        const activeItemHasOwnText = Boolean(activeVisualItem?.imageAlternativeText);
        const instructionHasImage = hasUsableImageAsset(readWriteInstructionItem?.image as { asset?: { _ref?: string; _id?: string } } | null | undefined);
        const instructionHasText = Boolean(readWriteInstructionItem?.imageAlternativeText);
        const activityHasImage = hasUsableImageAsset(readWriteCurrentActivity.image as { asset?: { _ref?: string; _id?: string } } | null | undefined);
        const itemHasOwnSupport = activeItemHasOwnImage || activeItemHasOwnText;
        const instructionHasSupport = instructionHasImage || instructionHasText;
        const activeVisualImage = isSituationStep
            ? activityHasImage
                ? readWriteCurrentActivity.image
                : undefined
            : activeItemHasOwnText && !activeItemHasOwnImage
              ? undefined
              : activeItemHasOwnImage
                ? activeVisualItem?.image
                : instructionHasImage
                  ? readWriteInstructionItem?.image
                  : !itemHasOwnSupport && !instructionHasSupport && activityHasImage
                    ? readWriteCurrentActivity.image
                    : undefined;
        const activeVisualImageUrl = activeVisualImage ? urlFor(activeVisualImage).width(1800).fit("max").url() : null;
        const activeVisualText = isSituationStep
            ? undefined
            : activeItemHasOwnText
              ? activeVisualItem?.imageAlternativeText
              : activeItemHasOwnImage
                ? undefined
                : instructionHasText
                  ? readWriteInstructionItem?.imageAlternativeText
                  : undefined;
        const hasVisualImage = Boolean(activeVisualImageUrl);
        const hasVisualText = Boolean(activeVisualText);
        const effectiveVisualMode = readWriteVisualMode === "TEXT" && hasVisualText ? "TEXT" : hasVisualImage ? "IMAGE" : hasVisualText ? "TEXT" : "IMAGE";
        const hasQuestionItems = readWriteQuestionItems.length > 0;
        const questionIndexByKey = new Map(readWriteQuestionItems.map((item, index) => [String(item?._key || ""), index + 1] as const));
        const hasPreviousItem = activeReadWriteItemIndex > 0;
        const hasNextItem = activeReadWriteItemIndex < readWriteItems.length - 1;

        const goToNextActivityOrResult = async () => {
            const nextPointer = resolveNextPointer(readWriteTasks, readWriteCurrentPointer);
            if (nextPointer) {
                await onAdvance({ nextState: "READ_WRITE_RUN", taskId: nextPointer.taskId, activityKey: nextPointer.activityKey });
                return;
            }
            await onAdvance({ nextState: "READ_WRITE_RESULT" });
        };

        const onValidateCurrentActivity = async () => {
            setReadWriteSaveError("");
            if (readWriteRemainingInCurrentActivity > 0) {
                setReadWriteSaveError(`Questions renseignées: ${readWriteCurrentActivityAnsweredCount}/${readWriteCurrentActivityQuestionTotal}. Complète toutes les réponses avant de valider.`);
                return;
            }
            const saveResult = await persistCurrentReadWriteActivityAnswers();
            if (!saveResult.ok) return;
            await goToNextActivityOrResult();
        };

        const onContinueFromSituation = async () => {
            if (!hasQuestionItems) {
                await goToNextActivityOrResult();
                return;
            }
            const instructionIndex = readWriteItems.findIndex((item) => isReadWriteInstructionItem(item));
            const firstQuestionIndex = readWriteItems.findIndex((item) => isReadWriteQuestionItem(item));
            const initialItemIndex = instructionIndex >= 0 ? instructionIndex : firstQuestionIndex >= 0 ? firstQuestionIndex : 0;
            setActiveReadWriteItemIndex(initialItemIndex);
            setReadWriteStep("QUESTION");
        };

        return (
            <section
                className={`w-full h-auto lg:h-full min-h-0 ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.25fr)] px-2 pt-0`}
            >
                <aside className="flex h-auto lg:h-full min-h-0 flex-col gap-4">
                    <div className="flex items-end justify-between gap-3 py-1">
                        <div className="min-w-0 flex flex-col justify-end">
                            <p className="mb-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600 shrink-0">Module {displayedModuleNumber}</p>
                            <h2 className="mb-0 text-lg md:text-xl font-semibold text-neutral-900 truncate">{moduleLabel}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isSituationStep && hasVisualText ? (
                                <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center p-0 text-neutral-800 transition hover:text-secondary-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    onClick={() => setReadWriteVisualMode((previous) => (previous === "IMAGE" ? "TEXT" : "IMAGE"))}
                                    disabled={!hasVisualImage || !hasVisualText}
                                    aria-label={effectiveVisualMode === "IMAGE" ? "Afficher le texte" : "Afficher l'image"}
                                    title={effectiveVisualMode === "IMAGE" ? "Afficher le texte" : "Afficher l'image"}
                                >
                                    {effectiveVisualMode === "IMAGE" ? <FaRegFileAlt className="text-lg" /> : <FaImage className="text-lg" />}
                                </button>
                            ) : null}
                            {supportPdfHref ? (
                                <Link
                                    href={supportPdfHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-1 py-0 text-sm font-semibold text-neutral-800 transition hover:text-secondary-2"
                                >
                                    <FaRegEye className="shrink-0" />
                                    PDF
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-solid border-neutral-600 bg-neutral-100 overflow-hidden">
                        <div className="flex min-w-0 items-center justify-center overflow-hidden bg-neutral-50">
                            {effectiveVisualMode === "IMAGE" && hasVisualImage ? (
                                <button
                                    type="button"
                                    className="block w-full cursor-zoom-in p-0"
                                    onClick={() => setIsReadWriteImageModalOpen(true)}
                                    aria-label="Agrandir l'image"
                                    title="Agrandir l'image"
                                >
                                    <Image src={activeVisualImageUrl as string} alt="Illustration tâche" width={1800} height={1200} className="h-auto max-h-[58vh] w-full object-contain" />
                                </button>
                            ) : hasVisualText ? (
                                <div className="w-full max-h-[58vh] overflow-y-auto p-3 md:p-4">
                                    <div className="prose prose-sm max-w-none w-full min-w-0 text-[0.92rem] leading-relaxed text-neutral-800 break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                        <PortableText value={activeVisualText as any} components={RichTextComponents()} />
                                    </div>
                                </div>
                            ) : hasVisualImage ? (
                                <button
                                    type="button"
                                    className="block w-full cursor-zoom-in p-0"
                                    onClick={() => setIsReadWriteImageModalOpen(true)}
                                    aria-label="Agrandir l'image"
                                    title="Agrandir l'image"
                                >
                                    <Image src={activeVisualImageUrl as string} alt="Illustration tâche" width={1800} height={1200} className="h-auto max-h-[58vh] w-full object-contain" />
                                </button>
                            ) : (
                                <div className="min-h-[180px] px-6 py-8 text-center text-sm text-neutral-700">Aucun support visuel pour cet élément.</div>
                            )}
                        </div>
                    </div>
                </aside>

                <div className="flex min-h-0 lg:h-full flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-start lg:justify-end gap-2 py-1">
                            <p className="mb-0 text-xs font-semibold uppercase tracking-wide text-neutral-600 shrink-0">Tâche {readWriteGlobalTaskNumber}</p>
                            <p className="mb-0 text-base md:text-lg font-semibold text-neutral-900 truncate text-left lg:text-right">{activityTitle}</p>
                        </div>
                        {!isSituationStep ? (
                            <div className="flex flex-wrap justify-start lg:justify-end gap-2">
                                {readWriteItems.map((item, index) => {
                                    const itemKey = String(item?._key || index);
                                    const isActive = index === activeReadWriteItemIndex;
                                    const isInstruction = isReadWriteInstructionItem(item);
                                    const questionKey = String(item?._key || "");
                                    const questionNumber = questionIndexByKey.get(questionKey) || index + 1;
                                    const answered = isInstruction || normalizeReadWriteItemAnswer(item, String(readWriteDrafts[questionKey] || "")).complete;
                                    return (
                                        <button
                                            type="button"
                                            key={itemKey}
                                            className={clsx(
                                                "rounded-full border border-solid px-3 py-1 text-xs font-semibold transition",
                                                isActive
                                                    ? "border-secondary-2 bg-secondary-2 text-neutral-100"
                                                    : answered
                                                      ? "border-secondary-2 bg-neutral-100 text-secondary-2"
                                                      : "border-neutral-400 bg-neutral-100 text-neutral-700 hover:border-neutral-600",
                                            )}
                                            onClick={() => {
                                                setActiveReadWriteItemIndex(index);
                                                setReadWriteSaveError("");
                                            }}
                                            disabled={isSavingReadWriteAnswer || isAdvancing}
                                        >
                                            {getReadWriteItemTabLabel(item, questionNumber)}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                    {isSituationStep ? (
                        <div className="rounded-2xl border border-solid border-neutral-600 p-4 md:p-5 flex-1 min-h-0 overflow-hidden flex flex-col gap-5">
                            {readWriteCurrentActivity.promptText ? (
                                <div className="max-w-none min-h-0 flex-1 overflow-y-auto pr-1 text-neutral-800">
                                    <PortableText value={readWriteCurrentActivity.promptText as any} components={RichTextComponents()} />
                                </div>
                            ) : (
                                <p className="mb-0 text-neutral-700">Lis la consigne générale puis continue.</p>
                            )}
                            <div className="mt-auto flex justify-end">
                                <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => void onContinueFromSituation()} disabled={isAdvancing || isSavingReadWriteAnswer}>
                                    {isAdvancing ? "Chargement..." : hasQuestionItems ? "Continuer vers la tâche" : "Continuer"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-2xl border border-solid border-neutral-600 p-4 md:p-5 flex-1 min-h-0 overflow-hidden flex flex-col">
                                {!currentReadWriteItem ? (
                                    <div className="h-full min-h-0 flex-1 flex items-center">
                                        <p className="mb-0 text-neutral-700">Aucun élément configuré pour cette tâche.</p>
                                    </div>
                                ) : isCurrentReadWriteInstructionItem ? (
                                    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                                        <p className="mb-0 text-xs uppercase tracking-wide text-neutral-600">Consigne</p>
                                        {currentReadWriteItem.contentText ? (
                                            <div className="max-w-none text-neutral-800">
                                                <PortableText value={currentReadWriteItem.contentText as any} components={RichTextComponents()} />
                                            </div>
                                        ) : (
                                            <p className="mb-0 text-neutral-700">Ajoute la consigne de cette tâche dans le studio Sanity.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
                                        <div className="min-h-0 flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                                            {currentReadWriteAutoInstruction ? <p className="mb-0 text-sm font-semibold text-neutral-700">{currentReadWriteAutoInstruction}</p> : null}

                                            {currentReadWriteItem.contentText ? (
                                                <div className={clsx("max-w-none text-sm", ["single_choice", "text_extract"].includes(currentReadWriteItemType) && "font-bold text-secondary-2")}>
                                                    <PortableText value={currentReadWriteItem.contentText as any} components={RichTextComponents()} />
                                                </div>
                                            ) : null}

                                            {currentReadWriteItemType === "single_choice" && String(currentReadWriteItem.question || "").trim() ? (
                                                <p className="mb-0 text-base font-bold text-secondary-2">{String(currentReadWriteItem.question || "").trim()}</p>
                                            ) : null}

                                            {currentReadWriteItemType !== "single_choice" &&
                                            String(currentReadWriteItem.question || "").trim() &&
                                            currentReadWriteItemType !== "numbered_fill" &&
                                            currentReadWriteItemType !== "long_text" ? (
                                                <p className="mb-0 text-base font-bold text-secondary-2">{String(currentReadWriteItem.question || "").trim()}</p>
                                            ) : null}

                                            {currentReadWriteItemType === "single_choice" ? (
                                                <div className="flex flex-col gap-2 -mt-2">
                                                    {(currentReadWriteItem.answerOptions || []).map((optionRaw, optionIndex) => {
                                                        const option = optionRaw as { _key?: string; label?: string } | string;
                                                        const normalized = (typeof option === "string" ? option : String(option?.label || "")).trim();
                                                        if (!normalized) return null;
                                                        const checked = currentReadWriteDraft === normalized;
                                                        const optionKey = typeof option === "string" ? `${normalized}-${optionIndex}` : String(option?._key || normalized || optionIndex);
                                                        return (
                                                            <label key={optionKey} className="flex items-center gap-2 px-1 py-1 text-sm text-neutral-800 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={(event) => {
                                                                        const isChecked = event.target.checked;
                                                                        setReadWriteDrafts((previous) => ({
                                                                            ...previous,
                                                                            [currentReadWriteItemKey]: isChecked ? normalized : "",
                                                                        }));
                                                                        if (isChecked && hasNextItem) {
                                                                            setReadWriteSaveError("");
                                                                            if (readWriteAutoNextTimerRef.current) {
                                                                                window.clearTimeout(readWriteAutoNextTimerRef.current);
                                                                            }
                                                                            readWriteAutoNextTimerRef.current = window.setTimeout(() => {
                                                                                setActiveReadWriteItemIndex((previous) => Math.min(previous + 1, readWriteItems.length - 1));
                                                                                readWriteAutoNextTimerRef.current = null;
                                                                            }, READ_WRITE_AUTO_NEXT_DELAY_MS);
                                                                        }
                                                                    }}
                                                                    className="h-4 w-4 cursor-pointer"
                                                                />
                                                                <span>{normalized}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}

                                            {currentReadWriteItemType === "numbered_fill" &&
                                                (currentReadWriteNumberLabels.length > 1 ? (
                                                    <div className="flex flex-col gap-3">
                                                        {currentReadWriteNumberLabels.map((number) => (
                                                            <div key={number} className="flex items-start gap-3">
                                                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-xs font-semibold text-neutral-100">
                                                                    {number}
                                                                </div>
                                                                <textarea
                                                                    value={String(currentReadWriteNumberValues[number] || "")}
                                                                    onChange={(event) =>
                                                                        setReadWriteDrafts((previous) => {
                                                                            const prevDraft = String(previous[currentReadWriteItemKey] || "");
                                                                            const nextValues = parseReadWriteNumberedAnswerDraft(prevDraft, currentReadWriteNumberLabels);
                                                                            nextValues[number] = event.target.value;
                                                                            return {
                                                                                ...previous,
                                                                                [currentReadWriteItemKey]: buildReadWriteNumberedDraft(currentReadWriteNumberLabels, nextValues),
                                                                            };
                                                                        })
                                                                    }
                                                                    rows={2}
                                                                    className="w-full rounded-xl border border-solid border-neutral-300 bg-neutral-100 p-2.5 text-sm text-neutral-900 leading-snug outline-none resize-none focus:border-secondary-2"
                                                                    placeholder={`Réponse pour le numéro ${number}...`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-xs font-semibold text-neutral-100">
                                                            {currentReadWriteNumberLabels[0] || String(currentReadWriteItem.question || "").trim() || "?"}
                                                        </div>
                                                        <textarea
                                                            value={currentReadWriteDraft}
                                                            onChange={(event) =>
                                                                setReadWriteDrafts((previous) => ({
                                                                    ...previous,
                                                                    [currentReadWriteItemKey]: event.target.value,
                                                                }))
                                                            }
                                                            rows={2}
                                                            className="w-full rounded-xl border border-solid border-neutral-300 bg-neutral-100 p-2.5 text-sm text-neutral-900 leading-snug outline-none resize-none focus:border-secondary-2"
                                                            placeholder="Écrivez votre réponse..."
                                                        />
                                                    </div>
                                                ))}

                                            {currentReadWriteItemType === "text_extract" ? (
                                                <textarea
                                                    value={currentReadWriteDraft}
                                                    onChange={(event) =>
                                                        setReadWriteDrafts((previous) => ({
                                                            ...previous,
                                                            [currentReadWriteItemKey]: event.target.value,
                                                        }))
                                                    }
                                                    rows={4}
                                                    className="w-full rounded-xl border border-solid border-neutral-300 bg-neutral-100 p-2.5 text-sm text-neutral-900 leading-snug outline-none resize-none focus:border-secondary-2"
                                                    placeholder="Copie ou colle ici le passage du texte correspondant..."
                                                />
                                            ) : null}

                                            {currentReadWriteItemType === "long_text" ? (
                                                <textarea
                                                    value={currentReadWriteDraft}
                                                    onChange={(event) =>
                                                        setReadWriteDrafts((previous) => ({
                                                            ...previous,
                                                            [currentReadWriteItemKey]: event.target.value,
                                                        }))
                                                    }
                                                    rows={10}
                                                    className="w-full rounded-xl border border-solid border-neutral-300 bg-neutral-100 p-2.5 text-sm text-neutral-900 leading-snug outline-none focus:border-secondary-2"
                                                    placeholder="Écrivez votre réponse..."
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                                {readWriteItems.length > 1 ? (
                                    <div className="mt-3 flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-solid border-neutral-400 bg-neutral-100 text-neutral-800 transition hover:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                            onClick={() => {
                                                setReadWriteSaveError("");
                                                setActiveReadWriteItemIndex((previous) => Math.max(previous - 1, 0));
                                            }}
                                            disabled={isSavingReadWriteAnswer || isAdvancing || !hasPreviousItem}
                                            aria-label="Tab précédent"
                                            title="Tab précédent"
                                        >
                                            <FaArrowLeft className="text-sm" />
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-solid border-neutral-400 bg-neutral-100 text-neutral-800 transition hover:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                            onClick={() => {
                                                setReadWriteSaveError("");
                                                setActiveReadWriteItemIndex((previous) => Math.min(previous + 1, readWriteItems.length - 1));
                                            }}
                                            disabled={isSavingReadWriteAnswer || isAdvancing || !hasNextItem}
                                            aria-label="Tab suivant"
                                            title="Tab suivant"
                                        >
                                            <FaArrowRight className="text-sm" />
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            {readWriteSaveError ? <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{readWriteSaveError}</div> : null}

                            <div className="mt-auto pb-3 md:pb-5 flex flex-wrap items-center justify-between gap-3">
                                <p className="mb-0 text-sm text-neutral-700">
                                    Questions renseignées:{" "}
                                    <span className="font-semibold text-neutral-900">
                                        {readWriteCurrentActivityAnsweredCount}/{readWriteCurrentActivityQuestionTotal}
                                    </span>
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-primary small min-w-[220px]"
                                    onClick={() => void onValidateCurrentActivity()}
                                    disabled={isAdvancing || isSavingReadWriteAnswer || readWriteRemainingInCurrentActivity > 0}
                                >
                                    {isSavingReadWriteAnswer ? "Sauvegarde..." : "Valider la tâche"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <AnimatePresence>
                    {isReadWriteImageModalOpen && hasVisualImage ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-3 md:items-center md:p-6"
                            style={{ backgroundColor: "rgba(23, 23, 23, 0.9)" }}
                            onClick={() => setIsReadWriteImageModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.97, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.97, opacity: 0 }}
                                transition={TRANSITION}
                                className="w-full max-w-[1600px] rounded-2xl bg-neutral-100 p-3 md:p-4"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div className="mb-2 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-lg border border-solid border-neutral-400 bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-600"
                                        onClick={() => setIsReadWriteImageModalOpen(false)}
                                    >
                                        Fermer
                                    </button>
                                </div>
                                <div className="flex max-h-[calc(100vh-120px)] items-center justify-center overflow-hidden rounded-xl bg-neutral-50">
                                    <Image
                                        src={activeVisualImageUrl as string}
                                        alt="Agrandissement illustration tâche"
                                        width={2200}
                                        height={1600}
                                        className="h-auto max-h-[calc(100vh-160px)] w-auto max-w-full object-contain"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </section>
        );
    }

    if (resume.state === "READ_WRITE_RESULT") {
        const comboLabel = selectedWrittenCombo === "A2_B1" ? "A2-B1" : "A1-A2";
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0`}>
                <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">RÉSULTAT</p>
                    <h1 className="display-2 font-medium mb-0">Lire/Écrire terminé</h1>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="mb-0 text-neutral-700">Parcours {comboLabel}. Vérifie les points détaillés et le feedback IA.</p>
                        {readWriteModulePdfLinks.length ? (
                            <div className="relative" ref={readWritePdfMenuRef}>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-1 py-0 text-sm font-semibold text-neutral-800 transition hover:text-secondary-2"
                                    onClick={() => setIsReadWritePdfMenuOpen((previous) => !previous)}
                                    aria-expanded={isReadWritePdfMenuOpen}
                                    aria-haspopup="menu"
                                >
                                    <FaRegEye className="shrink-0" />
                                    PDF modules
                                </button>
                                <AnimatePresence initial={false}>
                                    {isReadWritePdfMenuOpen ? (
                                        <motion.div
                                            key="read-write-pdf-menu"
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.16, ease: "easeOut" }}
                                            className="absolute right-0 z-20 mt-2 min-w-[280px] rounded-xl border border-solid border-neutral-300 bg-neutral-100 p-2 shadow-1"
                                        >
                                            <ul className="mb-0 flex list-none flex-col gap-1 p-0">
                                                {readWriteModulePdfLinks.map((item) => (
                                                    <li key={`${item.moduleNumber}-${item.url}`}>
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noreferrer noopener"
                                                            className="block rounded-lg px-3 py-2 text-sm text-neutral-800 transition hover:bg-neutral-200 hover:text-secondary-2 !no-underline"
                                                            onClick={() => setIsReadWritePdfMenuOpen(false)}
                                                        >
                                                            {item.label}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        ) : null}
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {isEvaluatingReadWrite ? (
                        <motion.div
                            key="evaluating-read-write"
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
                                        <p className="mb-0 text-sm font-semibold text-neutral-800">{readWriteEvaluationWaitLabel}</p>
                                        <p className="mb-0 text-xs text-neutral-600">Temps d'attente: {readWriteEvaluationWaitSeconds}s</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {readWriteEvaluationError ? <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{readWriteEvaluationError}</div> : null}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
                    <aside className="rounded-2xl border border-solid border-neutral-600 shadow-1 p-4 md:p-5 flex flex-col items-center gap-4">
                        <CircularProgressMagic
                            max={100}
                            min={0}
                            value={readWriteGlobalPercentage}
                            gaugePrimaryColor={readWriteGlobalGaugePrimaryColor}
                            gaugeSecondaryColor="var(--neutral-300)"
                            className="h-40 w-40"
                            withSize={false}
                            fontHeight="text-4xl"
                        />
                        <p className="mb-0 text-xs uppercase tracking-wide text-neutral-600">Global</p>
                        <p className="mb-0 rounded-full border border-solid border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-700">{readWriteGlobalLevelLabel}</p>
                        <p className="mb-0 text-sm text-neutral-700 text-center">{readWriteGlobalFeedback}</p>
                        <div className="w-full rounded-xl border border-solid border-neutral-300 p-3">
                            <div className="grid grid-cols-2 items-end gap-3">
                                <div>
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Points totaux</p>
                                    <p className="mb-0 text-2xl font-semibold leading-none text-neutral-900">
                                        {readWriteTotalRow.score}/{readWriteExpectedTotalMax}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Niveau atteint</p>
                                    <p className={clsx("mb-0 text-2xl font-semibold leading-none text-neutral-900", readWriteValidatedLevel === "Aucun" && "text-neutral-400")}>
                                        {readWriteValidatedLevel}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex flex-col gap-3">
                        {readWriteModuleRows.map((moduleRow) => {
                            const modulePercentage = Math.round((Number(moduleRow.score || 0) / Math.max(1, Number(moduleRow.max || 1))) * 100);
                            const isOpen = openedReadWriteRowId === moduleRow.moduleKey;
                            const moduleGaugeColor =
                                moduleRow.score / Math.max(1, moduleRow.max) < 0.35
                                    ? "var(--secondary-4)"
                                    : moduleRow.score / Math.max(1, moduleRow.max) < 0.7
                                      ? "var(--secondary-1)"
                                      : "var(--secondary-5)";

                            return (
                                <article key={moduleRow.moduleKey} className="rounded-2xl border border-solid border-neutral-600 p-4">
                                    <button
                                        type="button"
                                        className="w-full text-left"
                                        onClick={() => setOpenedReadWriteRowId((previous) => (previous === moduleRow.moduleKey ? null : moduleRow.moduleKey))}
                                        aria-expanded={isOpen}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="mb-0 font-semibold text-neutral-800">{`Module ${moduleRow.moduleNumber} • ${moduleRow.moduleTitle}`}</p>
                                            <p className="mb-0 text-sm font-semibold text-neutral-800">{`${moduleRow.score}/${moduleRow.max}`}</p>
                                        </div>
                                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${modulePercentage}%`, backgroundColor: moduleGaugeColor }} />
                                        </div>
                                        <p className="mt-2 mb-0 text-xs text-neutral-600">{`${modulePercentage}%`}</p>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen ? (
                                            <motion.div
                                                key={`read-write-feedback-${moduleRow.moduleKey}`}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22, ease: "easeOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-3 rounded-xl border border-solid border-neutral-300 bg-neutral-200 p-3">
                                                    <p className="mb-0 text-sm text-neutral-700">{moduleRow.feedback || "Aucun feedback disponible pour l'instant."}</p>
                                                </div>
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto pb-3 md:pb-5 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        className="btn btn-secondary small min-w-[220px]"
                        onClick={() => void runReadWriteEvaluation({ isRetry: true })}
                        disabled={isEvaluatingReadWrite || !canRetryReadWriteCorrection}
                    >
                        {isEvaluatingReadWrite
                            ? `Correction en cours... ${readWriteRetryButtonSuffix}`
                            : !canRetryReadWriteCorrection
                              ? `Relances IA épuisées ${readWriteRetryButtonSuffix}`
                              : `Relancer la correction IA ${readWriteRetryButtonSuffix}`}
                    </button>
                    <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: EXAM_FINAL_SUMMARY })} disabled={isAdvancing || isEvaluatingReadWrite}>
                        {isAdvancing ? "Chargement..." : "Terminer"}
                    </button>
                </div>
            </section>
        );
    }

    if (resume.state === EXAM_FINAL_SUMMARY) {
        const oralPathLabel = inferredBranch === "B1" ? "A2/B1" : "A1/A2";
        const readWritePathLabel = selectedWrittenCombo === "A2_B1" ? "A2-B1" : "A1-A2";
        const oralGaugeColor = finalOralPercentage < 30 ? "var(--secondary-4)" : finalOralPercentage <= 70 ? "var(--secondary-1)" : "var(--secondary-5)";
        const readWriteGaugeColor = readWriteGlobalPercentage < 30 ? "var(--secondary-4)" : readWriteGlobalPercentage <= 70 ? "var(--secondary-1)" : "var(--secondary-5)";
        const levelRank = (level?: string) => {
            const normalized = String(level || "")
                .trim()
                .toUpperCase();
            if (normalized === "B1") return 3;
            if (normalized === "A2") return 2;
            if (normalized === "A1") return 1;
            return 0;
        };
        const oralLevelRank = levelRank(validatedLevelCode);
        const readWriteLevelRank = levelRank(readWriteValidatedLevel);
        const weakestDimension = oralLevelRank <= readWriteLevelRank ? "oral" : "lire/écrire";
        const isFeedbackRecommended = true;
        const isPackRecommended = false;
        const isPrivateRecommended = false;
        const branchPointsMax = inferredBranch === "B1" ? 24 : 8;

        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-6 px-2 pt-0`}>
                <div className="flex flex-col gap-2">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">BILAN FINAL</p>
                    <h1 className="display-2 font-medium mb-0">Résultats de l'examen blanc</h1>
                    <p className="mb-0 text-sm text-neutral-600">Tu as maintenant deux niveaux validés: un pour la partie orale et un pour la partie Lire/Écrire.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <article className="overflow-hidden rounded-2xl border border-solid border-neutral-600 p-4 md:p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="mb-0 text-lg uppercase tracking-wide text-neutral-600">Partie orale</p>
                                    <p className="mb-0 text-sm text-neutral-700">Parcours {oralPathLabel}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <CircularProgressMagic
                                        max={100}
                                        min={0}
                                        value={finalOralPercentage}
                                        gaugePrimaryColor={oralGaugeColor}
                                        gaugeSecondaryColor="var(--neutral-300)"
                                        className="h-24 w-24"
                                        withSize={false}
                                        fontHeight="text-xl"
                                    />
                                    <div className="flex flex-col gap-1 text-sm text-neutral-700">
                                        <p className="mb-0">
                                            <span className="font-semibold text-neutral-900">Parler:</span> {speakCompositeRow.score}/{speakCompositeRow.max}
                                        </p>
                                        <p className="mb-0">
                                            <span className="font-semibold text-neutral-900">Comprendre:</span> {listeningTotalRow.score}/{18}
                                        </p>
                                        <p className="mb-0">
                                            <span className="font-semibold text-neutral-900">Pourcentage oral:</span> {finalOralPercentage}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex h-full w-full items-center justify-center">
                                <div className="text-center">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">Niveau atteint</p>
                                    <p
                                        className={clsx(
                                            "mb-0 text-[5.1rem] font-semibold leading-none tracking-tight text-neutral-900 md:text-[6.4rem]",
                                            validatedLevelCode === "Aucun" && "text-neutral-400",
                                        )}
                                    >
                                        {validatedLevelCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 mb-0 text-sm text-neutral-700">{finalOralFeedback}</p>
                    </article>

                    <article className="relative overflow-hidden rounded-2xl border border-solid border-neutral-600 p-4 md:p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="mb-0 text-lg uppercase tracking-wide text-neutral-600">Lire/Écrire</p>
                                    <p className="mb-0 text-sm text-neutral-700">Parcours {readWritePathLabel}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <CircularProgressMagic
                                        max={100}
                                        min={0}
                                        value={readWriteGlobalPercentage}
                                        gaugePrimaryColor={readWriteGaugeColor}
                                        gaugeSecondaryColor="var(--neutral-300)"
                                        className="h-24 w-24"
                                        withSize={false}
                                        fontHeight="text-xl"
                                    />
                                    <div className="flex flex-col gap-1 text-sm text-neutral-700">
                                        <p className="mb-0">
                                            <span className="font-semibold text-neutral-900">Points:</span> {readWriteTotalRow.score}/{readWriteExpectedTotalMax}
                                        </p>
                                        <p className="mb-0">
                                            <span className="font-semibold text-neutral-900">Pourcentage:</span> {readWriteGlobalPercentage}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex h-full w-full items-center justify-center">
                                <div className="text-center">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">Niveau atteint</p>
                                    <p
                                        className={clsx(
                                            "mb-0 text-[5.1rem] font-semibold leading-none tracking-tight text-neutral-900 md:text-[6.4rem]",
                                            readWriteValidatedLevel === "Aucun" && "text-neutral-400",
                                        )}
                                    >
                                        {readWriteValidatedLevel}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 mb-0 text-sm text-neutral-700">{readWriteGlobalFeedback}</p>
                    </article>
                </div>

                <div className="rounded-2xl border border-solid border-neutral-600 p-4 md:p-5">
                    <p className="mb-3 text-xs uppercase tracking-wide text-neutral-600">Détails consultables</p>
                    <div className="flex flex-col gap-3">
                        <article className="rounded-xl border border-solid border-neutral-300 p-3">
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={() => setFinalDetailsOpenKey((previous) => (previous === "ORAL" ? null : "ORAL"))}
                                aria-expanded={finalDetailsOpenKey === "ORAL"}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="mb-0 text-sm font-semibold text-neutral-800">Oral: Parler + branche</p>
                                    <p className="mb-0 text-sm font-semibold text-neutral-800">
                                        {Number(totalRow.score || 0) + Number(branchTotalRow.score || 0)}/{18 + branchPointsMax}
                                    </p>
                                </div>
                            </button>
                            <AnimatePresence initial={false}>
                                {finalDetailsOpenKey === "ORAL" ? (
                                    <motion.div
                                        key="final-details-oral"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22, ease: "easeOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 grid grid-cols-1 gap-3">
                                            <div className="rounded-lg border border-solid border-neutral-300 p-3">
                                                <p className="mb-2 text-xs uppercase tracking-wide text-neutral-600">Parler A2</p>
                                                <div className="flex flex-col gap-2">
                                                    {taskRows.map((row) => (
                                                        <div key={row.taskId} className="flex items-center justify-between gap-2 text-sm text-neutral-700">
                                                            <span className="truncate">{row.label}</span>
                                                            <span className="font-semibold text-neutral-900">
                                                                {row.score ?? 0}/{row.max}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-solid border-neutral-300 p-3">
                                                <p className="mb-2 text-xs uppercase tracking-wide text-neutral-600">Parler {inferredBranch}</p>
                                                <div className="flex flex-col gap-2">
                                                    {branchRows.length ? (
                                                        branchRows.map((row) => (
                                                            <div key={row.rowId} className="flex items-center justify-between gap-2 text-sm text-neutral-700">
                                                                <span className="truncate">{row.label}</span>
                                                                <span className="font-semibold text-neutral-900">
                                                                    {row.score ?? 0}/{row.max}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="mb-0 text-sm text-neutral-600">Aucune donnée enregistrée.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </article>

                        <article className="rounded-xl border border-solid border-neutral-300 p-3">
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={() => setFinalDetailsOpenKey((previous) => (previous === "LISTENING" ? null : "LISTENING"))}
                                aria-expanded={finalDetailsOpenKey === "LISTENING"}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="mb-0 text-sm font-semibold text-neutral-800">Comprendre</p>
                                    <p className="mb-0 text-sm font-semibold text-neutral-800">
                                        {listeningTotalRow.score}/{18}
                                    </p>
                                </div>
                            </button>
                            <AnimatePresence initial={false}>
                                {finalDetailsOpenKey === "LISTENING" ? (
                                    <motion.div
                                        key="final-details-listening"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22, ease: "easeOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 flex flex-col gap-2">
                                            {listeningRowsDetailed.map((row) => (
                                                <div key={row.scenario._id} className="flex items-center justify-between gap-2 text-sm text-neutral-700">
                                                    <span className="truncate">
                                                        Scénario {row.index + 1} {row.level ? `- ${row.level}` : ""}
                                                    </span>
                                                    <span className="font-semibold text-neutral-900">
                                                        {row.weightedScore}/{row.weightedMax}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </article>

                        <article className="rounded-xl border border-solid border-neutral-300 p-3">
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={() => setFinalDetailsOpenKey((previous) => (previous === "READ_WRITE" ? null : "READ_WRITE"))}
                                aria-expanded={finalDetailsOpenKey === "READ_WRITE"}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="mb-0 text-sm font-semibold text-neutral-800">Lire/Écrire</p>
                                    <p className="mb-0 text-sm font-semibold text-neutral-800">
                                        {readWriteTotalRow.score}/{readWriteExpectedTotalMax}
                                    </p>
                                </div>
                            </button>
                            <AnimatePresence initial={false}>
                                {finalDetailsOpenKey === "READ_WRITE" ? (
                                    <motion.div
                                        key="final-details-read-write"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22, ease: "easeOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 flex flex-col gap-2">
                                            {readWriteModuleRows.map((module) => (
                                                <div key={module.moduleKey} className="flex items-center justify-between gap-2 text-sm text-neutral-700">
                                                    <p className="mb-0">{`Module ${module.moduleNumber} • ${module.moduleTitle}`}</p>
                                                    <p className="mb-0 font-semibold text-neutral-900">
                                                        {module.score}/{module.max}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </article>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl p-4 md:p-6" style={{ background: "linear-gradient(130deg, var(--neutral-200) 0%, var(--neutral-100) 56%, #dceedd 100%)" }}>
                    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:gap-6">
                        <div className="min-w-0">
                            <div className="mb-2 inline-flex items-center rounded-full bg-secondary-5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">
                                Feedback professeur gratuit
                            </div>
                            <h2 className="mb-2 text-2xl font-semibold text-neutral-900">Pour aller plus loin</h2>
                            <p className="mb-0 text-sm text-neutral-700">Demandez un feedback gratuit sur votre examen par un professeur FIDE expérimenté.</p>
                            <p className="mt-2 mb-0 text-sm text-neutral-700">
                                Axe prioritaire actuel: <span className="font-semibold text-neutral-900">{weakestDimension}</span>.
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <ShimmerButton type="button" className="min-w-[260px] small" onClick={() => setIsHumanFeedbackModalOpen(true)}>
                                    Obtenir mon feedback gratuit
                                </ShimmerButton>
                                <Link href="/fide/dashboard" className="btn btn-secondary small min-w-[220px]">
                                    Retour au dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="mx-auto w-full max-w-[170px] md:mx-0 md:max-w-[220px]">
                            <Image
                                src="/images/yoh-coussot.png"
                                alt="Professeur Start French Now"
                                width={220}
                                height={220}
                                className="h-auto w-full object-contain rounded-full border border-solid border-neutral-700"
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isHumanFeedbackModalOpen ? (
                        <motion.div
                            key="human-feedback-modal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6"
                            style={{ backgroundColor: "rgba(23, 23, 23, 0.82)" }}
                            onClick={() => setIsHumanFeedbackModalOpen(false)}
                        >
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 8, opacity: 0 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                className="my-3 h-max max-h-[92vh] w-full max-w-[920px] overflow-y-auto rounded-2xl border border-solid border-neutral-600 bg-neutral-100 p-4 md:my-0 md:max-h-[88vh] md:p-6"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Accompagnement recommandé</p>
                                        <h3 className="mb-0 text-xl font-semibold text-neutral-900">Transforme tes résultats en plan de progression</h3>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-lg border border-solid border-neutral-400 bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-600"
                                        onClick={() => setIsHumanFeedbackModalOpen(false)}
                                    >
                                        Fermer
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <article
                                        className={clsx("flex h-full flex-col rounded-xl border border-solid p-3", isFeedbackRecommended ? "border-secondary-2 bg-neutral-200" : "border-neutral-300")}
                                    >
                                        <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Feedback Professionnel</p>
                                        <p className="mb-0 text-sm font-semibold text-neutral-900">Entretien professeur + plan d'évolution</p>
                                        <p className="mt-2 mb-0 text-sm text-neutral-700">Analyse les audios et écrits de l'examen pour identifier tes points forts et axes d'amélioration.</p>
                                        {isFeedbackRecommended ? <p className="mt-2 mb-0 text-xs font-semibold uppercase tracking-wide text-secondary-2">Recommandé</p> : null}
                                        <div className="mt-auto pt-3">
                                            <button
                                                type="button"
                                                className="inline-flex w-full items-center justify-center rounded-lg bg-secondary-5 px-3 py-2 text-sm font-semibold text-neutral-100 transition hover:brightness-95 no-underline"
                                                onClick={() => {
                                                    setIsFeedbackCalendlyOpen(true);
                                                    setIsHumanFeedbackModalOpen(false);
                                                }}
                                            >
                                                FEEDBACK GRATUIT
                                            </button>
                                        </div>
                                    </article>

                                    <article
                                        className={clsx("flex h-full flex-col rounded-xl border border-solid p-3", isPackRecommended ? "border-secondary-2 bg-neutral-200" : "border-neutral-300")}
                                    >
                                        <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Pack FIDE</p>
                                        <p className="mb-0 text-sm font-semibold text-neutral-900">Programme complet d'entraînement</p>
                                        <p className="mt-2 mb-0 text-sm text-neutral-700">Scénarios, examens blancs et contenus structurés pour un entraînement régulier.</p>
                                        {isPackRecommended ? <p className="mt-2 mb-0 text-xs font-semibold uppercase tracking-wide text-secondary-2">Recommandé</p> : null}
                                        <div className="mt-auto pt-3">
                                            <Link
                                                href="/fide"
                                                className="inline-flex w-full items-center justify-center rounded-lg border border-solid border-neutral-500 bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-700 no-underline"
                                                onClick={() => setIsHumanFeedbackModalOpen(false)}
                                            >
                                                Voir le Pack FIDE
                                            </Link>
                                        </div>
                                    </article>

                                    <article
                                        className={clsx("flex h-full flex-col rounded-xl border border-solid p-3", isPrivateRecommended ? "border-secondary-2 bg-neutral-200" : "border-neutral-300")}
                                    >
                                        <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">Cours privés</p>
                                        <p className="mb-0 text-sm font-semibold text-neutral-900">Coaching 1:1 intensif</p>
                                        <p className="mt-2 mb-0 text-sm text-neutral-700">Accompagnement premium ciblé pour accélérer la montée en niveau.</p>
                                        {isPrivateRecommended ? <p className="mt-2 mb-0 text-xs font-semibold uppercase tracking-wide text-secondary-2">Recommandé</p> : null}
                                        <div className="mt-auto pt-3">
                                            <Link
                                                href="/fide/dashboard"
                                                className="inline-flex w-full items-center justify-center rounded-lg border border-solid border-neutral-500 bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-700 no-underline"
                                                onClick={() => setIsHumanFeedbackModalOpen(false)}
                                            >
                                                Découvrir le coaching
                                            </Link>
                                        </div>
                                    </article>
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                {rootElement ? (
                    <PopupModal
                        url="https://calendly.com/yohann-startfrenchnow/your-exam-feedback"
                        onModalClose={() => setIsFeedbackCalendlyOpen(false)}
                        open={isFeedbackCalendlyOpen}
                        rootElement={rootElement}
                    />
                ) : null}
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
