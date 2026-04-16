"use server";

import { v4 as uuidv4 } from "uuid";
import { groq } from "next-sanity";
import { redirect } from "next/navigation";
import { requireSessionAndMockExam } from "@/app/components/auth/requireSession";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import clientOpenai from "@/app/lib/openAi.client";
import { MOCK_EXAM_COMPILATION_QUERY, MOCK_EXAM_TASKS_BY_IDS_QUERY, MOCK_EXAM_USER_COMPILATIONS_QUERY, USER_MOCK_EXAM_CREDITS_QUERY } from "@/app/lib/groqQueries";
import { appendSystemNotification } from "@/app/lib/systemNotifications";
import { transporterNico } from "@/app/lib/nodemailer";
import { buildBravoCouponMailMessage, buildBravoCouponSystemNotification } from "@/app/lib/couponMessages";
import { getAnswerTaskId } from "@/app/types/fide/mock-exam";
import type { Image } from "@/app/types/sfn/blog";
import type {
    ExamCorrectionContent,
    ListeningScenarioResult,
    MockExamConfigRef,
    OralBranch,
    ReadWriteAnswer,
    ResumePointer,
    ScoreSummary,
    SessionStatus,
    SpeakingAnswer,
    WrittenCombo,
} from "@/app/types/fide/mock-exam";
import type { Exam } from "@/app/types/fide/exam";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";
import {
    buildReadWriteCorrectionPrompt,
    buildReadWriteSingleChoiceActivityPrompt,
    buildReadWriteTextExtractActivityPrompt,
    buildDiscussionB1PerQuestionPrompt,
    buildSpeakingA2CorrectionPrompt,
    type ReadWriteCorrectionQuestionType,
    type SpeakingA2CorrectionTaskType,
    type SpeakingCorrectionTaskType,
} from "@/app/[locale]/(mock-exam)/mock-exams/[compilationId]/runner/correction-prompt";

export type MockExamSessionLite = {
    _id: string;
    status: SessionStatus;
    startedAt: string;
    resume?: ResumePointer;
    oralBranch?: { recommended?: OralBranch; chosen?: OralBranch };
    writtenCombo?: { recommended: WrittenCombo; chosen?: WrittenCombo };
    speakA2Answers?: SpeakingAnswer[];
    speakBranchAnswers?: SpeakingAnswer[];
    listeningScenarioResults?: ListeningScenarioResult[];
    readWriteAnswers?: ReadWriteAnswer[];
    speakA2CorrectionRetryCount?: number;
    speakBranchCorrectionRetryCount?: number;
    readWriteCorrectionRetryCount?: number;
    scores?: {
        speakA2?: ScoreSummary;
        speakBranch?: ScoreSummary;
        listening?: ScoreSummary;
        readWrite?: ScoreSummary;
        total?: ScoreSummary;
    };
};

export type ExamCompilationLite = {
    _id: string;
    name?: string;
    isActive?: boolean;
    order?: number;
    image?: Image;
    corrections?: ExamCorrectionContent[];
    _createdAt?: string;
    _updatedAt?: string;
    examConfig?: MockExamConfigRef;
    session?: MockExamSessionLite[];
};

export type UserMockExamCredit = {
    _key?: string;
    referenceKey: string;
    totalCredits?: number;
    remainingCredits?: number;
} | null;

export type MockExamCheckoutEligibility = {
    canCheckout: boolean;
    reason: "hasCredit" | "noTemplates" | null;
    remainingCredits: number;
    availableToPurchase: number;
};

type ActiveCompilationLite = {
    _id: string;
    order?: number | null;
};

type SessionWithCompilationId = MockExamSessionLite & { compilationId?: string };

type SessionDocument = {
    _id: string;
    userRef?: { _ref?: string };
    compilationRef?: { _ref?: string };
    status: SessionStatus;
    startedAt: string;
    resume?: ResumePointer;
    oralBranch?: { recommended?: OralBranch; chosen?: OralBranch };
    writtenCombo?: { recommended: WrittenCombo; chosen?: WrittenCombo };
    speakA2Answers?: SpeakingAnswer[];
    speakBranchAnswers?: SpeakingAnswer[];
    listeningScenarioResults?: ListeningScenarioResult[];
    readWriteAnswers?: ReadWriteAnswer[];
    speakA2CorrectionRetryCount?: number;
    speakBranchCorrectionRetryCount?: number;
    readWriteCorrectionRetryCount?: number;
    overtimeTaskRefs?: Array<{ _ref?: string; _type?: "reference" }>;
    scores?: {
        speakA2?: ScoreSummary;
        speakBranch?: ScoreSummary;
        listening?: ScoreSummary;
        readWrite?: ScoreSummary;
        total?: ScoreSummary;
    };
};

type UserCompilationEntry = {
    _key?: string;
    compilationId?: string;
    sessionIds?: string[];
};

const DEFAULT_ORAL_BRANCH: { recommended?: OralBranch; chosen?: OralBranch } = {};

const DEFAULT_WRITTEN_COMBO: { recommended: WrittenCombo; chosen?: WrittenCombo } = {
    recommended: "A1_A2",
};

const toRef = (id: string) => ({ _type: "reference" as const, _ref: id });
const SPEAK_A2_CORRECTION_MODEL = process.env.OPENAI_CORRECTION_MODEL_MOCK_EXAM || process.env.OPENAI_CORRECTION_MODEL || "gpt-5-mini";
const SPEAK_A2_CORRECTION_TIMEOUT_MS = Number(process.env.OPENAI_CORRECTION_TIMEOUT_MS || 60000);
const SPEAK_A2_CORRECTION_FALLBACK_MODEL = process.env.OPENAI_CORRECTION_FALLBACK_MODEL || "gpt-4o-mini";
const READ_WRITE_GENERIC_BATCH_SIZE = Math.max(1, Number(process.env.OPENAI_READ_WRITE_BATCH_SIZE || 8));
const READ_WRITE_SINGLE_CHOICE_ACTIVITY_BATCH_SIZE = Math.max(1, Number(process.env.OPENAI_READ_WRITE_SINGLE_CHOICE_BATCH_SIZE || 3));
const READ_WRITE_TEXT_EXTRACT_ACTIVITY_BATCH_SIZE = Math.max(1, Number(process.env.OPENAI_READ_WRITE_TEXT_EXTRACT_BATCH_SIZE || 3));
const SPEAK_A2_MAX_MANUAL_RETRIES = 3;
const SPEAK_BRANCH_MAX_MANUAL_RETRIES = 3;
const READ_WRITE_MAX_MANUAL_RETRIES = 3;
const SPEAK_A2_SUPPORTED_TASK_TYPES = new Set<SpeakingA2CorrectionTaskType>(["IMAGE_DESCRIPTION_A2", "PHONE_CONVERSATION_A2", "DISCUSSION_A2"]);
const SPEAK_BRANCH_SUPPORTED_TASK_TYPES = new Set<Extract<SpeakingCorrectionTaskType, "IMAGE_DESCRIPTION_A1_T1" | "IMAGE_DESCRIPTION_A1_T2" | "DISCUSSION_B1">>([
    "IMAGE_DESCRIPTION_A1_T1",
    "IMAGE_DESCRIPTION_A1_T2",
    "DISCUSSION_B1",
]);

export type SpeakA2CorrectionTaskResult = {
    taskId: string;
    taskType: string;
    score: number;
    max: number;
    feedback: string;
    error?: string;
    activityKey?: string;
    label?: string;
};

export type SpeakA2CorrectionSummary = {
    tasks: SpeakA2CorrectionTaskResult[];
    total: {
        score: number;
        max: number;
    };
    globalFeedback: string;
    globalPercentage: number;
};

export type SpeakBranchCorrectionSummary = SpeakA2CorrectionSummary;

export type ReadWriteCorrectionQuestionResult = {
    rowId: string;
    taskId: string;
    activityKey: string;
    questionKey: string;
    taskType: string;
    itemType: string;
    moduleNumber: number;
    moduleTitle: string;
    activityNumber: number;
    questionNumber: number;
    label: string;
    questionText?: string;
    studentAnswer?: string;
    score: number;
    max: number;
    feedback: string;
    error?: string;
};

export type ReadWriteCorrectionModuleResult = {
    moduleKey: string;
    taskId: string;
    taskType: string;
    moduleNumber: number;
    moduleTitle: string;
    score: number;
    max: number;
    feedback: string;
};

export type ReadWriteCorrectionSummary = {
    writtenCombo: WrittenCombo;
    modules: ReadWriteCorrectionModuleResult[];
    rows: ReadWriteCorrectionQuestionResult[];
    total: {
        score: number;
        max: number;
    };
    globalFeedback: string;
    globalPercentage: number;
    validatedLevel: "Aucun" | "A1" | "A2" | "B1";
};

const toPortableTextPlain = (value: unknown) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (!Array.isArray(value)) return "";

    return value
        .map((block) => {
            if (!block || typeof block !== "object") return "";
            const maybeText = (block as { text?: unknown }).text;
            if (typeof maybeText === "string") return maybeText.trim();

            const children = (block as { children?: unknown }).children;
            if (!Array.isArray(children)) return "";
            return children
                .map((child) => {
                    if (!child || typeof child !== "object") return "";
                    const text = (child as { text?: unknown }).text;
                    return typeof text === "string" ? text : "";
                })
                .join("")
                .trim();
        })
        .filter(Boolean)
        .join("\n")
        .trim();
};

const parseJsonFromModelOutput = (raw: string) => {
    const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    try {
        return JSON.parse(cleaned) as { scores?: unknown; score?: unknown; feedback?: unknown };
    } catch {
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as { scores?: unknown; score?: unknown; feedback?: unknown };
        }
        throw new Error("JSON invalide retourné par le modèle.");
    }
};

const clampTaskScore = (value: unknown) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    const rounded = Math.round(parsed * 2) / 2;
    return Math.max(0, Math.min(6, rounded));
};

const clampTaskScoreWithMax = (value: unknown, max: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    const rounded = Math.round(parsed * 2) / 2;
    return Math.max(0, Math.min(max, rounded));
};

const clampIntegerScoreWithMax = (value: unknown, max: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    const rounded = Math.round(parsed);
    return Math.max(0, Math.min(max, rounded));
};

const clampPercentage = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
};

const toScoreSummaryOrUndefined = (value: unknown): ScoreSummary | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const rawPercentage = Number((value as { percentage?: unknown }).percentage);
    const feedback = String((value as { feedback?: unknown }).feedback || "").trim();
    if (!Number.isFinite(rawPercentage) || !feedback) return undefined;
    return {
        percentage: clampPercentage(rawPercentage),
        feedback,
    };
};

const sanitizeSessionScores = (scores: SessionDocument["scores"] | null | undefined): NonNullable<SessionDocument["scores"]> => {
    const next: NonNullable<SessionDocument["scores"]> = {};
    const speakA2 = toScoreSummaryOrUndefined(scores?.speakA2);
    const speakBranch = toScoreSummaryOrUndefined(scores?.speakBranch);
    const listening = toScoreSummaryOrUndefined(scores?.listening);
    const readWrite = toScoreSummaryOrUndefined(scores?.readWrite);
    const total = toScoreSummaryOrUndefined(scores?.total);

    if (speakA2) next.speakA2 = speakA2;
    if (speakBranch) next.speakBranch = speakBranch;
    if (listening) next.listening = listening;
    if (readWrite) next.readWrite = readWrite;
    if (total) next.total = total;

    return next;
};

const clampListeningScenarioScore = (value: unknown, max = 3) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    const rounded = Math.round(parsed * 2) / 2;
    return Math.max(0, Math.min(max, rounded));
};

const buildListeningSummaryFeedback = (percentage: number) => {
    if (percentage >= 80) return "Très bonne compréhension globale. Bravo !";
    if (percentage >= 60) return "Bonne compréhension d'ensemble. Travaille encore la précision sur certains détails.";
    if (percentage >= 40) return "Compréhension partielle. Reprends les consignes et les informations essentielles.";
    return "Compréhension encore fragile. Entraîne-toi sur des scénarios progressifs et la prise d'indices.";
};

const detectListeningExamLevel = (exam?: Exam): "A1" | "A2" | "B1" | null => {
    const levels = Array.isArray(exam?.levels) ? exam?.levels : [];
    if (levels.includes("B1")) return "B1";
    if (levels.includes("A2")) return "A2";
    if (levels.includes("A1")) return "A1";
    return null;
};

const getListeningScenarioCoefficient = (branch: OralBranch, scenarioLevel: "A1" | "A2" | "B1" | null) => {
    if (branch === "A1") {
        return scenarioLevel === "A2" ? 2 : 1;
    }
    return scenarioLevel === "B1" ? 2 : 1;
};

const isReadWriteQuestionType = (value: unknown): value is ReadWriteCorrectionQuestionType => {
    return value === "single_choice" || value === "numbered_fill" || value === "text_extract" || value === "long_text";
};

const parseReadWriteNumberList = (raw: string) => {
    const seen = new Set<string>();
    return String(raw || "")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => /^\d+$/.test(item))
        .filter((item) => {
            if (seen.has(item)) return false;
            seen.add(item);
            return true;
        });
};

const parseNumberedStudentAnswer = (rawAnswer: string, numbers: string[]) => {
    const answer = String(rawAnswer || "");
    const byNumber: Record<string, string> = Object.fromEntries(numbers.map((number) => [number, ""]));
    if (!numbers.length) {
        return byNumber;
    }

    const lines = answer
        .split("\n")
        .map((line) => line.replace(/\r$/, ""))
        .filter(Boolean);

    for (const line of lines) {
        const match = line.match(/^(\d+)\s*[:\-]\s*(.*)$/);
        if (!match) continue;
        const number = match[1];
        if (!numbers.includes(number)) continue;
        byNumber[number] = String(match[2] || "").trim();
    }

    if (numbers.length === 1 && !String(byNumber[numbers[0]] || "").trim() && answer.trim()) {
        byNumber[numbers[0]] = answer.trim();
    }

    return byNumber;
};

