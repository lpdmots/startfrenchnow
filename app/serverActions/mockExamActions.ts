"use server";

import { v4 as uuidv4 } from "uuid";
import { groq } from "next-sanity";
import { redirect } from "next/navigation";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import clientOpenai from "@/app/lib/openAi.client";
import { MOCK_EXAM_COMPILATION_QUERY, MOCK_EXAM_TASKS_BY_IDS_QUERY, MOCK_EXAM_USER_COMPILATIONS_QUERY, USER_MOCK_EXAM_CREDITS_QUERY } from "@/app/lib/groqQueries";
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
    buildDiscussionB1PerQuestionPrompt,
    buildSpeakingA2CorrectionPrompt,
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
const SPEAK_A2_CORRECTION_MODEL = process.env.OPENAI_CORRECTION_MODEL_MOCK_EXAM || process.env.OPENAI_CORRECTION_MODEL || "gpt-4o-mini";
const SPEAK_A2_CORRECTION_TIMEOUT_MS = Number(process.env.OPENAI_CORRECTION_TIMEOUT_MS || 12000);
const SPEAK_A2_CORRECTION_FALLBACK_MODEL = process.env.OPENAI_CORRECTION_FALLBACK_MODEL || "gpt-4o-mini";
const SPEAK_A2_MAX_MANUAL_RETRIES = 3;
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
  *[_type == "examCompilation" && isActive == true]{
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

    const [entries, activeCompilations] = await Promise.all([getUserCompilationEntries(userId), client.fetch<Array<{ _id: string }>>(ACTIVE_COMPILATION_IDS_QUERY)]);
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
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
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
        const existing = await getInProgressSessionsForCompilation(userId, compilationId);
        if (existing[0]) {
            if (existing.length > 1) {
                const staleSessions = existing.slice(1);
                const staleSessionIds = staleSessions.map((stale) => stale._id);
                await removeSessionRefsFromUser(userId, staleSessionIds);
                let tx = client.transaction();
                for (const stale of staleSessions) {
                    tx = tx.delete(stale._id);
                }
                await tx.commit({ autoGenerateArrayKeys: true });
            }
            return { ok: true as const, session: existing[0], created: false as const };
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
    });
    await tx.commit({ autoGenerateArrayKeys: true });

    await appendSessionRefToUserCompilation(userId, compilationId, newSession._id);

    return {
        ok: true as const,
        created: true as const,
        session: mapSessionDocumentToLite(newSession),
    };
}

export async function purchaseMockExamCompilation() {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    if (!userId) {
        return { ok: false as const, error: "Utilisateur introuvable." };
    }

    const entries = await getUserCompilationEntries(userId);
    if (!entries) {
        return { ok: false as const, error: "Utilisateur introuvable." };
    }
    const ownedIds = new Set(entries.map((entry) => entry.compilationId).filter(Boolean) as string[]);

    const activeCompilations = await client.fetch<Array<{ _id: string }>>(ACTIVE_COMPILATION_IDS_QUERY);
    const available = (activeCompilations || []).map((item) => item._id).filter((id) => id && !ownedIds.has(id));
    if (!available.length) {
        return { ok: false as const, error: "Aucune nouvelle compilation disponible pour le moment." };
    }

    const creditCheck = await consumeMockExamCredit(userId);
    if (!creditCheck.ok) {
        return { ok: false as const, error: "Vous n'avez plus de crédits disponibles." };
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const compilationId = available[randomIndex];
    const now = new Date().toISOString();

    await client
        .transaction()
        .patch(userId, (patch) =>
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

export async function saveMockExamSpeakingAnswer(params: { compilationId: string; sessionKey: string; taskId: string; activityKey: string; audioUrl: string; transcriptFinal: string }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
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

export async function saveMockExamReadWriteAnswer(params: {
    compilationId: string;
    sessionKey: string;
    taskId: string;
    activityKey: string;
    questionKey: string;
    textAnswer: string;
}) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
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
    const existingIndex = currentAnswers.findIndex(
        (item) => getAnswerTaskId(item) === taskId && item.activityKey === activityKey && String(item.questionKey || "") === questionKey,
    );
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
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
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
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
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

export async function evaluateMockExamSpeakBranchSection(params: { compilationId: string; sessionKey: string }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const compilationId = String(params.compilationId || "");
    const sessionKey = String(params.sessionKey || "");

    if (!userId || !compilationId || !sessionKey) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const activeSession = await client.fetch<SessionDocument | null>(MOCK_EXAM_SESSION_ACCESS_QUERY, { userId, compilationId, sessionKey });
    if (!activeSession) {
        return { ok: false as const, error: "Session introuvable." };
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
    };
}

export async function restartMockExamCompilation(formData: FormData) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const compilationId = String(formData.get("compilationId") || "");
    if (!userId || !compilationId) return null;

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
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
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
