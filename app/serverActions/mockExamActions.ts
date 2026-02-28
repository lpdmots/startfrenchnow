"use server";

import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import {
    MOCK_EXAM_COMPILATION_QUERY,
    MOCK_EXAM_LISTENING_PACKS_BY_LEVEL_QUERY,
    MOCK_EXAM_TASKS_BY_IDS_QUERY,
    MOCK_EXAM_TASKS_BY_TYPE_QUERY,
    MOCK_EXAM_USER_COMPILATIONS_QUERY,
    USER_MOCK_EXAM_CREDITS_QUERY,
} from "@/app/lib/groqQueries";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import { redirect } from "next/navigation";
import { groq } from "next-sanity";
import { v4 as uuidv4 } from "uuid";
import type { Image } from "@/app/types/sfn/blog";
import type {
    MockExamConfigRef,
    MockExamSession,
    OralBranch,
    ReadWriteAnswer,
    ScoreSummary,
    SessionStatus,
    SpeakingAnswer,
    WrittenCombo,
    TaskType,
} from "@/app/types/fide/mock-exam";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";

export type MockExamSessionLite = {
    _key: string;
    status: SessionStatus;
    startedAt: string;
    resume?: { state: string; taskId?: string; activityKey?: string; updatedAt?: string };
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
    image?: Image;
    _createdAt?: string;
    _updatedAt?: string;
    userId?: string;
    examConfig?: MockExamConfigRef;
    oralBranch?: { recommended: OralBranch; chosen?: OralBranch };
    writtenCombo?: { recommended: WrittenCombo; chosen?: WrittenCombo };
    session?: MockExamSessionLite[];
};

export type UserMockExamCredit = {
    _key?: string;
    referenceKey: string;
    totalCredits?: number;
    remainingCredits?: number;
} | null;

const SPEAK_A2_TYPES: TaskType[] = ["IMAGE_DESCRIPTION_A2", "PHONE_CONVERSATION_A2", "DISCUSSION_A2"];
const SPEAK_BRANCH_A1_TYPES: TaskType[] = ["IMAGE_DESCRIPTION_A1_T1", "IMAGE_DESCRIPTION_A1_T2"];
const SPEAK_BRANCH_B1_TYPES: TaskType[] = ["DISCUSSION_B1"];
const READ_WRITE_A1_A2_TYPES: TaskType[] = ["READ_WRITE_M1", "READ_WRITE_M2", "READ_WRITE_M3_M4"];
const READ_WRITE_A2_B1_TYPES: TaskType[] = ["READ_WRITE_M3_M4", "READ_WRITE_M5", "READ_WRITE_M6"];

const toRef = (id: string) => ({ _type: "reference" as const, _ref: id });

type MockExamTaskLite = {
    _id: string;
    taskType: TaskType;
    firstActivityImage?: Image;
};

const pickFirstTaskByType = (tasks: MockExamTaskLite[], type: TaskType) => tasks.find((t) => t.taskType === type);

const pickFirstRefByType = (tasks: MockExamTaskLite[], type: TaskType, usedTaskIds?: Set<string>) => {
    const byType = tasks.filter((t) => t.taskType === type);
    const foundUnused = usedTaskIds ? byType.find((t) => !usedTaskIds.has(t._id)) : undefined;
    const found = foundUnused || byType[0];

    return {
        refs: found?._id ? [toRef(found._id)] : [],
        reused: !!found && !!usedTaskIds && !foundUnused && usedTaskIds.has(found._id),
    };
};

const MOCK_EXAM_PREVIOUS_CONFIGS_QUERY = groq`
  *[_type == "examCompilation" && userId == $userId]{
    examConfig{
      speakA2TaskIds[]{_ref},
      speakBranchTaskIds{
        A1[]{_ref},
        B1[]{_ref}
      },
      readWriteTaskIds{
        A1_A2[]{_ref},
        A2_B1[]{_ref}
      }
    }
  }
`;

function collectUsedTaskIds(previousConfigs: Array<{ examConfig?: MockExamConfigRef }>): Set<string> {
    const used = new Set<string>();
    for (const compilation of previousConfigs) {
        const config = compilation.examConfig;
        if (!config) continue;

        const buckets = [
            ...(config.speakA2TaskIds || []),
            ...(config.speakBranchTaskIds?.A1 || []),
            ...(config.speakBranchTaskIds?.B1 || []),
            ...(config.readWriteTaskIds?.A1_A2 || []),
            ...(config.readWriteTaskIds?.A2_B1 || []),
        ];

        for (const ref of buckets) {
            if (ref?._ref) used.add(ref._ref);
        }
    }

    return used;
}