const buildReadWriteValidatedLevel = (writtenCombo: WrittenCombo, totalScore: number): "Aucun" | "A1" | "A2" | "B1" => {
    const safeScore = Number.isFinite(totalScore) ? totalScore : 0;
    if (writtenCombo === "A1_A2") {
        if (safeScore >= 35) return "A2";
        if (safeScore >= 15) return "A1";
        return "Aucun";
    }
    if (safeScore >= 44) return "B1";
    if (safeScore >= 20) return "A2";
    return "Aucun";
};

const getReadWriteModuleNumber = (taskType: string, combo: WrittenCombo): number => {
    if (taskType === "READ_WRITE_M1") return 1;
    if (taskType === "READ_WRITE_M2") return 2;
    if (taskType === "READ_WRITE_M3_M4") return combo === "A2_B1" ? 4 : 3;
    if (taskType === "READ_WRITE_M5") return 5;
    if (taskType === "READ_WRITE_M6") return 6;
    return 0;
};

const buildMockExamTotalScoreSummary = (params: {
    scores: NonNullable<SessionDocument["scores"]>;
    oralBranch: OralBranch;
    readWritePercentage: number;
}): ScoreSummary | undefined => {
    const speakA2Percentage = Number(params.scores.speakA2?.percentage);
    const speakBranchPercentage = Number(params.scores.speakBranch?.percentage);
    const listeningPercentage = Number(params.scores.listening?.percentage);
    const readWritePercentage = Number(params.readWritePercentage);
    if (![speakA2Percentage, speakBranchPercentage, listeningPercentage, readWritePercentage].every((value) => Number.isFinite(value))) {
        return undefined;
    }

    const branchMax = params.oralBranch === "B1" ? 24 : 8;
    const normalizedSpeakA2 = clampPercentage(speakA2Percentage);
    const normalizedSpeakBranch = clampPercentage(speakBranchPercentage);
    const normalizedListening = clampPercentage(listeningPercentage);
    const normalizedReadWrite = clampPercentage(readWritePercentage);

    const speakA2Score = (normalizedSpeakA2 / 100) * 18;
    const speakBranchScore = (normalizedSpeakBranch / 100) * branchMax;
    const oralCompositeMax = 18 + branchMax;
    const oralCompositePercentage = oralCompositeMax > 0 ? clampPercentage(((speakA2Score + speakBranchScore) / oralCompositeMax) * 100) : 0;
    const oralFinalPercentage = clampPercentage(oralCompositePercentage * (2 / 3) + normalizedListening * (1 / 3));
    const totalPercentage = clampPercentage((oralFinalPercentage + normalizedReadWrite) / 2);

    return {
        percentage: totalPercentage,
        feedback: `Total calculé automatiquement : oral ${oralFinalPercentage}% et lire/écrire ${normalizedReadWrite}%.`,
    };
};

const buildSectionMiniFeedbackPrompt = (sectionLabel: string, transcriptions: string[]) => `
Tu es examinateur FIDE.
Rédige un mini feedback global (2-3 phrases, maximum 60 mots) pour la section "${sectionLabel}".
Contraintes:
- Français uniquement.
- Ton bienveillant et concret.
- Basé uniquement sur la transcription texte ci-dessous.
- Ne pas parler de prononciation, accent, intonation, débit.

Transcriptions:
${transcriptions.map((line, index) => `${index + 1}. ${String(line || "").trim() || "(vide)"}`).join("\n")}
`;

const requestMiniSectionFeedback = async (sectionLabel: string, transcriptions: string[]) => {
    const payload = transcriptions.map((item) => String(item || "").trim()).filter(Boolean);
    if (!payload.length) {
        return `Aucune donnée exploitable pour ${sectionLabel}.`;
    }
    const models = Array.from(new Set([SPEAK_A2_CORRECTION_MODEL, SPEAK_A2_CORRECTION_FALLBACK_MODEL].filter(Boolean)));
    for (const model of models) {
        try {
            const completion = await clientOpenai.chat.completions.create(
                {
                    model,
                    messages: [{ role: "user", content: buildSectionMiniFeedbackPrompt(sectionLabel, payload) }],
                },
                { timeout: SPEAK_A2_CORRECTION_TIMEOUT_MS },
            );
            const content = String(completion.choices?.[0]?.message?.content || "").trim();
            if (content) return content;
        } catch (error) {
            console.error("Mini feedback IA échoué", { sectionLabel, model, error });
        }
    }
    return `Feedback global indisponible pour ${sectionLabel}.`;
};

const buildReadWriteModuleFeedbackPrompt = (params: { moduleLabel: string; score: number; max: number; rows: ReadWriteCorrectionQuestionResult[] }) => {
    const truncate = (value: string, maxLength: number) => {
        const text = String(value || "").trim();
        if (text.length <= maxLength) return text;
        return `${text.slice(0, maxLength).trim()}…`;
    };
    const detailBlock = params.rows
        .map((row) => {
            const question = truncate(String(row.questionText || "").trim(), 220) || "(question non renseignée)";
            const answer = truncate(String(row.studentAnswer || "").trim(), 280) || "(réponse vide)";
            return [`- Sujet de question: ${question}`, `- Score: ${row.score}/${row.max}`, `- Réponse élève: ${answer}`].join("\n");
        })
        .join("\n\n");

    return `
Tu es examinateur FIDE, section Lire/Écrire.
Rédige un feedback global de module en français (40 mots max), utile et actionnable.

Module: ${params.moduleLabel}
Score module: ${params.score}/${params.max}

Contraintes:
- Ton clair, bienveillant, et synthétique.
- Feedback vraiment GLOBAL: qualité générale des réponses, précision, compréhension de consigne, formulation.
- Interdit: enchaîner des micro-jugements du type "Bonne réponse ... / Réponse incorrecte ...".
- Interdit: lister les questions, écrire "question 1/2/3", ou faire un corrigé question par question.
- Si tu cites un exemple, formule-le de manière sémantique ("sur la question sur ..."), sans numéro.
- Priorités d'entraînement concrètes, max 1 à 2 idées.
- Si le module est globalement réussi, un message bref de validation est suffisant.
- Ne pas inventer.

Données:
${detailBlock || "(Aucune donnée exploitable.)"}
`.trim();
};

const requestReadWriteModuleFeedback = async (params: { moduleLabel: string; score: number; max: number; rows: ReadWriteCorrectionQuestionResult[] }) => {
    if (!params.rows.length) {
        return "Aucune réponse exploitable pour ce module.";
    }

    const prompt = buildReadWriteModuleFeedbackPrompt(params);
    const models = Array.from(new Set([SPEAK_A2_CORRECTION_MODEL, SPEAK_A2_CORRECTION_FALLBACK_MODEL].filter(Boolean)));
    for (const model of models) {
        try {
            const completion = await clientOpenai.chat.completions.create(
                {
                    model,
                    messages: [{ role: "user", content: prompt }],
                },
                { timeout: SPEAK_A2_CORRECTION_TIMEOUT_MS },
            );
            const content = String(completion.choices?.[0]?.message?.content || "").trim();
            if (content) return content;
        } catch (error) {
            console.error("Feedback module Lire/Écrire échoué", { moduleLabel: params.moduleLabel, model, error });
        }
    }

    return "Feedback de module indisponible pour le moment.";
};

const requestModelCorrection = async (prompt: string, logContext: { taskId: string; activityKey?: string }) => {
    const models = Array.from(new Set([SPEAK_A2_CORRECTION_MODEL, SPEAK_A2_CORRECTION_FALLBACK_MODEL].filter(Boolean)));
    let content = "";

    for (const model of models) {
        try {
            const completion = await clientOpenai.chat.completions.create(
                {
                    model,
                    messages: [{ role: "user", content: prompt }],
                },
                { timeout: SPEAK_A2_CORRECTION_TIMEOUT_MS },
            );
            content = String(completion.choices?.[0]?.message?.content || "").trim();
            if (content) break;
        } catch (error) {
            console.error("Correction IA échouée", { ...logContext, model, error });
        }
    }

    if (!content) {
        throw new Error("Réponse IA vide.");
    }

    const parsed = parseJsonFromModelOutput(content);
    const feedback = String(parsed?.feedback || "").trim() || "Correction reçue, mais feedback vide.";
    return { parsed, feedback };
};

const normalizeChoiceLabel = (value: string) =>
    String(value || "")
        .trim()
        .toLowerCase();

const extractSingleChoiceActivityResults = (parsed: unknown) => {
    if (!parsed || typeof parsed !== "object") return [];
    const raw = (parsed as { results?: unknown }).results;
    if (!Array.isArray(raw)) return [];
    return raw
        .map((entry) => {
            if (!entry || typeof entry !== "object") return null;
            const item = entry as {
                questionKey?: unknown;
                questionNumber?: unknown;
                score?: unknown;
                feedback?: unknown;
            };
            return {
                questionKey: String(item.questionKey || "").trim(),
                questionNumber: String(item.questionNumber || "").trim(),
                score: item.score,
                feedback: String(item.feedback || "").trim(),
            };
        })
        .filter(Boolean) as Array<{ questionKey: string; questionNumber: string; score: unknown; feedback: string }>;
};

const USER_COMPILATION_ENTRIES_QUERY = groq`
  *[_type == "user" && _id == $userId][0]{
    examCompilations[]{
      _key,
      "compilationId": compilationRef._ref,
      "sessionIds": sessions[]._ref
    }
  }
`;

const ACTIVE_COMPILATION_IDS_QUERY = groq`
  *[_type == "examCompilation" && isActive == true]
    | order(coalesce(order, 999999) asc, _id asc){
    _id
  }
`;

const FIDE_EXAMS_BY_IDS_QUERY = groq`
  *[_type == "fideExam" && _id in $examIds]{
    _id,
    title,
    secondaryTitle,
    description,
    image,
    levels,
    competence,
    tracks,
    responses,
    responsesB1,
    isPreview,
    pdf,
    order
  }
`;

const MOCK_EXAM_SESSIONS_BY_COMPILATION_IDS_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    userRef._ref == $userId &&
    compilationRef._ref in $compilationIds
  ] | order(startedAt desc){
    _id,
    status,
    startedAt,
    "compilationId": compilationRef._ref,
    resume{ state, taskId, activityKey, updatedAt },
    speakA2CorrectionRetryCount,
    speakBranchCorrectionRetryCount,
    readWriteCorrectionRetryCount,
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore
    },
    listeningScenarioResults[]{
      examRef,
      score,
      max,
      completedAt
    },
    scores{
      speakA2{ percentage, feedback },
      speakBranch{ percentage, feedback },
      listening{ percentage, feedback },
      readWrite{ percentage, feedback },
      total{ percentage, feedback }
    }
  }
`;

const MOCK_EXAM_SESSIONS_BY_COMPILATION_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    userRef._ref == $userId &&
    compilationRef._ref == $compilationId
  ] | order(startedAt desc){
    _id,
    status,
    startedAt,
    resume{ state, taskId, activityKey, updatedAt },
    speakA2CorrectionRetryCount,
    speakBranchCorrectionRetryCount,
    readWriteCorrectionRetryCount,
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore
    },
    speakBranchAnswers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore
    },
    listeningScenarioResults[]{
      examRef,
      score,
      max,
      completedAt
    },
    readWriteAnswers[]{
      taskRef,
      taskId,
      activityKey,
      questionKey,
      textAnswer,
      AiFeedback,
      AiScore
    },
    overtimeTaskRefs[]{ _ref, _type },
    scores{
      speakA2{ percentage, feedback },
      speakBranch{ percentage, feedback },
      listening{ percentage, feedback },
      readWrite{ percentage, feedback },
      total{ percentage, feedback }
    }
  }
`;

const MOCK_EXAM_IN_PROGRESS_SESSIONS_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    userRef._ref == $userId &&
    compilationRef._ref == $compilationId &&
    status == "in_progress"
  ] | order(coalesce(resume.updatedAt, startedAt) desc){
    _id,
    status,
    startedAt,
    resume{ state, taskId, activityKey, updatedAt },
    speakA2CorrectionRetryCount,
    speakBranchCorrectionRetryCount,
    readWriteCorrectionRetryCount,
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore
    },
    speakBranchAnswers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore
    },
    listeningScenarioResults[]{
      examRef,
      score,
      max,
      completedAt
    },
    readWriteAnswers[]{
      taskRef,
      taskId,
      activityKey,
      questionKey,
      textAnswer,
      AiFeedback,
      AiScore
    },
    overtimeTaskRefs[]{ _ref, _type },
    scores{
      speakA2{ percentage, feedback },
      speakBranch{ percentage, feedback },
      listening{ percentage, feedback },
      readWrite{ percentage, feedback },
      total{ percentage, feedback }
    }
  }
