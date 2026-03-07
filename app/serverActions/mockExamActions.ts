"use server";

import { v4 as uuidv4 } from "uuid";
import { groq } from "next-sanity";
import { redirect } from "next/navigation";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import {
    MOCK_EXAM_COMPILATION_QUERY,
    MOCK_EXAM_TASKS_BY_IDS_QUERY,
    MOCK_EXAM_USER_COMPILATIONS_QUERY,
    USER_MOCK_EXAM_CREDITS_QUERY,
} from "@/app/lib/groqQueries";
import { getAnswerTaskId } from "@/app/types/fide/mock-exam";
import type { Image } from "@/app/types/sfn/blog";
import type { MockExamConfigRef, OralBranch, ReadWriteAnswer, ResumePointer, ScoreSummary, SessionStatus, SpeakingAnswer, WrittenCombo } from "@/app/types/fide/mock-exam";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";

export type MockExamSessionLite = {
    _id: string;
    status: SessionStatus;
    startedAt: string;
    resume?: ResumePointer;
    oralBranch?: { recommended: OralBranch; chosen?: OralBranch };
    writtenCombo?: { recommended: WrittenCombo; chosen?: WrittenCombo };
    speakA2Answers?: SpeakingAnswer[];
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
    oralBranch?: { recommended: OralBranch; chosen?: OralBranch };
    writtenCombo?: { recommended: WrittenCombo; chosen?: WrittenCombo };
    speakA2Answers?: SpeakingAnswer[];
    speakBranchAnswers?: SpeakingAnswer[];
    readWriteAnswers?: ReadWriteAnswer[];
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

const DEFAULT_ORAL_BRANCH: { recommended: OralBranch; chosen?: OralBranch } = {
    recommended: "A1",
};

const DEFAULT_WRITTEN_COMBO: { recommended: WrittenCombo; chosen?: WrittenCombo } = {
    recommended: "A1_A2",
};

const toRef = (id: string) => ({ _type: "reference" as const, _ref: id });

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
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore{ score, max }
    },
    scores{
      speakA2{ score, max },
      speakBranch{ score, max },
      listening{ score, max },
      readWrite{ score, max },
      total{ score, max }
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
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore{ score, max }
    },
    speakBranchAnswers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore{ score, max }
    },
    readWriteAnswers[]{
      taskRef,
      taskId,
      activityKey,
      textAnswer,
      AiFeedback,
      AiScore{ score, max }
    },
    overtimeTaskRefs[]{ _ref, _type },
    scores{
      speakA2{ score, max },
      speakBranch{ score, max },
      listening{ score, max },
      readWrite{ score, max },
      total{ score, max }
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
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore{ score, max }
    },
    speakBranchAnswers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore{ score, max }
    },
    readWriteAnswers[]{
      taskRef,
      taskId,
      activityKey,
      textAnswer,
      AiFeedback,
      AiScore{ score, max }
    },
    overtimeTaskRefs[]{ _ref, _type },
    scores{
      speakA2{ score, max },
      speakBranch{ score, max },
      listening{ score, max },
      readWrite{ score, max },
      total{ score, max }
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
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore{ score, max }
    },
    speakBranchAnswers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore{ score, max }
    },
    readWriteAnswers[]{
      taskRef,
      taskId,
      activityKey,
      textAnswer,
      AiFeedback,
      AiScore{ score, max }
    },
    overtimeTaskRefs[]{ _ref, _type },
    scores{
      speakA2{ score, max },
      speakBranch{ score, max },
      listening{ score, max },
      readWrite{ score, max },
      total{ score, max }
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
    scores: session.scores,
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
        await client.patch(userId).set({ [setPath]: new Date().toISOString() }).commit({ autoGenerateArrayKeys: true });
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
        readWriteAnswers: [],
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
        readWriteAnswers: [],
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

export async function getUserMockExamCredits(userId: string) {
    if (!userId) return null;
    const credit = await client.fetch<UserMockExamCredit>(USER_MOCK_EXAM_CREDITS_QUERY, { userId });
    return credit || null;
}

export async function patchSession(sessionKey: string, params: { set?: Record<string, any>; unset?: string[] }) {
    if (!sessionKey) return null;
    let patch = client.patch(sessionKey);
    if (params.set && Object.keys(params.set).length) {
        patch = patch.set(params.set);
    }
    if (params.unset && params.unset.length) {
        patch = patch.unset(params.unset);
    }
    return patch.commit({ autoGenerateArrayKeys: true });
}

export async function saveMockExamSpeakingAnswer(params: {
    compilationId: string;
    sessionKey: string;
    taskId: string;
    activityKey: string;
    audioUrl: string;
    transcriptFinal: string;
}) {
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

    const answer: SpeakingAnswer = {
        taskRef: toRef(taskId),
        activityKey,
        audioUrl,
        transcriptFinal,
    };

    const currentAnswers = Array.isArray(activeSession.speakA2Answers) ? activeSession.speakA2Answers : [];
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

    await patchSession(sessionKey, { set: { speakA2Answers: nextAnswers } });
    return { ok: true as const, answer };
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
}) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    if (!userId || !params.compilationId || !params.sessionKey || !params.nextState) {
        return { ok: false as const, error: "Paramètres invalides." };
    }

    const activeSession = await client.fetch<{ _id?: string } | null>(groq`
      *[
        _type == "mockExamSession" &&
        _id == $sessionKey &&
        userRef._ref == $userId &&
        compilationRef._ref == $compilationId &&
        status == "in_progress"
      ][0]{ _id }
    `, {
        sessionKey: params.sessionKey,
        userId,
        compilationId: params.compilationId,
    });

    if (!activeSession?._id) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const resume: ResumePointer = {
        state: params.nextState,
        taskId: params.taskId,
        activityKey: params.activityKey,
        updatedAt: new Date().toISOString(),
    };

    await patchSession(params.sessionKey, { set: { resume } });
    return { ok: true as const, resume };
}