async function buildMockExamConfig(userId: string): Promise<{ examConfig: MockExamConfigRef; compilationImage?: Image; hasReusedTasks: boolean }> {
    const allTypes = Array.from(new Set<TaskType>([
        ...SPEAK_A2_TYPES,
        ...SPEAK_BRANCH_A1_TYPES,
        ...SPEAK_BRANCH_B1_TYPES,
        ...READ_WRITE_A1_A2_TYPES,
        ...READ_WRITE_A2_B1_TYPES,
    ]));

    const [tasks, listeningA1, listeningA2, listeningB1, previousConfigs] = await Promise.all([
        client.fetch<MockExamTaskLite[]>(MOCK_EXAM_TASKS_BY_TYPE_QUERY, { types: allTypes }),
        client.fetch<Array<{ _id: string }>>(MOCK_EXAM_LISTENING_PACKS_BY_LEVEL_QUERY, { level: "A1" }),
        client.fetch<Array<{ _id: string }>>(MOCK_EXAM_LISTENING_PACKS_BY_LEVEL_QUERY, { level: "A2" }),
        client.fetch<Array<{ _id: string }>>(MOCK_EXAM_LISTENING_PACKS_BY_LEVEL_QUERY, { level: "B1" }),
        client.fetch<Array<{ examConfig?: MockExamConfigRef }>>(MOCK_EXAM_PREVIOUS_CONFIGS_QUERY, { userId }),
    ]);

    const usedTaskIds = collectUsedTaskIds(previousConfigs || []);

    const speakA2 = SPEAK_A2_TYPES.map((type) => pickFirstRefByType(tasks, type, usedTaskIds));
    const speakBranchA1 = SPEAK_BRANCH_A1_TYPES.map((type) => pickFirstRefByType(tasks, type, usedTaskIds));
    const speakBranchB1 = SPEAK_BRANCH_B1_TYPES.map((type) => pickFirstRefByType(tasks, type, usedTaskIds));
    const readWriteA1A2 = READ_WRITE_A1_A2_TYPES.map((type) => pickFirstRefByType(tasks, type, usedTaskIds));
    const readWriteA2B1 = READ_WRITE_A2_B1_TYPES.map((type) => pickFirstRefByType(tasks, type, usedTaskIds));

    const hasReusedTasks = [...speakA2, ...speakBranchA1, ...speakBranchB1, ...readWriteA1A2, ...readWriteA2B1].some((item) => item.reused);

    const examConfig: MockExamConfigRef = {
        speakA2TaskIds: speakA2.flatMap((item) => item.refs),
        speakBranchTaskIds: {
            A1: speakBranchA1.flatMap((item) => item.refs),
            B1: speakBranchB1.flatMap((item) => item.refs),
        },
        listeningPackIds: {
            A1: listeningA1?.[0]?._id ? [toRef(listeningA1[0]._id)] : [],
            A2: listeningA2?.[0]?._id ? [toRef(listeningA2[0]._id)] : [],
            B1: listeningB1?.[0]?._id ? [toRef(listeningB1[0]._id)] : [],
        },
        readWriteTaskIds: {
            A1_A2: readWriteA1A2.flatMap((item) => item.refs),
            A2_B1: readWriteA2B1.flatMap((item) => item.refs),
        },
    };

    const firstA2TaskId = examConfig.speakA2TaskIds?.[0]?._ref;
    const firstA2Task = firstA2TaskId ? tasks.find((task) => task._id === firstA2TaskId) : pickFirstTaskByType(tasks, SPEAK_A2_TYPES[0]);
    const compilationImage = firstA2Task?.firstActivityImage;

    return { examConfig, compilationImage, hasReusedTasks };
}

export async function getUserCompilations(userId: string) {
    if (!userId) return [] as ExamCompilationLite[];
    const data = await client.fetch<ExamCompilationLite[]>(MOCK_EXAM_USER_COMPILATIONS_QUERY, { userId });
    return data || [];
}