`;

const MOCK_EXAM_SESSION_ACCESS_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    _id == $sessionKey &&
    userRef._ref == $userId &&
    compilationRef._ref == $compilationId &&
    status == "in_progress"
  ][0]{
    _id,
    status,
    startedAt,
    resume{ state, taskId, activityKey, updatedAt },
    speakA2CorrectionRetryCount,
    speakBranchCorrectionRetryCount,
    readWriteCorrectionRetryCount,
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore
    },
    speakBranchAnswers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore
    },
    listeningScenarioResults[]{
      examRef,
      score,
      max,
      completedAt
    },
    readWriteAnswers[]{
      taskRef,
      taskId,
      activityKey,
      questionKey,
      textAnswer,
      AiFeedback,
      AiScore
    },
    overtimeTaskRefs[]{ _ref, _type },
    scores{
      speakA2{ percentage, feedback },
      speakBranch{ percentage, feedback },
      listening{ percentage, feedback },
      readWrite{ percentage, feedback },
      total{ percentage, feedback }
    }
  }
`;

const MOCK_EXAM_SESSION_FINALIZE_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    _id == $sessionKey &&
    userRef._ref == $userId &&
    compilationRef._ref == $compilationId
  ][0]{
    _id,
    status,
    oralBranch,
    scores{
      speakA2{ percentage, feedback },
      speakBranch{ percentage, feedback },
      listening{ percentage, feedback },
      readWrite{ percentage, feedback },
      total{ percentage, feedback }
    }
  }
`;

const MOCK_EXAM_SESSION_REVIEW_SOURCE_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    _id == $sessionKey &&
    userRef._ref == $userId &&
    compilationRef._ref == $compilationId
  ][0]{
    _id,
    status,
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback
    },
    speakBranchAnswers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback
    },
    listeningScenarioResults[]{
      examRef
    },
    readWriteAnswers[]{
      taskRef,
      taskId,
      activityKey,
      textAnswer,
      AiFeedback
    },
    overtimeTaskRefs[]{ _ref, _type },
    scores{
      speakA2{ percentage, feedback },
      speakBranch{ percentage, feedback },
      listening{ percentage, feedback },
      readWrite{ percentage, feedback },
      total{ percentage, feedback }
    }
  }
`;

const EXAM_REVIEW_BY_SESSION_QUERY = groq`
  *[
    _type == "examReview" &&
    user._ref == $userId &&
    session._ref == $sessionId
  ][0]{
    _id
  }
`;

const EXAM_REVIEW_EXISTS_FOR_USER_QUERY = groq`
  count(*[
    _type == "examReview" &&
    user._ref == $userId
  ]) > 0
`;

const BRAVO10_COUPON_CODE = "BRAVO10";
const COUPON_PLANS_PATH = "/fide/pack-fide#pack-pricing";

const COUPON_BY_CODE_FOR_ASSIGNMENT_QUERY = groq`
  *[_type == "coupon" && lower(code) == $code][0]{
    _id,
    _rev,
    code,
    "assignedUserIds": assignedUsers[]._ref
  }
`;

type CouponForAssignment = {
    _id: string;
    _rev?: string;
    code?: string;
    assignedUserIds?: string[];
} | null;

const mapSessionDocumentToLite = (session: SessionDocument): MockExamSessionLite => ({
    _id: session._id,
    status: session.status,
    startedAt: session.startedAt,
    resume: session.resume,
    oralBranch: session.oralBranch,
    writtenCombo: session.writtenCombo,
    speakA2Answers: Array.isArray(session.speakA2Answers) ? session.speakA2Answers : [],
    speakBranchAnswers: Array.isArray(session.speakBranchAnswers) ? session.speakBranchAnswers : [],
    listeningScenarioResults: Array.isArray(session.listeningScenarioResults) ? session.listeningScenarioResults : [],
    readWriteAnswers: Array.isArray(session.readWriteAnswers) ? session.readWriteAnswers : [],
    speakA2CorrectionRetryCount: Number(session.speakA2CorrectionRetryCount || 0),
    speakBranchCorrectionRetryCount: Number(session.speakBranchCorrectionRetryCount || 0),
    readWriteCorrectionRetryCount: Number(session.readWriteCorrectionRetryCount || 0),
    scores: sanitizeSessionScores(session.scores),
});

async function getUserCompilationEntries(userId: string) {
    const user = await client.fetch<{ examCompilations?: UserCompilationEntry[] } | null>(USER_COMPILATION_ENTRIES_QUERY, { userId });
    if (!user) return null;
    return Array.isArray(user.examCompilations) ? user.examCompilations : [];
}

async function isCompilationUnlockedForUser(userId: string, compilationId: string) {
    const entries = await getUserCompilationEntries(userId);
    if (!entries) return false;
    return entries.some((entry) => entry.compilationId === compilationId);
}

export async function isMockExamCompilationUnlockedForUser(userId: string, compilationId: string) {
    if (!userId || !compilationId) return false;
    return isCompilationUnlockedForUser(userId, compilationId);
}

async function appendSessionRefToUserCompilation(userId: string, compilationId: string, sessionId: string) {
    const entries = await getUserCompilationEntries(userId);
    const entry = (entries || []).find((item) => item.compilationId === compilationId && item._key);
    if (!entry?._key) return;

    const existingSessionIds = new Set(entry.sessionIds || []);
    const setPath = `examCompilations[_key=="${entry._key}"].updatedAt`;
    if (existingSessionIds.has(sessionId)) {
        await client
            .patch(userId)
            .set({ [setPath]: new Date().toISOString() })
            .commit({ autoGenerateArrayKeys: true });
        return;
    }

    const sessionsPath = `examCompilations[_key=="${entry._key}"].sessions`;
    await client
        .patch(userId)
        .set({ [setPath]: new Date().toISOString() })
        .setIfMissing({ [sessionsPath]: [] })
        .append(sessionsPath, [toRef(sessionId)])
        .commit({ autoGenerateArrayKeys: true });
}

async function removeSessionRefsFromUser(userId: string, sessionIds: string[]) {
    if (!sessionIds.length) return;
    const sessionIdSet = new Set(sessionIds.filter(Boolean));
    if (!sessionIdSet.size) return;

    const user = await client.fetch<{ examCompilations?: Array<{ _key?: string; sessions?: Array<{ _ref?: string }> }> } | null>(
        groq`
          *[_type == "user" && _id == $userId][0]{
            examCompilations[]{
              _key,
              "sessions": sessions[]{ _ref }
            }
          }
        `,
        { userId },
    );

    const entries = Array.isArray(user?.examCompilations) ? user.examCompilations : [];
    if (!entries.length) return;

    const unsetPaths: string[] = [];
    const touchedEntryKeys = new Set<string>();

    for (const entry of entries) {
        const entryKey = String(entry?._key || "");
        if (!entryKey) continue;

        const refs = Array.isArray(entry.sessions) ? entry.sessions : [];
        for (const ref of refs) {
            const refId = String(ref?._ref || "");
            if (!refId || !sessionIdSet.has(refId)) continue;

            unsetPaths.push(`examCompilations[_key=="${entryKey}"].sessions[_ref=="${refId}"]`);
            touchedEntryKeys.add(entryKey);
        }
    }

    if (!unsetPaths.length) return;

    const setPayload: Record<string, string> = {};
    const now = new Date().toISOString();
    for (const entryKey of touchedEntryKeys) {
        setPayload[`examCompilations[_key=="${entryKey}"].updatedAt`] = now;
    }

    await client.patch(userId).unset(unsetPaths).set(setPayload).commit({ autoGenerateArrayKeys: true });
}

async function consumeMockExamCredit(userId: string) {
    const credit = await getUserMockExamCredits(userId);
    const remaining = Number(credit?.remainingCredits || 0);
    if (!credit || remaining <= 0) return { ok: false as const, remaining };

    const creditPath = credit?._key ? `credits[_key=="${credit._key}"].remainingCredits` : `credits[referenceKey=="mock_exam"][0].remainingCredits`;
    return { ok: true as const, remaining, creditPath };
}

async function getInProgressSessionsForCompilation(userId: string, compilationId: string) {
    const data = await client.fetch<SessionDocument[]>(MOCK_EXAM_IN_PROGRESS_SESSIONS_QUERY, { userId, compilationId });
    return (data || []).map(mapSessionDocumentToLite);
}

async function clearInProgressSessionsForCompilation(userId: string, compilationId: string) {
    const inProgressSessions = await getInProgressSessionsForCompilation(userId, compilationId);
    if (!inProgressSessions.length) return [] as MockExamSessionLite[];

    const sessionIds = inProgressSessions.map((session) => session._id);
    await removeSessionRefsFromUser(userId, sessionIds);

    let tx = client.transaction();
    for (const session of inProgressSessions) {
        tx = tx.delete(session._id);
    }
    await tx.commit({ autoGenerateArrayKeys: true });

    return inProgressSessions;
}

async function ensureSingleInProgressSession(userId: string, compilationId: string, preferredSessionId?: string) {
    const inProgressSessions = await getInProgressSessionsForCompilation(userId, compilationId);
    if (!inProgressSessions.length) return null as MockExamSessionLite | null;
    if (inProgressSessions.length === 1) return inProgressSessions[0];

    const preferred = preferredSessionId ? inProgressSessions.find((session) => session._id === preferredSessionId) : null;
    const keepSession = preferred || inProgressSessions[0];
    const staleSessions = inProgressSessions.filter((session) => session._id !== keepSession._id);
    if (staleSessions.length) {
        const staleSessionIds = staleSessions.map((session) => session._id);
        await removeSessionRefsFromUser(userId, staleSessionIds);
        let tx = client.transaction();
        for (const stale of staleSessions) {
            tx = tx.delete(stale._id);
        }
        await tx.commit({ autoGenerateArrayKeys: true });
    }

    return keepSession;
}

export async function getUserCompilations(userId: string) {
    if (!userId) return [] as ExamCompilationLite[];
    const entries = await getUserCompilationEntries(userId);
    if (!entries) return [] as ExamCompilationLite[];
    const compilationIds = entries.map((entry) => entry.compilationId).filter(Boolean) as string[];
    if (!compilationIds.length) return [];

    const compilations = await client.fetch<ExamCompilationLite[]>(MOCK_EXAM_USER_COMPILATIONS_QUERY, { compilationIds });
    const list = compilations || [];
    if (!list.length) return [];

    const sessions = await client.fetch<SessionWithCompilationId[]>(MOCK_EXAM_SESSIONS_BY_COMPILATION_IDS_QUERY, { userId, compilationIds });
    const sessionsByCompilation = new Map<string, MockExamSessionLite[]>();
    for (const session of sessions || []) {
        if (!session.compilationId) continue;
        const bucket = sessionsByCompilation.get(session.compilationId) || [];
        bucket.push({
            _id: session._id,
            status: session.status,
            startedAt: session.startedAt,
            resume: session.resume,
            oralBranch: session.oralBranch,
            writtenCombo: session.writtenCombo,
            speakA2Answers: session.speakA2Answers,
            listeningScenarioResults: session.listeningScenarioResults,
            speakA2CorrectionRetryCount: Number(session.speakA2CorrectionRetryCount || 0),
            speakBranchCorrectionRetryCount: Number(session.speakBranchCorrectionRetryCount || 0),
            readWriteCorrectionRetryCount: Number(session.readWriteCorrectionRetryCount || 0),
            scores: session.scores,
        });
        sessionsByCompilation.set(session.compilationId, bucket);
    }

    return list.map((compilation) => ({
        ...compilation,
        session: sessionsByCompilation.get(compilation._id) || [],
    }));
}

export async function getUserAvailableMockExamCompilationCount(userId: string) {
    if (!userId) return 0;

    const [entries, activeCompilations] = await Promise.all([getUserCompilationEntries(userId), client.fetch<ActiveCompilationLite[]>(ACTIVE_COMPILATION_IDS_QUERY)]);
    if (!entries) return 0;

    const ownedIds = new Set(entries.map((entry) => entry.compilationId).filter(Boolean) as string[]);
    return (activeCompilations || []).reduce((count, compilation) => {
        const compilationId = String(compilation?._id || "");
        if (!compilationId || ownedIds.has(compilationId)) {
            return count;
        }
        return count + 1;
    }, 0);
}

export async function getMockExamCheckoutEligibility(userId: string): Promise<MockExamCheckoutEligibility> {
    if (!userId) {
        return {
            canCheckout: true,
            reason: null,
            remainingCredits: 0,
            availableToPurchase: 0,
        };
    }

    const [credit, availableToPurchase] = await Promise.all([getUserMockExamCredits(userId), getUserAvailableMockExamCompilationCount(userId)]);
    const remainingCredits = Number(credit?.remainingCredits || 0);
    const hasCredit = remainingCredits > 0;
    const hasNoTemplateLeft = availableToPurchase <= 0;
    const reason = hasCredit ? "hasCredit" : hasNoTemplateLeft ? "noTemplates" : null;

    return {
        canCheckout: !reason,
        reason,
        remainingCredits,
        availableToPurchase,
    };
}

export async function getCompilation(compilationId: string) {
    if (!compilationId) return null;
    const data = await client.fetch<ExamCompilationLite | null>(MOCK_EXAM_COMPILATION_QUERY, { compilationId });
    return data || null;
}

export async function getCompilationSessions(userId: string, compilationId: string) {
    if (!userId || !compilationId) return [] as MockExamSessionLite[];
    const data = await client.fetch<SessionDocument[]>(MOCK_EXAM_SESSIONS_BY_COMPILATION_QUERY, { userId, compilationId });
    return (data || []).map(mapSessionDocumentToLite);
}

export async function getOrCreateInProgressMockExamSession(compilationId: string, params?: { forceNew?: boolean }) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    if (!userId || !compilationId) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const compilation = await getCompilation(compilationId);
    if (!compilation || !compilation.examConfig || compilation.isActive === false) {
        return { ok: false as const, error: "Compilation introuvable." };
    }
    const isUnlocked = await isCompilationUnlockedForUser(userId, compilationId);
    if (!isUnlocked) {
        return { ok: false as const, error: "Compilation non disponible pour cet utilisateur." };
    }

    if (params?.forceNew) {
        await clearInProgressSessionsForCompilation(userId, compilationId);
    } else {
        const existing = await ensureSingleInProgressSession(userId, compilationId);
        if (existing?._id) {
            return { ok: true as const, session: existing, created: false as const };
        }
    }

    const now = new Date().toISOString();
    const newSessionId = uuidv4();
    const newSession: SessionDocument = {
        _id: newSessionId,
        userRef: toRef(userId),
        compilationRef: toRef(compilationId),
        status: "in_progress",
        startedAt: now,
        resume: {
            state: "EXAM_INTRO",
            updatedAt: now,
        },
        oralBranch: DEFAULT_ORAL_BRANCH,
        writtenCombo: DEFAULT_WRITTEN_COMBO,
        speakA2Answers: [],
        speakBranchAnswers: [],
        listeningScenarioResults: [],
        readWriteAnswers: [],
        speakA2CorrectionRetryCount: 0,
        speakBranchCorrectionRetryCount: 0,
        readWriteCorrectionRetryCount: 0,
    };

    let tx = client.transaction();
    tx = tx.create({
        _id: newSession._id,
        _type: "mockExamSession",
        userRef: newSession.userRef,
        compilationRef: newSession.compilationRef,
        status: newSession.status,
        startedAt: newSession.startedAt,
        resume: newSession.resume,
        oralBranch: newSession.oralBranch,
        writtenCombo: newSession.writtenCombo,
        speakA2Answers: [],
        speakBranchAnswers: [],
        listeningScenarioResults: [],
        readWriteAnswers: [],
        speakA2CorrectionRetryCount: 0,
        speakBranchCorrectionRetryCount: 0,
        readWriteCorrectionRetryCount: 0,
    });
    await tx.commit({ autoGenerateArrayKeys: true });

    await appendSessionRefToUserCompilation(userId, compilationId, newSession._id);
    const keptSession = await ensureSingleInProgressSession(userId, compilationId, newSession._id);
    if (keptSession?._id) {
        return {
            ok: true as const,
            created: keptSession._id === newSession._id,
            session: keptSession,
        };
    }

    return {
        ok: true as const,
        created: true as const,
        session: mapSessionDocumentToLite(newSession),
    };
}

export async function purchaseMockExamCompilation() {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    if (!userId) {
        return { ok: false as const, error: "Utilisateur introuvable." };
    }

    const entries = await getUserCompilationEntries(userId);
    if (!entries) {
        return { ok: false as const, error: "Utilisateur introuvable." };
    }
    const ownedIds = new Set(entries.map((entry) => entry.compilationId).filter(Boolean) as string[]);

    const activeCompilations = await client.fetch<ActiveCompilationLite[]>(ACTIVE_COMPILATION_IDS_QUERY);
    const nextAvailable = (activeCompilations || []).find((item) => {
        const compilationId = String(item?._id || "");
        return compilationId && !ownedIds.has(compilationId);
    });
    if (!nextAvailable?._id) {
        return { ok: false as const, error: "Aucune nouvelle compilation disponible pour le moment." };
    }

    const creditCheck = await consumeMockExamCredit(userId);
    if (!creditCheck.ok) {
        return { ok: false as const, error: "Vous n'avez plus de crédits disponibles." };
    }

    const compilationId = nextAvailable._id;
    const now = new Date().toISOString();

    const tx: any = client.transaction();
    await tx
        .patch(userId, (patch: any) =>
            patch
                .setIfMissing({ credits: [], examCompilations: [] })
                .set({
                    [creditCheck.creditPath]: creditCheck.remaining - 1,
                })
                .append("examCompilations", [
                    {
                        _type: "examCompilationEntry",
                        compilationRef: toRef(compilationId),
                        sessions: [],
                        updatedAt: now,
                    },
                ]),
        )
        .commit({ autoGenerateArrayKeys: true });

    return { ok: true as const, compilationId };
}

export async function getMockExamTasksByIds(taskIds: string[]) {
    if (!taskIds?.length) return [] as RunnerTask[];
    const data = await client.fetch<RunnerTask[]>(MOCK_EXAM_TASKS_BY_IDS_QUERY, { taskIds });
    const tasksById = new Map((data || []).map((task) => [task._id, task]));
    return taskIds.map((id) => tasksById.get(id)).filter((task): task is RunnerTask => Boolean(task));
}

export async function getFideExamsByIds(examIds: string[]) {
    if (!examIds?.length) return [] as Exam[];
    const data = await client.fetch<Exam[]>(FIDE_EXAMS_BY_IDS_QUERY, { examIds });
    const examsById = new Map((data || []).map((exam) => [exam._id, exam]));
    return examIds.map((id) => examsById.get(id)).filter((exam): exam is Exam => Boolean(exam));
}

export async function getUserMockExamCredits(userId: string) {
    if (!userId) return null;
    const credit = await client.fetch<UserMockExamCredit>(USER_MOCK_EXAM_CREDITS_QUERY, { userId });
    return credit || null;
}

export async function patchSession(sessionKey: string, params: { set?: Record<string, any>; unset?: string[] }) {
    if (!sessionKey) return null;
    let patch = client.patch(sessionKey);
    if (params.set && Object.keys(params.set).length) {
        const setPayload = { ...params.set };
        if (Object.prototype.hasOwnProperty.call(setPayload, "scores")) {
            setPayload.scores = sanitizeSessionScores(setPayload.scores as SessionDocument["scores"] | null | undefined);
        }
        patch = patch.set(setPayload);
    }
    if (params.unset && params.unset.length) {
        patch = patch.unset(params.unset);
    }
    return patch.commit({ autoGenerateArrayKeys: true });
}

async function ensureUserAssignedToBravo10Coupon(userId: string): Promise<{ assignedNow: boolean; couponCode?: string }> {
    if (!userId) return { assignedNow: false };
    const normalizedCode = BRAVO10_COUPON_CODE.toLowerCase();

    for (let attempt = 0; attempt < 3; attempt += 1) {
        const coupon = await client.fetch<CouponForAssignment>(COUPON_BY_CODE_FOR_ASSIGNMENT_QUERY, { code: normalizedCode });
        if (!coupon?._id) {
            return { assignedNow: false };
        }

        const assignedUserIds = Array.isArray(coupon.assignedUserIds) ? coupon.assignedUserIds.filter(Boolean) : [];
        if (assignedUserIds.includes(userId)) {
            return { assignedNow: false, couponCode: coupon.code || BRAVO10_COUPON_CODE };
        }

        try {
            let patch = client.patch(coupon._id).setIfMissing({ assignedUsers: [] }).append("assignedUsers", [{ _type: "reference", _ref: userId }]);
            if (coupon._rev) {
                patch = patch.ifRevisionId(coupon._rev);
            }
            await patch.commit({ autoGenerateArrayKeys: true });
            return { assignedNow: true, couponCode: coupon.code || BRAVO10_COUPON_CODE };
        } catch (error) {
            if (attempt === 2) {
                throw error;
            }
        }
    }

    return { assignedNow: false };
}

async function notifyBravo10Unlocked(params: { userId: string; userName?: string | null; userEmail?: string | null; localeLike?: string | null; couponCode?: string | null }) {
    const userId = String(params.userId || "").trim();
    if (!userId) return;

    const couponCode = String(params.couponCode || BRAVO10_COUPON_CODE).trim().toUpperCase();
    const userName = String(params.userName || "").trim();
    const userEmail = String(params.userEmail || "")
        .trim()
        .toLowerCase();

    try {
        await appendSystemNotification(
            userId,
            buildBravoCouponSystemNotification({
                localeLike: params.localeLike,
                userName,
                couponCode,
                plansPath: COUPON_PLANS_PATH,
            }),
        );
    } catch (error) {
        console.error("[MockExam] Notification coupon BRAVO10 impossible", { userId, error });
    }

    if (!userEmail) return;

    try {
        const mail = buildBravoCouponMailMessage({
            localeLike: params.localeLike,
            userName,
            couponCode,
            plansPath: COUPON_PLANS_PATH,
        });
        await transporterNico.sendMail({
            from: "Start French Now <nicolas@startfrenchnow.com>",
            to: userEmail,
            html: `<html><div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">${mail.bodyHtml}</div></html>`,
            subject: mail.subject,
        });
    } catch (error) {
        console.error("[MockExam] Email coupon BRAVO10 impossible", { userId, userEmail, error });
    }
}

export async function finalizeMockExamSession(params: { compilationId: string; sessionKey: string; localeLike?: string }) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const compilationId = String(params.compilationId || "");
    const sessionKey = String(params.sessionKey || "");

    if (!userId || !compilationId || !sessionKey) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const targetSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_FINALIZE_QUERY, { userId, compilationId, sessionKey });
    if (!targetSession?._id) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const resolvedOralBranch: OralBranch = targetSession.oralBranch?.chosen === "B1" || targetSession.oralBranch?.recommended === "B1" ? "B1" : "A1";
    const baseScores = sanitizeSessionScores(targetSession.scores);
    const readWritePercentage = Number(baseScores.readWrite?.percentage);
    const totalSummary = buildMockExamTotalScoreSummary({
        scores: baseScores,
        oralBranch: resolvedOralBranch,
        readWritePercentage,
    });
    const nextScores: NonNullable<SessionDocument["scores"]> = {
        ...baseScores,
    };
    if (totalSummary) {
        nextScores.total = totalSummary;
    }

    const alreadyCompleted = targetSession.status === "completed";

    if (!alreadyCompleted || totalSummary) {
        await patchSession(sessionKey, {
            set: {
                status: "completed",
                scores: nextScores,
            },
        });
    }

    try {
        const couponAssignment = await ensureUserAssignedToBravo10Coupon(userId);
        if (couponAssignment.assignedNow) {
            await notifyBravo10Unlocked({
                userId,
                userName: session?.user?.name,
                userEmail: session?.user?.email,
                localeLike: params.localeLike,
                couponCode: couponAssignment.couponCode || BRAVO10_COUPON_CODE,
            });
        }
    } catch (error) {
        console.error("[MockExam] Activation coupon BRAVO10 impossible pendant la finalisation", { userId, sessionKey, error });
    }

    return { ok: true as const, status: "completed" as const, scores: nextScores };
}

export async function createExamReviewFromCalendlyBooking(params: {
    compilationId: string;
    sessionId: string;
    calendlyEventUri?: string;
    scheduledAt?: string;
    timezone?: string;
    joinUrl?: string;
}) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = String(session?.user?._id || "");
    const compilationId = String(params.compilationId || "");
    const sessionId = String(params.sessionId || "");
    if (!userId || !compilationId || !sessionId) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const sourceSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_REVIEW_SOURCE_QUERY, { userId, compilationId, sessionKey: sessionId });
    if (!sourceSession?._id) {
        return { ok: false as const, error: "Session mock exam introuvable pour la review." };
    }

    const toUniqueReferences = (refs: Array<{ _ref?: string } | undefined | null>) => {
        const seen = new Set<string>();
        const output: Array<{ _type: "reference"; _ref: string }> = [];
        for (const ref of refs) {
            const refId = String(ref?._ref || "").trim();
            if (!refId || seen.has(refId)) continue;
            seen.add(refId);
            output.push(toRef(refId));
        }
        return output;
    };

    const normalizeTaskRef = (entry?: { taskRef?: { _ref?: string }; taskId?: string } | null) => {
        const taskId = String(entry?.taskRef?._ref || entry?.taskId || "").trim();
        return taskId ? toRef(taskId) : undefined;
    };

    const speakA2AnswersRaw = Array.isArray(sourceSession.speakA2Answers) ? sourceSession.speakA2Answers : [];
    const speakBranchAnswersRaw = Array.isArray(sourceSession.speakBranchAnswers) ? sourceSession.speakBranchAnswers : [];
    const readWriteAnswersRaw = Array.isArray(sourceSession.readWriteAnswers) ? sourceSession.readWriteAnswers : [];
    const listeningResultsRaw = Array.isArray(sourceSession.listeningScenarioResults) ? sourceSession.listeningScenarioResults : [];
    const overtimeRefsRaw = Array.isArray(sourceSession.overtimeTaskRefs) ? sourceSession.overtimeTaskRefs : [];

    const speakA2Answers = speakA2AnswersRaw
        .map((answer) => {
            const taskRef = normalizeTaskRef(answer);
            if (!taskRef || !answer?.activityKey) return null;
            return {
                taskRef,
                activityKey: String(answer.activityKey),
                audioUrl: String(answer.audioUrl || ""),
                transcriptFinal: String(answer.transcriptFinal || ""),
                AiFeedback: String(answer.AiFeedback || ""),
            };
        })
        .filter(Boolean);

    const speakBranchAnswers = speakBranchAnswersRaw
        .map((answer) => {
            const taskRef = normalizeTaskRef(answer);
            if (!taskRef || !answer?.activityKey) return null;
            return {
                taskRef,
                activityKey: String(answer.activityKey),
                audioUrl: String(answer.audioUrl || ""),
                transcriptFinal: String(answer.transcriptFinal || ""),
                AiFeedback: String(answer.AiFeedback || ""),
            };
        })
        .filter(Boolean);

    const readWriteAnswers = readWriteAnswersRaw
        .map((answer) => {
            const taskRef = normalizeTaskRef(answer);
            if (!taskRef || !answer?.activityKey) return null;
            return {
                taskRef,
                activityKey: String(answer.activityKey),
                textAnswer: String(answer.textAnswer || ""),
                AiFeedback: String(answer.AiFeedback || ""),
            };
        })
        .filter(Boolean);

    const scheduledAt = String(params.scheduledAt || "").trim();
    const joinUrl = String(params.joinUrl || "").trim();
    const calendlyEventUri = String(params.calendlyEventUri || "").trim();

    const reviewPayload = {
        user: toRef(userId),
        compilationRef: toRef(compilationId),
        session: toRef(sessionId),
        status: "scheduled" as const,
        ...(scheduledAt ? { scheduledAt } : {}),
        path: {
            oralBranch: sourceSession.oralBranch?.chosen === "B1" || sourceSession.oralBranch?.recommended === "B1" ? "B1" : "A1",
            writtenCombo: sourceSession.writtenCombo?.chosen === "A2_B1" || sourceSession.writtenCombo?.recommended === "A2_B1" ? "A2_B1" : "A1_A2",
        },
        taskRefs: {
            speakA2: toUniqueReferences(speakA2AnswersRaw.map((answer) => normalizeTaskRef(answer))),
            speakBranch: toUniqueReferences(speakBranchAnswersRaw.map((answer) => normalizeTaskRef(answer))),
            listening: toUniqueReferences(listeningResultsRaw.map((entry) => entry?.examRef)),
            readWrite: toUniqueReferences(readWriteAnswersRaw.map((answer) => normalizeTaskRef(answer))),
        },
        answers: {
            speakA2: speakA2Answers,
            speakBranch: speakBranchAnswers,
            readWrite: readWriteAnswers,
        },
        overtimeTaskRefs: toUniqueReferences(overtimeRefsRaw),
        meeting: {
            provider: "zoom" as const,
            ...(joinUrl ? { joinUrl } : {}),
            ...(scheduledAt ? { startAt: scheduledAt } : {}),
            timezone: String(params.timezone || "").trim() || "Europe/Berlin",
        },
        ...(calendlyEventUri ? { userNote: `Calendly event: ${calendlyEventUri}` } : {}),
    };

    const existingReview = await client.fetch<{ _id?: string } | null>(EXAM_REVIEW_BY_SESSION_QUERY, { userId, sessionId });
    if (existingReview?._id) {
        await client
            .patch(existingReview._id)
            .set(reviewPayload)
            .commit({ autoGenerateArrayKeys: true });
        return { ok: true as const, reviewId: existingReview._id, upserted: "updated" as const };
    }

    const created = await client.create({
        _type: "examReview",
        ...reviewPayload,
    });

    return { ok: true as const, reviewId: created?._id as string, upserted: "created" as const };
}