export async function getCompilation(compilationId: string) {
    if (!compilationId) return null;
    const data = await client.fetch<ExamCompilationLite | null>(MOCK_EXAM_COMPILATION_QUERY, { compilationId });
    return data || null;
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

export async function patchCompilation(compilationId: string, params: { set?: Record<string, any>; unset?: string[] }) {
    if (!compilationId) return null;
    let patch = client.patch(compilationId);
    if (params.set && Object.keys(params.set).length) patch = patch.set(params.set);
    if (params.unset && params.unset.length) patch = patch.unset(params.unset);
    return patch.commit({ autoGenerateArrayKeys: true });
}

export async function patchSession(compilationId: string, sessionKey: string, params: { set?: Record<string, any>; unset?: string[] }) {
    if (!compilationId || !sessionKey) return null;
    const set: Record<string, any> = {};
    if (params.set) {
        for (const [key, value] of Object.entries(params.set)) {
            set[`session[_key=="${sessionKey}"].${key}`] = value;
        }
    }
    const unset = params.unset?.map((path) => `session[_key=="${sessionKey}"].${path}`);

    let patch = client.patch(compilationId);
    if (Object.keys(set).length) patch = patch.set(set);
    if (unset && unset.length) patch = patch.unset(unset);
    return patch.commit({ autoGenerateArrayKeys: true });
}

export async function appendSession(compilationId: string, session: MockExamSession) {
    if (!compilationId) return null;
    return client
        .patch(compilationId)
        .setIfMissing({ session: [] })
        .append("session", [session])
        .commit({ autoGenerateArrayKeys: true });
}

export async function removeSession(compilationId: string, sessionKey: string) {
    if (!compilationId || !sessionKey) return null;
    return client.patch(compilationId).unset([`session[_key=="${sessionKey}"]`]).commit({ autoGenerateArrayKeys: true });
}

export async function appendSessionAnswer(
    compilationId: string,
    sessionKey: string,
    field: "speakA2Answers" | "speakBranchAnswers" | "readWriteAnswers",
    answer: SpeakingAnswer | ReadWriteAnswer,
) {
    if (!compilationId || !sessionKey) return null;
    const path = `session[_key=="${sessionKey}"].${field}`;
    return client
        .patch(compilationId)
        .setIfMissing({ [path]: [] })
        .append(path, [answer])
        .commit({ autoGenerateArrayKeys: true });
}

async function consumeMockExamCredit(userId: string) {
    const credit = await getUserMockExamCredits(userId);
    const remaining = Number(credit?.remainingCredits || 0);
    if (!credit || remaining <= 0) return { ok: false as const, remaining };

    const creditPath = credit?._key ? `credits[_key=="${credit._key}"].remainingCredits` : `credits[referenceKey=="mock_exam"][0].remainingCredits`;

    return { ok: true as const, remaining, creditPath };
}

export async function createMockExamCompilation(params?: { allowTaskReuse?: boolean }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    if (!userId) return { ok: false as const, error: "Utilisateur introuvable." };

    const creditCheck = await consumeMockExamCredit(userId);
    if (!creditCheck.ok) return { ok: false as const, error: "Vous n'avez plus de compilations disponibles." };

    const { examConfig, compilationImage, hasReusedTasks } = await buildMockExamConfig(userId);
    if (hasReusedTasks && !params?.allowTaskReuse) {
        return {
            ok: false as const,
            requiresConfirmation: true as const,
            error: "Certaines tâches de votre prochaine compilation ont déjà été utilisées. Vous pouvez continuer et créer une nouvelle compilation avec quelques tâches déjà vues, ou annuler.",
        };
    }

    const compilationId = uuidv4();

    const newCompilation = {
        _id: compilationId,
        _type: "examCompilation",
        userId,
        image: compilationImage,
        examConfig,
        oralBranch: { recommended: "A1" as OralBranch },
        writtenCombo: { recommended: "A1_A2" as WrittenCombo },
        session: [] as MockExamSession[],
    };

    let tx = client.transaction();

    tx = tx.patch(userId, (p) =>
        p
            .setIfMissing({ credits: [], examCompilations: [] })
            .set({ [creditCheck.creditPath]: creditCheck.remaining - 1 })
            .append("examCompilations", [{ _type: "reference", _ref: compilationId }]),
    );

    tx = tx.create(newCompilation as any);

    await tx.commit({ autoGenerateArrayKeys: true });

    return { ok: true as const, compilationId };
}

export async function restartMockExamCompilation(formData: FormData) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const compilationId = String(formData.get("compilationId") || "");
    if (!compilationId || !userId) return null;

    const compilation = await getCompilation(compilationId);
    if (!compilation || compilation.userId !== userId) return null;

    const inProgress = (compilation.session || []).find((s) => s.status === "in_progress");
    if (inProgress?._key) {
        await removeSession(compilationId, inProgress._key);
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

    const compilation = await getCompilation(params.compilationId);
    if (!compilation || compilation.userId !== userId) {
        return { ok: false as const, error: "Compilation introuvable." };
    }

    const activeSession = (compilation.session || []).find((entry) => entry._key === params.sessionKey);
    if (!activeSession) {
        return { ok: false as const, error: "Session introuvable." };
    }

    const resume = {
        state: params.nextState,
        taskId: params.taskId,
        activityKey: params.activityKey,
        updatedAt: new Date().toISOString(),
    };

    await patchSession(params.compilationId, params.sessionKey, { set: { resume } });

    return { ok: true as const, resume };
}