export async function hasAnyExamReviewForCurrentUser() {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = String(session?.user?._id || "").trim();
    if (!userId) {
        return { ok: false as const, exists: false, error: "Utilisateur introuvable." };
    }

    const exists = await client.fetch<boolean>(EXAM_REVIEW_EXISTS_FOR_USER_QUERY, { userId });
    return { ok: true as const, exists: Boolean(exists) };
}

export async function saveMockExamSpeakingAnswer(params: { compilationId: string; sessionKey: string; taskId: string; activityKey: string; audioUrl: string; transcriptFinal: string }) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const { compilationId, sessionKey, taskId, activityKey, audioUrl } = params;
    const transcriptFinal = String(params.transcriptFinal || "").trim();

    if (!userId || !compilationId || !sessionKey || !taskId || !activityKey || !audioUrl) {
        return { ok: false as const, error: "Paramètres invalides." };
    }
    if (!transcriptFinal) {
        return { ok: false as const, error: "Le transcript est vide." };
    }

    const activeSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { userId, compilationId, sessionKey });
    if (!activeSession) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const [task] = await getMockExamTasksByIds([taskId]);
    const targetField = task && SPEAK_A2_SUPPORTED_TASK_TYPES.has(task.taskType as SpeakingA2CorrectionTaskType) ? "speakA2Answers" : "speakBranchAnswers";

    const answer: SpeakingAnswer = {
        taskRef: toRef(taskId),
        activityKey,
        audioUrl,
        transcriptFinal,
        AiFeedback: undefined,
        AiScore: undefined,
    };

    const rawAnswers = activeSession[targetField] as SpeakingAnswer[] | undefined;
    const currentAnswers: SpeakingAnswer[] = Array.isArray(rawAnswers) ? rawAnswers : [];
    const existingIndex = currentAnswers.findIndex((item) => getAnswerTaskId(item) === taskId && item.activityKey === activityKey);
    const nextAnswers = [...currentAnswers];
    if (existingIndex >= 0) {
        nextAnswers[existingIndex] = {
            ...currentAnswers[existingIndex],
            ...answer,
        };
    } else {
        nextAnswers.push(answer);
    }

    await patchSession(sessionKey, { set: { [targetField]: nextAnswers } });
    return { ok: true as const, answer };
}

export async function saveMockExamReadWriteAnswer(params: { compilationId: string; sessionKey: string; taskId: string; activityKey: string; questionKey: string; textAnswer: string }) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const compilationId = String(params.compilationId || "");
    const sessionKey = String(params.sessionKey || "");
    const taskId = String(params.taskId || "");
    const activityKey = String(params.activityKey || "");
    const questionKey = String(params.questionKey || "");
    const textAnswer = String(params.textAnswer || "").trim();

    if (!userId || !compilationId || !sessionKey || !taskId || !activityKey || !questionKey) {
        return { ok: false as const, error: "Paramètres invalides." };
    }
    if (!textAnswer) {
        return { ok: false as const, error: "La réponse est vide." };
    }

    const activeSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { userId, compilationId, sessionKey });
    if (!activeSession) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const answer: ReadWriteAnswer = {
        taskRef: toRef(taskId),
        activityKey,
        questionKey,
        textAnswer,
        AiFeedback: undefined,
        AiScore: undefined,
    };

    const currentAnswers: ReadWriteAnswer[] = Array.isArray(activeSession.readWriteAnswers) ? activeSession.readWriteAnswers : [];
    const existingIndex = currentAnswers.findIndex((item) => getAnswerTaskId(item) === taskId && item.activityKey === activityKey && String(item.questionKey || "") === questionKey);
    const nextAnswers = [...currentAnswers];
    if (existingIndex >= 0) {
        nextAnswers[existingIndex] = {
            ...currentAnswers[existingIndex],
            ...answer,
        };
    } else {
        nextAnswers.push(answer);
    }

    await patchSession(sessionKey, { set: { readWriteAnswers: nextAnswers } });
    return { ok: true as const, answer };
}

export async function saveMockExamListeningScenarioResult(params: { compilationId: string; sessionKey: string; examId: string; score: number; max?: number }) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const compilationId = String(params.compilationId || "");
    const sessionKey = String(params.sessionKey || "");
    const examId = String(params.examId || "");
    const max = Math.max(1, Number(params.max || 3));
    const score = clampListeningScenarioScore(params.score, max);

    if (!userId || !compilationId || !sessionKey || !examId) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const activeSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { userId, compilationId, sessionKey });
    if (!activeSession) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const currentResults = Array.isArray(activeSession.listeningScenarioResults) ? activeSession.listeningScenarioResults : [];
    const nextResults = [...currentResults];
    const existingIndex = nextResults.findIndex((item) => String(item?.examRef?._ref || "") === examId);
    const nextResult: ListeningScenarioResult = {
        examRef: toRef(examId),
        score,
        max,
        completedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
        nextResults[existingIndex] = nextResult;
    } else {
        nextResults.push(nextResult);
    }

    const branch: OralBranch = activeSession.oralBranch?.chosen === "B1" ? "B1" : "A1";
    const examIds = Array.from(new Set(nextResults.map((item) => String(item?.examRef?._ref || "")).filter(Boolean)));
    const exams = await getFideExamsByIds(examIds);
    const examById = new Map(exams.map((exam) => [exam._id, exam] as const));

    let totalWeightedScore = 0;
    let totalWeightedMax = 0;
    for (const item of nextResults) {
        const refId = String(item?.examRef?._ref || "");
        const exam = examById.get(refId);
        const level = detectListeningExamLevel(exam);
        const coefficient = getListeningScenarioCoefficient(branch, level);
        const rawScore = Number(item?.score || 0);
        const rawMax = Math.max(1, Number(item?.max || 3));
        totalWeightedScore += rawScore * coefficient;
        totalWeightedMax += rawMax * coefficient;
    }

    const percentage = totalWeightedMax > 0 ? clampPercentage((totalWeightedScore / totalWeightedMax) * 100) : 0;
    const feedback = buildListeningSummaryFeedback(percentage);

    const nextScores = {
        ...sanitizeSessionScores(activeSession.scores),
        listening: {
            percentage,
            feedback,
        },
    };

    await patchSession(sessionKey, {
        set: {
            listeningScenarioResults: nextResults,
            scores: nextScores,
        },
    });

    return {
        ok: true as const,
        results: nextResults,
        summary: nextScores.listening,
    };
}

export async function evaluateMockExamSpeakA2Section(params: { compilationId: string; sessionKey: string; isRetry?: boolean }) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const isAdmin = session?.user?.isAdmin === true;
    const compilationId = String(params.compilationId || "");
    const sessionKey = String(params.sessionKey || "");
    const isRetry = params.isRetry === true;

    if (!userId || !compilationId || !sessionKey) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const activeSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { userId, compilationId, sessionKey });
    if (!activeSession) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const currentRetryCount = Number(activeSession.speakA2CorrectionRetryCount || 0);
    let nextRetryCount = currentRetryCount;
    if (isRetry && !isAdmin) {
        if (currentRetryCount >= SPEAK_A2_MAX_MANUAL_RETRIES) {
            return {
                ok: false as const,
                error: `Vous avez atteint le maximum de ${SPEAK_A2_MAX_MANUAL_RETRIES} relances de correction IA.`,
                retryCount: currentRetryCount,
            };
        }
        nextRetryCount = currentRetryCount + 1;
        await patchSession(sessionKey, {
            set: {
                speakA2CorrectionRetryCount: nextRetryCount,
            },
        });
    }

    const compilation = await getCompilation(compilationId);
    const speakA2TaskIds = (compilation?.examConfig?.speakA2TaskIds || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    if (!speakA2TaskIds.length) {
        return { ok: false as const, error: "Aucune tâche A2 disponible." };
    }

    const speakA2Tasks = await getMockExamTasksByIds(speakA2TaskIds);
    const currentAnswers = Array.isArray(activeSession.speakA2Answers) ? activeSession.speakA2Answers : [];
    if (!currentAnswers.length) {
        return { ok: false as const, error: "Aucune réponse à corriger." };
    }

    const nextAnswers = [...currentAnswers];
    const globalFeedbackPromise = requestMiniSectionFeedback("Parler A2", nextAnswers.map((answer) => String(answer?.transcriptFinal || "").trim()).filter(Boolean));

    const taskResults = (
        await Promise.all(
            speakA2TaskIds.map(async (taskId): Promise<SpeakA2CorrectionTaskResult | null> => {
                const task = speakA2Tasks.find((item) => item._id === taskId);
                if (!task || !SPEAK_A2_SUPPORTED_TASK_TYPES.has(task.taskType as SpeakingA2CorrectionTaskType)) {
                    return null;
                }

                const answersForTask = currentAnswers.filter((answer) => getAnswerTaskId(answer) === taskId);
                const answerByActivity = new Map(answersForTask.map((answer) => [answer.activityKey, answer] as const));
                const hasAnyTranscript = answersForTask.some((answer) => String(answer?.transcriptFinal || "").trim().length > 0);

                if (!hasAnyTranscript) {
                    return {
                        taskId: task._id,
                        taskType: task.taskType,
                        score: 0,
                        max: 6,
                        feedback: "Aucune transcription exploitable pour cette tâche.",
                        error: "missing_transcription",
                    };
                }

                const activitiesTexts = (task.activities || []).map((activity) => toPortableTextPlain(activity?.promptText));
                const aiCorrectionContext = (task.activities || []).map((activity) => String(activity?.aiCorrectionContext || "").trim());
                const transcriptions = (task.activities || []).map((activity) => String(answerByActivity.get(activity._key)?.transcriptFinal || "").trim());

                const prompt = buildSpeakingA2CorrectionPrompt({
                    taskType: task.taskType as SpeakingA2CorrectionTaskType,
                    activitiesTexts,
                    aiCorrectionContext,
                    transcriptions,
                });

                try {
                    const { parsed, feedback } = await requestModelCorrection(prompt, { taskId: task._id });
                    const score = clampTaskScore(parsed?.scores ?? parsed?.score);

                    return {
                        taskId: task._id,
                        taskType: task.taskType,
                        score,
                        max: 6,
                        feedback,
                    };
                } catch (error) {
                    return {
                        taskId: task._id,
                        taskType: task.taskType,
                        score: 0,
                        max: 6,
                        feedback: "La correction IA a échoué pour cette tâche. Vous pouvez réessayer.",
                        error: error instanceof Error ? error.message : "unknown_error",
                    };
                }
            }),
        )
    ).filter((item): item is SpeakA2CorrectionTaskResult => Boolean(item));

    for (const taskResult of taskResults) {
        for (let index = 0; index < nextAnswers.length; index += 1) {
            const answer = nextAnswers[index];
            if (getAnswerTaskId(answer) !== taskResult.taskId) continue;
            nextAnswers[index] = {
                ...answer,
                AiFeedback: taskResult.feedback,
                AiScore: taskResult.score,
            };
        }
    }

    const totalScore = taskResults.reduce((sum, item) => sum + Number(item.score || 0), 0);
    const totalMax = taskResults.reduce((sum, item) => sum + Number(item.max || 0), 0);
    const globalPercentage = totalMax > 0 ? clampPercentage((totalScore / totalMax) * 100) : 0;
    const globalFeedback = await globalFeedbackPromise;

    const nextScores = {
        ...sanitizeSessionScores(activeSession.scores),
        speakA2: {
            percentage: globalPercentage,
            feedback: globalFeedback,
        },
    };

    await patchSession(sessionKey, {
        set: {
            speakA2Answers: nextAnswers,
            scores: nextScores,
            speakA2CorrectionRetryCount: nextRetryCount,
        },
    });

    return {
        ok: true as const,
        answers: nextAnswers,
        summary: {
            tasks: taskResults,
            total: {
                score: totalScore,
                max: totalMax,
            },
            globalFeedback,
            globalPercentage,
        } satisfies SpeakA2CorrectionSummary,
        retryCount: nextRetryCount,
    };
}

export async function evaluateMockExamSpeakBranchSection(params: { compilationId: string; sessionKey: string; isRetry?: boolean }) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const isAdmin = session?.user?.isAdmin === true;
    const compilationId = String(params.compilationId || "");
    const sessionKey = String(params.sessionKey || "");
    const isRetry = params.isRetry === true;

    if (!userId || !compilationId || !sessionKey) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const activeSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { userId, compilationId, sessionKey });
    if (!activeSession) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const currentRetryCount = Number(activeSession.speakBranchCorrectionRetryCount || 0);
    let nextRetryCount = currentRetryCount;
    if (isRetry && !isAdmin) {
        if (currentRetryCount >= SPEAK_BRANCH_MAX_MANUAL_RETRIES) {
            return {
                ok: false as const,
                error: `Vous avez atteint le maximum de ${SPEAK_BRANCH_MAX_MANUAL_RETRIES} relances de correction IA.`,
                retryCount: currentRetryCount,
            };
        }
        nextRetryCount = currentRetryCount + 1;
        await patchSession(sessionKey, {
            set: {
                speakBranchCorrectionRetryCount: nextRetryCount,
            },
        });
    }

    const compilation = await getCompilation(compilationId);
    const branchA1TaskIds = (compilation?.examConfig?.speakBranchTaskIds?.A1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const branchB1TaskIds = (compilation?.examConfig?.speakBranchTaskIds?.B1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const allBranchTaskIds = Array.from(new Set([...branchA1TaskIds, ...branchB1TaskIds]));
    if (!allBranchTaskIds.length) {
        return { ok: false as const, error: "Aucune tâche de branche disponible." };
    }

    const currentAnswers = Array.isArray(activeSession.speakBranchAnswers) ? activeSession.speakBranchAnswers : [];
    if (!currentAnswers.length) {
        return { ok: false as const, error: "Aucune réponse de branche à corriger." };
    }

    const answeredTaskIds = new Set(currentAnswers.map((answer) => getAnswerTaskId(answer)).filter(Boolean));
    const hasB1Answers = branchB1TaskIds.some((taskId) => answeredTaskIds.has(taskId));
    const hasA1Answers = branchA1TaskIds.some((taskId) => answeredTaskIds.has(taskId));
    const chosenBranch: OralBranch = activeSession.oralBranch?.chosen || (hasB1Answers ? "B1" : hasA1Answers ? "A1" : "A1");

    const scopedTaskIds = chosenBranch === "B1" ? branchB1TaskIds : branchA1TaskIds;
    const branchTasks = await getMockExamTasksByIds(scopedTaskIds);
    const tasksById = new Map(branchTasks.map((task) => [task._id, task]));
    const nextAnswers = [...currentAnswers];
    const taskResults: SpeakA2CorrectionTaskResult[] = [];

    const updateAnswerScoreAndFeedback = ({ taskId, activityKey, score, feedback }: { taskId: string; activityKey?: string; score: number; feedback: string }) => {
        for (let index = 0; index < nextAnswers.length; index += 1) {
            const answer = nextAnswers[index];
            if (getAnswerTaskId(answer) !== taskId) continue;
            if (activityKey && answer.activityKey !== activityKey) continue;
            nextAnswers[index] = {
                ...answer,
                AiFeedback: feedback,
                AiScore: score,
            };
        }
    };

    if (chosenBranch === "B1") {
        for (const taskId of scopedTaskIds) {
            const task = tasksById.get(taskId);
            if (!task || task.taskType !== "DISCUSSION_B1") continue;

            const answersForTask = currentAnswers.filter((answer) => getAnswerTaskId(answer) === taskId);
            const answerByActivity = new Map(answersForTask.map((answer) => [answer.activityKey, answer] as const));

            for (let index = 0; index < (task.activities || []).length; index += 1) {
                const activity = task.activities[index];
                const answer = answerByActivity.get(activity._key);
                const transcript = String(answer?.transcriptFinal || "").trim();
                if (!transcript) continue;

                const question = toPortableTextPlain(activity?.promptText);
                const prompt = buildDiscussionB1PerQuestionPrompt({
                    question,
                    transcription: transcript,
                    aiCorrectionContext: String(activity?.aiCorrectionContext || "").trim(),
                });

                try {
                    const { parsed, feedback } = await requestModelCorrection(prompt, { taskId: task._id, activityKey: activity._key });
                    const score = clampTaskScoreWithMax(parsed?.scores ?? parsed?.score, 6);
                    updateAnswerScoreAndFeedback({ taskId, activityKey: activity._key, score, feedback });
                    taskResults.push({
                        taskId,
                        taskType: task.taskType,
                        activityKey: activity._key,
                        label: `Question ${index + 1}`,
                        score,
                        max: 6,
                        feedback,
                    });
                } catch (error) {
                    const feedback = "La correction IA a échoué pour cette question. Vous pouvez réessayer.";
                    updateAnswerScoreAndFeedback({ taskId, activityKey: activity._key, score: 0, feedback });
                    taskResults.push({
                        taskId,
                        taskType: task.taskType,
                        activityKey: activity._key,
                        label: `Question ${index + 1}`,
                        score: 0,
                        max: 6,
                        feedback,
                        error: error instanceof Error ? error.message : "unknown_error",
                    });
                }
            }
        }
    } else {
        for (const taskId of scopedTaskIds) {
            const task = tasksById.get(taskId);
            if (!task || !SPEAK_BRANCH_SUPPORTED_TASK_TYPES.has(task.taskType as Extract<SpeakingCorrectionTaskType, "IMAGE_DESCRIPTION_A1_T1" | "IMAGE_DESCRIPTION_A1_T2" | "DISCUSSION_B1">)) {
                continue;
            }

            const answersForTask = currentAnswers.filter((answer) => getAnswerTaskId(answer) === taskId);
            const hasAnyTranscript = answersForTask.some((answer) => String(answer?.transcriptFinal || "").trim().length > 0);
            if (!hasAnyTranscript) continue;

            const answerByActivity = new Map(answersForTask.map((answer) => [answer.activityKey, answer] as const));
            const activitiesTexts = (task.activities || []).map((activity) => toPortableTextPlain(activity?.promptText));
            const aiCorrectionContext = (task.activities || []).map((activity) => String(activity?.aiCorrectionContext || "").trim());
            const transcriptions = (task.activities || []).map((activity) => String(answerByActivity.get(activity._key)?.transcriptFinal || "").trim());
            const prompt = buildSpeakingA2CorrectionPrompt({
                taskType: task.taskType as SpeakingCorrectionTaskType,
                activitiesTexts,
                aiCorrectionContext,
                transcriptions,
            });
            const taskMax = task.taskType === "DISCUSSION_B1" ? 6 : 4;

            try {
                const { parsed, feedback } = await requestModelCorrection(prompt, { taskId: task._id });
                const score = clampTaskScoreWithMax(parsed?.scores ?? parsed?.score, taskMax);
                updateAnswerScoreAndFeedback({ taskId, score, feedback });
                taskResults.push({
                    taskId,
                    taskType: task.taskType,
                    label: String(task.title || "").trim() || task.taskType,
                    score,
                    max: taskMax,
                    feedback,
                });
            } catch (error) {
                const feedback = "La correction IA a échoué pour cette tâche. Vous pouvez réessayer.";
                updateAnswerScoreAndFeedback({ taskId, score: 0, feedback });
                taskResults.push({
                    taskId,
                    taskType: task.taskType,
                    label: String(task.title || "").trim() || task.taskType,
                    score: 0,
                    max: taskMax,
                    feedback,
                    error: error instanceof Error ? error.message : "unknown_error",
                });
            }
        }
    }

    if (!taskResults.length) {
        return { ok: false as const, error: "Aucune transcription exploitable pour la branche." };
    }

    const totalScore = taskResults.reduce((sum, item) => sum + Number(item.score || 0), 0);
    const totalMax = taskResults.reduce((sum, item) => sum + Number(item.max || 0), 0);
    const globalPercentage = totalMax > 0 ? clampPercentage((totalScore / totalMax) * 100) : 0;
    const sectionLabel = chosenBranch === "B1" ? "Parler Branche B1" : "Parler Branche A1";
    const globalFeedback = await requestMiniSectionFeedback(sectionLabel, nextAnswers.map((answer) => String(answer?.transcriptFinal || "").trim()).filter(Boolean));

    const nextScores = {
        ...sanitizeSessionScores(activeSession.scores),
        speakBranch: {
            percentage: globalPercentage,
            feedback: globalFeedback,
        },
    };

    await patchSession(sessionKey, {
        set: {
            speakBranchAnswers: nextAnswers,
            scores: nextScores,
            speakBranchCorrectionRetryCount: nextRetryCount,
        },
    });

    return {
        ok: true as const,
        branch: chosenBranch,
        answers: nextAnswers,
        summary: {
            tasks: taskResults,
            total: {
                score: totalScore,
                max: totalMax,
            },
            globalFeedback,
            globalPercentage,
        } satisfies SpeakBranchCorrectionSummary,
        retryCount: nextRetryCount,
    };
}

export async function evaluateMockExamReadWriteSection(params: { compilationId: string; sessionKey: string; isRetry?: boolean }) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const isAdmin = session?.user?.isAdmin === true;
    const compilationId = String(params.compilationId || "");
    const sessionKey = String(params.sessionKey || "");
    const isRetry = params.isRetry === true;

    if (!userId || !compilationId || !sessionKey) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const activeSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { userId, compilationId, sessionKey });
    if (!activeSession) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const currentRetryCount = Number(activeSession.readWriteCorrectionRetryCount || 0);
    let nextRetryCount = currentRetryCount;
    if (isRetry && !isAdmin) {
        if (currentRetryCount >= READ_WRITE_MAX_MANUAL_RETRIES) {
            return {
                ok: false as const,
                error: `Vous avez atteint le maximum de ${READ_WRITE_MAX_MANUAL_RETRIES} relances de correction IA.`,
                retryCount: currentRetryCount,
            };
        }
        nextRetryCount = currentRetryCount + 1;
        await patchSession(sessionKey, {
            set: {
                readWriteCorrectionRetryCount: nextRetryCount,
            },
        });
    }

    const writtenCombo: WrittenCombo = activeSession.writtenCombo?.chosen || activeSession.writtenCombo?.recommended || "A1_A2";
    const compilation = await getCompilation(compilationId);
    const scopedTaskIds =
        writtenCombo === "A2_B1"
            ? ((compilation?.examConfig?.readWriteTaskIds?.A2_B1 || []).map((ref) => ref?._ref).filter(Boolean) as string[])
            : ((compilation?.examConfig?.readWriteTaskIds?.A1_A2 || []).map((ref) => ref?._ref).filter(Boolean) as string[]);

    if (!scopedTaskIds.length) {
        return { ok: false as const, error: "Aucune tâche Lire/Écrire disponible pour ce parcours." };
    }

    const readWriteTasks = await getMockExamTasksByIds(scopedTaskIds);
    const taskById = new Map(readWriteTasks.map((task) => [task._id, task]));
    const currentAnswers = Array.isArray(activeSession.readWriteAnswers) ? activeSession.readWriteAnswers : [];
    if (!currentAnswers.length) {
        return { ok: false as const, error: "Aucune réponse Lire/Écrire à corriger." };
    }

    const toAnswerKey = (taskId: string, activityKey: string, questionKey: string) => `${taskId}::${activityKey}::${questionKey}`;
    const currentAnswerByKey = new Map<string, ReadWriteAnswer>();
    const nextAnswers = [...currentAnswers];
    const nextAnswerIndexByKey = new Map<string, number>();
    for (let index = 0; index < nextAnswers.length; index += 1) {
        const answer = nextAnswers[index];
        const taskId = getAnswerTaskId(answer);
        const activityKey = String(answer?.activityKey || "");
        const questionKey = String(answer?.questionKey || "");
        if (!taskId || !activityKey || !questionKey) continue;
        const key = toAnswerKey(taskId, activityKey, questionKey);
        currentAnswerByKey.set(key, answer);
        nextAnswerIndexByKey.set(key, index);
    }

    const rows: ReadWriteCorrectionQuestionResult[] = [];
    type ReadWriteCorrectionJob = {
        answerKey: string;
        rowBase: Omit<ReadWriteCorrectionQuestionResult, "score" | "feedback" | "error"> & { max: number };
        prompt?: string;
        taskId: string;
        activityKey: string;
        itemType: string;
        missingAnswer?: boolean;
    };
    type ReadWriteSingleChoiceQuestionJob = {
        answerKey: string;
        rowBase: Omit<ReadWriteCorrectionQuestionResult, "score" | "feedback" | "error"> & { max: number };
        questionKey: string;
        questionNumber: number;
        questionText: string;
        studentAnswer: string;
        studentSelectedOption: string;
        expectedCorrectOption: string;
        answerOptionsWithCorrectness: string;
        aiCorrectionContextQuestion: string;
        missingAnswer: boolean;
        isCorrectSelection: boolean;
    };
    type ReadWriteSingleChoiceActivityJob = {
        taskId: string;
        activityKey: string;
        moduleNumber: number;
        moduleTitle: string;
        activityNumber: number;
        activityTitle: string;
        activityPromptText: string;
        instructionText: string;
        instructionImageAlternativeText: string;
        aiCorrectionContextActivity: string;
        questions: ReadWriteSingleChoiceQuestionJob[];
    };
    type ReadWriteTextExtractQuestionJob = {
        answerKey: string;
        rowBase: Omit<ReadWriteCorrectionQuestionResult, "score" | "feedback" | "error"> & { max: number };
        questionKey: string;
        questionNumber: number;
        questionText: string;
        studentAnswer: string;
        sourceTextReference: string;
        aiCorrectionContextQuestion: string;
        missingAnswer: boolean;
    };
    type ReadWriteTextExtractActivityJob = {
        taskId: string;
        activityKey: string;
        moduleNumber: number;
        moduleTitle: string;
        activityNumber: number;
        activityTitle: string;
        activityPromptText: string;
        instructionText: string;
        instructionImageAlternativeText: string;
        aiCorrectionContextActivity: string;
        questions: ReadWriteTextExtractQuestionJob[];
    };

    const jobs: ReadWriteCorrectionJob[] = [];
    const singleChoiceActivityJobs: ReadWriteSingleChoiceActivityJob[] = [];
    const textExtractActivityJobs: ReadWriteTextExtractActivityJob[] = [];

    for (let taskIndex = 0; taskIndex < scopedTaskIds.length; taskIndex += 1) {
        const taskId = scopedTaskIds[taskIndex];
        const task = taskById.get(taskId);
        if (!task) continue;

        const moduleNumber = getReadWriteModuleNumber(String(task.taskType || ""), writtenCombo) || taskIndex + 1;
        const moduleTitle = String(task?.title || "").trim() || String(task.taskType || "");

        for (let activityIndex = 0; activityIndex < (task.activities || []).length; activityIndex += 1) {
            const activity = task.activities[activityIndex];
            const activityKey = String(activity?._key || "");
            if (!activityKey) continue;

            const items = Array.isArray(activity?.items) ? activity.items : [];
            const instructionItem = items.find((item) => String(item?.itemType || "") === "instruction");
            const questionItems = items.filter((item) => isReadWriteQuestionType(item?.itemType));
            const isSingleChoiceOnlyActivity = questionItems.length > 0 && questionItems.every((item) => String(item?.itemType || "") === "single_choice");
            const isTextExtractOnlyActivity = questionItems.length > 0 && questionItems.every((item) => String(item?.itemType || "") === "text_extract");
            const activityNumber = (moduleNumber - 1) * 2 + activityIndex + 1;
            const activityTitle = String(activity?.title || "").trim() || `Tâche ${activityNumber}`;
            const instructionText = toPortableTextPlain(instructionItem?.contentText);
            const instructionImageAlternativeText = toPortableTextPlain(instructionItem?.imageAlternativeText);
            const activityPromptText = toPortableTextPlain(activity?.promptText);
            const aiCorrectionContextActivity = String(activity?.aiCorrectionContext || "").trim();

            const singleChoiceActivityJob: ReadWriteSingleChoiceActivityJob | null = isSingleChoiceOnlyActivity
                ? {
                      taskId,
                      activityKey,
                      moduleNumber,
                      moduleTitle,
                      activityNumber,
                      activityTitle,
                      activityPromptText,
                      instructionText,
                      instructionImageAlternativeText,
                      aiCorrectionContextActivity,
                      questions: [],
                  }
                : null;
            const textExtractActivityJob: ReadWriteTextExtractActivityJob | null = isTextExtractOnlyActivity
                ? {
                      taskId,
                      activityKey,
                      moduleNumber,
                      moduleTitle,
                      activityNumber,
                      activityTitle,
                      activityPromptText,
                      instructionText,
                      instructionImageAlternativeText,
                      aiCorrectionContextActivity,
                      questions: [],
                  }
                : null;

            for (let questionIndex = 0; questionIndex < questionItems.length; questionIndex += 1) {
                const item = questionItems[questionIndex];
                const itemType = String(item?.itemType || "");
                if (!isReadWriteQuestionType(itemType)) continue;

                const questionKey = String(item?._key || "");
                if (!questionKey) continue;

                const rowId = `${taskId}:${activityKey}:${questionKey}`;
                const answerKey = toAnswerKey(taskId, activityKey, questionKey);
                const answer = currentAnswerByKey.get(answerKey);
                const studentAnswer = String(answer?.textAnswer || "").trim();
                const maxPoints = Math.max(1, Math.round(Number(item?.maxPoints || 1)));
                const questionNumber = questionIndex + 1;
                const questionText = String(item?.question || "").trim();
                const questionContentText = toPortableTextPlain(item?.contentText);
                const imageAlternativeText = toPortableTextPlain(item?.imageAlternativeText);
                const aiCorrectionContextQuestion = String(item?.aiCorrectionContext || "").trim();
                const numberList = parseReadWriteNumberList(questionText);
                const studentAnswerByNumberMap = parseNumberedStudentAnswer(studentAnswer, numberList);
                const studentAnswerByNumber = numberList.length
                    ? numberList.map((number) => `${number}: ${String(studentAnswerByNumberMap[number] || "")}`).join("\n")
                    : studentAnswer || "Aucune donnée.";
                const answerOptions = Array.isArray(item?.answerOptions) ? item.answerOptions : [];
                const answerOptionsWithCorrectness = answerOptions.length
                    ? answerOptions
                          .map((optionRaw, optionIndex) => {
                              if (typeof optionRaw === "string") {
                                  return `- Option ${optionIndex + 1}: ${optionRaw} (isCorrect: inconnu)`;
                              }
                              const option = optionRaw as { label?: unknown; isCorrect?: unknown };
                              const label = String(option?.label || "").trim();
                              if (!label) return "";
                              return `- ${label} (isCorrect: ${Boolean(option?.isCorrect)})`;
                          })
                          .filter(Boolean)
                          .join("\n")
                    : "Aucune donnée.";
                const expectedCorrectOptions = answerOptions
                    .map((optionRaw) => {
                        if (typeof optionRaw === "string") return "";
                        const option = optionRaw as { label?: unknown; isCorrect?: unknown };
                        const label = String(option?.label || "").trim();
                        if (!label || !Boolean(option?.isCorrect)) return "";
                        return label;
                    })
                    .filter(Boolean);
                const expectedCorrectOption = expectedCorrectOptions.length ? expectedCorrectOptions.join(" | ") : "Non renseigné.";
                const studentSelectedOption = studentAnswer || "Aucune donnée.";
                const sourceTextReference = questionContentText || imageAlternativeText || instructionImageAlternativeText || instructionText || activityPromptText || "Aucune donnée.";

                const expectedNormalized = expectedCorrectOptions.map((option) => normalizeChoiceLabel(option)).filter(Boolean);
                const isCorrectSelection = expectedNormalized.includes(normalizeChoiceLabel(studentSelectedOption));
                const rowBase = {
                    rowId,
                    taskId,
                    activityKey,
                    questionKey,
                    taskType: String(task.taskType || ""),
                    itemType,
                    moduleNumber,
                    moduleTitle,
                    activityNumber,
                    questionNumber,
                    label: `Module ${moduleNumber} • Tâche ${activityNumber} • Question ${questionNumber}`,
                    questionText,
                    studentAnswer,
                    max: maxPoints,
                };

                if (singleChoiceActivityJob) {
                    singleChoiceActivityJob.questions.push({
                        answerKey,
                        rowBase,
                        questionKey,
                        questionNumber,
                        questionText,
                        studentAnswer,
                        studentSelectedOption,
                        expectedCorrectOption,
                        answerOptionsWithCorrectness,
                        aiCorrectionContextQuestion,
                        missingAnswer: !studentAnswer,
                        isCorrectSelection,
                    });
                    continue;
                }

                if (textExtractActivityJob) {
                    textExtractActivityJob.questions.push({
                        answerKey,
                        rowBase,
                        questionKey,
                        questionNumber,
                        questionText,
                        studentAnswer,
                        sourceTextReference,
                        aiCorrectionContextQuestion,
                        missingAnswer: !studentAnswer,
                    });
                    continue;
                }

                if (!studentAnswer) {
                    jobs.push({
                        answerKey,
                        rowBase,
                        taskId,
                        activityKey,
                        itemType,
                        missingAnswer: true,
                    });
                    continue;
                }

                const prompt = buildReadWriteCorrectionPrompt({
                    questionType: itemType,
                    examLabel: writtenCombo === "A2_B1" ? "A2-B1" : "A1-A2",
                    moduleNumber: String(moduleNumber),
                    moduleTitle,
                    activityNumber: String(activityNumber),
                    activityTitle,
                    questionNumber: String(questionNumber),
                    activityPromptText,
                    instructionText,
                    instructionImageAlternativeText,
                    questionText,
                    questionContentText,
                    imageAlternativeText,
                    aiCorrectionContextActivity,
                    aiCorrectionContextQuestion,
                    studentAnswer,
                    maxPoints: String(maxPoints),
                    answerOptionsWithCorrectness,
                    studentSelectedOption,
                    expectedCorrectOption,
                    numberingExpected: numberList.join(", "),
                    studentAnswerByNumber,
                    sourceTextReference,
                });

                console.log("[MockExam][ReadWrite] Prompt envoyé à l'IA", {
                    sessionKey,
                    taskId,
                    activityKey,
                    questionKey,
                    itemType,
                    prompt,
                });

                jobs.push({
                    answerKey,
                    rowBase,
                    prompt,
                    taskId,
                    activityKey,
                    itemType,
                });
            }

            if (singleChoiceActivityJob?.questions.length) {
                singleChoiceActivityJobs.push(singleChoiceActivityJob);
            }
            if (textExtractActivityJob?.questions.length) {
                textExtractActivityJobs.push(textExtractActivityJob);
            }
        }
    }

    const applyAnswerPatch = (answerKey: string, nextFeedback: string, nextScore: number) => {
        if (!nextAnswerIndexByKey.has(answerKey)) return;
        const answerIndex = Number(nextAnswerIndexByKey.get(answerKey));
        nextAnswers[answerIndex] = {
            ...nextAnswers[answerIndex],
            AiFeedback: nextFeedback,
            AiScore: nextScore,
        };
    };

    const BATCH_SIZE = READ_WRITE_GENERIC_BATCH_SIZE;
    for (let cursor = 0; cursor < jobs.length; cursor += BATCH_SIZE) {
        const batch = jobs.slice(cursor, cursor + BATCH_SIZE);
        const batchRows = await Promise.all(
            batch.map(async (job): Promise<ReadWriteCorrectionQuestionResult> => {
                if (job.missingAnswer || !job.prompt) {
                    const feedback = "Aucune réponse enregistrée pour cette question.";
                    applyAnswerPatch(job.answerKey, feedback, 0);
                    return {
                        ...job.rowBase,
                        score: 0,
                        feedback,
                        error: "missing_answer",
                    };
                }

                try {
                    const { parsed, feedback } = await requestModelCorrection(job.prompt, {
                        taskId: job.taskId,
                        activityKey: job.activityKey,
                    });
                    const score = clampIntegerScoreWithMax(parsed?.scores ?? parsed?.score, job.rowBase.max);
                    applyAnswerPatch(job.answerKey, feedback, score);
                    return {
                        ...job.rowBase,
                        score,
                        feedback,
                    };
                } catch (error) {
                    const feedback = "La correction IA a échoué pour cette question. Vous pouvez réessayer.";
                    applyAnswerPatch(job.answerKey, feedback, 0);
                    return {
                        ...job.rowBase,
                        score: 0,
                        feedback,
                        error: error instanceof Error ? error.message : "unknown_error",
                    };
                }
            }),
        );
        rows.push(...batchRows);
    }

    const SINGLE_CHOICE_ACTIVITY_BATCH_SIZE = READ_WRITE_SINGLE_CHOICE_ACTIVITY_BATCH_SIZE;
    for (let cursor = 0; cursor < singleChoiceActivityJobs.length; cursor += SINGLE_CHOICE_ACTIVITY_BATCH_SIZE) {
        const batch = singleChoiceActivityJobs.slice(cursor, cursor + SINGLE_CHOICE_ACTIVITY_BATCH_SIZE);
        const batchRows = await Promise.all(
            batch.map(async (activityJob): Promise<ReadWriteCorrectionQuestionResult[]> => {
                const prompt = buildReadWriteSingleChoiceActivityPrompt({
                    examLabel: writtenCombo === "A2_B1" ? "A2-B1" : "A1-A2",
                    moduleNumber: String(activityJob.moduleNumber),
                    moduleTitle: activityJob.moduleTitle,
                    activityNumber: String(activityJob.activityNumber),
                    activityTitle: activityJob.activityTitle,
                    activityPromptText: activityJob.activityPromptText,
                    instructionText: activityJob.instructionText,
                    instructionImageAlternativeText: activityJob.instructionImageAlternativeText,
                    aiCorrectionContextActivity: activityJob.aiCorrectionContextActivity,
                    questions: activityJob.questions.map((question) => ({
                        questionKey: question.questionKey,
                        questionNumber: String(question.questionNumber),
                        questionText: question.questionText,
                        studentSelectedOption: question.studentSelectedOption,
                        expectedCorrectOption: question.expectedCorrectOption,
                        answerOptionsWithCorrectness: question.answerOptionsWithCorrectness,
                        aiCorrectionContextQuestion: question.aiCorrectionContextQuestion,
                        maxPoints: String(question.rowBase.max),
                    })),
                });

                console.log("[MockExam][ReadWrite] Prompt activité single_choice envoyé à l'IA", {
                    sessionKey,
                    taskId: activityJob.taskId,
                    activityKey: activityJob.activityKey,
                    questionCount: activityJob.questions.length,
                    prompt,
                });

                try {
                    const { parsed } = await requestModelCorrection(prompt, {
                        taskId: activityJob.taskId,
                        activityKey: activityJob.activityKey,
                    });
                    const parsedResults = extractSingleChoiceActivityResults(parsed);
                    const byQuestionKey = new Map(parsedResults.map((item) => [item.questionKey, item] as const));
                    const byQuestionNumber = new Map(parsedResults.map((item) => [item.questionNumber, item] as const));

                    return activityJob.questions.map((question) => {
                        if (question.missingAnswer) {
                            const feedback = "Aucune réponse enregistrée pour cette question.";
                            applyAnswerPatch(question.answerKey, feedback, 0);
                            return {
                                ...question.rowBase,
                                score: 0,
                                feedback,
                                error: "missing_answer",
                            };
                        }

                        const parsedItem = byQuestionKey.get(question.questionKey) || byQuestionNumber.get(String(question.questionNumber));
                        const fallbackScore = question.isCorrectSelection ? question.rowBase.max : 0;
                        const fallbackFeedback = question.isCorrectSelection ? "Bonne réponse." : `Réponse incorrecte. Réponse attendue: ${question.expectedCorrectOption || "non renseignée"}.`;
                        const score = parsedItem ? clampIntegerScoreWithMax((parsedItem as { score?: unknown }).score, question.rowBase.max) : fallbackScore;
                        const feedback = String(parsedItem?.feedback || "").trim() || fallbackFeedback;
                        applyAnswerPatch(question.answerKey, feedback, score);
                        return {
                            ...question.rowBase,
                            score,
                            feedback,
                        };
                    });
                } catch (error) {
                    return activityJob.questions.map((question) => {
                        if (question.missingAnswer) {
                            const feedback = "Aucune réponse enregistrée pour cette question.";
                            applyAnswerPatch(question.answerKey, feedback, 0);
                            return {
                                ...question.rowBase,
                                score: 0,
                                feedback,
                                error: "missing_answer",
                            };
                        }
                        const feedback = "La correction IA a échoué pour cette question. Vous pouvez réessayer.";
                        applyAnswerPatch(question.answerKey, feedback, 0);
                        return {
                            ...question.rowBase,
                            score: 0,
                            feedback,
                            error: error instanceof Error ? error.message : "unknown_error",
                        };
                    });
                }
            }),
        );
        rows.push(...batchRows.flat());
    }

    const TEXT_EXTRACT_ACTIVITY_BATCH_SIZE = READ_WRITE_TEXT_EXTRACT_ACTIVITY_BATCH_SIZE;
    for (let cursor = 0; cursor < textExtractActivityJobs.length; cursor += TEXT_EXTRACT_ACTIVITY_BATCH_SIZE) {
        const batch = textExtractActivityJobs.slice(cursor, cursor + TEXT_EXTRACT_ACTIVITY_BATCH_SIZE);
        const batchRows = await Promise.all(
            batch.map(async (activityJob): Promise<ReadWriteCorrectionQuestionResult[]> => {
                const prompt = buildReadWriteTextExtractActivityPrompt({
                    examLabel: writtenCombo === "A2_B1" ? "A2-B1" : "A1-A2",
                    moduleNumber: String(activityJob.moduleNumber),
                    moduleTitle: activityJob.moduleTitle,
                    activityNumber: String(activityJob.activityNumber),
                    activityTitle: activityJob.activityTitle,
                    activityPromptText: activityJob.activityPromptText,
                    instructionText: activityJob.instructionText,
                    instructionImageAlternativeText: activityJob.instructionImageAlternativeText,
                    aiCorrectionContextActivity: activityJob.aiCorrectionContextActivity,
                    questions: activityJob.questions.map((question) => ({
                        questionKey: question.questionKey,
                        questionNumber: String(question.questionNumber),
                        questionText: question.questionText,
                        studentAnswer: question.studentAnswer,
                        sourceTextReference: question.sourceTextReference,
                        aiCorrectionContextQuestion: question.aiCorrectionContextQuestion,
                        maxPoints: String(question.rowBase.max),
                    })),
                });

                console.log("[MockExam][ReadWrite] Prompt activité text_extract envoyé à l'IA", {
                    sessionKey,
                    taskId: activityJob.taskId,
                    activityKey: activityJob.activityKey,
                    questionCount: activityJob.questions.length,
                    prompt,
                });

                try {
                    const { parsed } = await requestModelCorrection(prompt, {
                        taskId: activityJob.taskId,
                        activityKey: activityJob.activityKey,
                    });
                    const parsedResults = extractSingleChoiceActivityResults(parsed);
                    const byQuestionKey = new Map(parsedResults.map((item) => [item.questionKey, item] as const));
                    const byQuestionNumber = new Map(parsedResults.map((item) => [item.questionNumber, item] as const));

                    return activityJob.questions.map((question) => {
                        if (question.missingAnswer) {
                            const feedback = "Aucune réponse enregistrée pour cette question.";
                            applyAnswerPatch(question.answerKey, feedback, 0);
                            return {
                                ...question.rowBase,
                                score: 0,
                                feedback,
                                error: "missing_answer",
                            };
                        }

                        const parsedItem = byQuestionKey.get(question.questionKey) || byQuestionNumber.get(String(question.questionNumber));
                        const fallbackScore = 0;
                        const fallbackFeedback = "Correction disponible, mais résultat question indisponible.";
                        const score = parsedItem ? clampIntegerScoreWithMax((parsedItem as { score?: unknown }).score, question.rowBase.max) : fallbackScore;
                        const feedback = String(parsedItem?.feedback || "").trim() || fallbackFeedback;
                        applyAnswerPatch(question.answerKey, feedback, score);
                        return {
                            ...question.rowBase,
                            score,
                            feedback,
                        };
                    });
                } catch (error) {
                    return activityJob.questions.map((question) => {
                        if (question.missingAnswer) {
                            const feedback = "Aucune réponse enregistrée pour cette question.";
                            applyAnswerPatch(question.answerKey, feedback, 0);
                            return {
                                ...question.rowBase,
                                score: 0,
                                feedback,
                                error: "missing_answer",
                            };
                        }
                        const feedback = "La correction IA a échoué pour cette question. Vous pouvez réessayer.";
                        applyAnswerPatch(question.answerKey, feedback, 0);
                        return {
                            ...question.rowBase,
                            score: 0,
                            feedback,
                            error: error instanceof Error ? error.message : "unknown_error",
                        };
                    });
                }
            }),
        );
        rows.push(...batchRows.flat());
    }

    if (!rows.length) {
        return { ok: false as const, error: "Aucune question Lire/Écrire exploitable à corriger." };
    }

    const moduleBuckets = new Map<
        string,
        {
            moduleKey: string;
            taskId: string;
            taskType: string;
            moduleNumber: number;
            moduleTitle: string;
            score: number;
            max: number;
            rows: ReadWriteCorrectionQuestionResult[];
        }
    >();

    for (const row of rows) {
        const moduleKey = `${row.taskId}:${row.moduleNumber}`;
        if (!moduleBuckets.has(moduleKey)) {
            moduleBuckets.set(moduleKey, {
                moduleKey,
                taskId: row.taskId,
                taskType: row.taskType,
                moduleNumber: row.moduleNumber,
                moduleTitle: row.moduleTitle,
                score: 0,
                max: 0,
                rows: [],
            });
        }
        const bucket = moduleBuckets.get(moduleKey)!;
        bucket.score += Number(row.score || 0);
        bucket.max += Number(row.max || 0);
        bucket.rows.push(row);
    }

    const totalScore = rows.reduce((sum, row) => sum + Number(row.score || 0), 0);
    const totalMax = rows.reduce((sum, row) => sum + Number(row.max || 0), 0);
    const globalPercentage = totalMax > 0 ? clampPercentage((totalScore / totalMax) * 100) : 0;
    const sectionLabel = writtenCombo === "A2_B1" ? "Lire/Écrire A2-B1" : "Lire/Écrire A1-A2";
    const modulesWithFeedbackPromise = Promise.all(
        Array.from(moduleBuckets.values())
            .sort((a, b) => a.moduleNumber - b.moduleNumber)
            .map(async (bucket) => {
                const moduleLabel = `Module ${bucket.moduleNumber} - ${bucket.moduleTitle || bucket.taskType}`;
                const feedback = await requestReadWriteModuleFeedback({
                    moduleLabel,
                    score: bucket.score,
                    max: bucket.max,
                    rows: bucket.rows,
                });
                return {
                    moduleKey: bucket.moduleKey,
                    taskId: bucket.taskId,
                    taskType: bucket.taskType,
                    moduleNumber: bucket.moduleNumber,
                    moduleTitle: bucket.moduleTitle,
                    score: bucket.score,
                    max: bucket.max,
                    feedback,
                };
            }),
    );
    const globalFeedbackPromise = requestMiniSectionFeedback(sectionLabel, nextAnswers.map((answer) => String(answer?.textAnswer || "").trim()).filter(Boolean));
    const [modulesWithFeedback, globalFeedback] = await Promise.all([modulesWithFeedbackPromise, globalFeedbackPromise]);
    const validatedLevel = buildReadWriteValidatedLevel(writtenCombo, totalScore);

    const baseScores = sanitizeSessionScores(activeSession.scores);
    const nextScores: NonNullable<SessionDocument["scores"]> = {
        ...baseScores,
        readWrite: {
            percentage: globalPercentage,
            feedback: globalFeedback,
        },
    };
    const resolvedOralBranch: OralBranch = activeSession.oralBranch?.chosen === "B1" || activeSession.oralBranch?.recommended === "B1" ? "B1" : "A1";
    const totalSummary = buildMockExamTotalScoreSummary({
        scores: nextScores,
        oralBranch: resolvedOralBranch,
        readWritePercentage: globalPercentage,
    });
    if (totalSummary) {
        nextScores.total = totalSummary;
    }

    await patchSession(sessionKey, {
        set: {
            readWriteAnswers: nextAnswers,
            scores: nextScores,
            readWriteCorrectionRetryCount: nextRetryCount,
        },
    });

    return {
        ok: true as const,
        writtenCombo,
        answers: nextAnswers,
        summary: {
            writtenCombo,
            modules: modulesWithFeedback,
            rows,
            total: {
                score: totalScore,
                max: totalMax,
            },
            globalFeedback,
            globalPercentage,
            validatedLevel,
        } satisfies ReadWriteCorrectionSummary,
        retryCount: nextRetryCount,
    };
}

export async function restartMockExamCompilation(formData: FormData) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const compilationId = String(formData.get("compilationId") || "");
    if (!userId || !compilationId) return;

    const createResult = await getOrCreateInProgressMockExamSession(compilationId, { forceNew: true });
    if (!createResult.ok || !createResult.session?._id) {
        redirect(`/mock-exams/${compilationId}`);
    }

    redirect(`/mock-exams/${compilationId}/runner`);
}

export async function advanceMockExamResume(params: {
    compilationId: string;
    sessionKey: string;
    nextState: string;
    taskId?: string;
    activityKey?: string;
    oralBranchChosen?: OralBranch;
    oralBranchRecommended?: OralBranch;
    writtenComboChosen?: WrittenCombo;
    writtenComboRecommended?: WrittenCombo;
}) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    if (!userId || !params.compilationId || !params.sessionKey || !params.nextState) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const activeSession = await client.fetch<{ _id?: string } | null>(
        groq`
      *[
        _type == "mockExamSession" &&
        _id == $sessionKey &&
        userRef._ref == $userId &&
        compilationRef._ref == $compilationId &&
        status == "in_progress"
      ][0]{ _id }
    `,
        {
            sessionKey: params.sessionKey,
            userId,
            compilationId: params.compilationId,
        },
    );

    if (!activeSession?._id) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const resume: ResumePointer = {
        state: params.nextState,
        taskId: params.taskId,
        activityKey: params.activityKey,
        updatedAt: new Date().toISOString(),
    };

    const chosenBranch = params.oralBranchChosen === "A1" || params.oralBranchChosen === "B1" ? params.oralBranchChosen : undefined;
    const recommendedBranch = params.oralBranchRecommended === "A1" || params.oralBranchRecommended === "B1" ? params.oralBranchRecommended : undefined;
    const chosenWrittenCombo = params.writtenComboChosen === "A1_A2" || params.writtenComboChosen === "A2_B1" ? params.writtenComboChosen : undefined;
    const recommendedWrittenCombo = params.writtenComboRecommended === "A1_A2" || params.writtenComboRecommended === "A2_B1" ? params.writtenComboRecommended : undefined;
    const setPayload: Record<string, unknown> = { resume };
    if (recommendedBranch) {
        setPayload["oralBranch.recommended"] = recommendedBranch;
    }
    if (chosenBranch) {
        setPayload["oralBranch.chosen"] = chosenBranch;
    }
    if (recommendedWrittenCombo) {
        setPayload["writtenCombo.recommended"] = recommendedWrittenCombo;
    }
    if (chosenWrittenCombo) {
        setPayload["writtenCombo.chosen"] = chosenWrittenCombo;
    }

    await patchSession(params.sessionKey, { set: setPayload });
    return { ok: true as const, resume };
}
