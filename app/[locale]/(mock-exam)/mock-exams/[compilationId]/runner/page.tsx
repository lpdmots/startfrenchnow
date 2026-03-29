import { notFound, redirect } from "next/navigation";
import { requireSessionAndMockExam } from "@/app/components/auth/requireSession";
import {
    getCompilation,
    getCompilationSessions,
    getFideExamsByIds,
    getMockExamTasksByIds,
    getOrCreateInProgressMockExamSession,
    isMockExamCompilationUnlockedForUser,
    patchSession,
} from "@/app/serverActions/mockExamActions";
import type { ExamCorrectionContent, ListeningScenarioResult, ReadWriteAnswer, ResumePointer, ScoreSummary, SpeakingAnswer } from "@/app/types/fide/mock-exam";
import type { MockExamRunnerHydration } from "@/app/stores/mockExamRunnerStore";
import type { Exam } from "@/app/types/fide/exam";
import RunnerClient from "./RunnerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function MockExamRunnerPage({
    params: { compilationId },
    searchParams,
}: {
    params: { compilationId: string };
    searchParams?: { restart?: string };
}) {
    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
    const isAdmin = session?.user?.isAdmin === true;
    if (!userId) {
        notFound();
    }

    const [compilation, isUnlocked] = await Promise.all([getCompilation(compilationId), isMockExamCompilationUnlockedForUser(userId, compilationId)]);
    if (!compilation || !compilation.examConfig || compilation.isActive === false || !isUnlocked) {
        notFound();
    }
    const sessions = await getCompilationSessions(userId, compilationId);

    const shouldForceRestart = String(searchParams?.restart || "").trim() === "1";
    const sortedSessions = [...(sessions || [])].sort((a, b) => (b.resume?.updatedAt || b.startedAt || "").localeCompare(a.resume?.updatedAt || a.startedAt || ""));
    const inProgressSession = sortedSessions.find((entry) => entry.status === "in_progress");

    let runnerSession = inProgressSession;

    if (shouldForceRestart) {
        const createResult = await getOrCreateInProgressMockExamSession(compilationId, { forceNew: true });
        if (!createResult.ok || !createResult.session) {
            redirect(`/mock-exams/${compilationId}`);
        }
        runnerSession = createResult.session;
    } else if (!runnerSession) {
        const createResult = await getOrCreateInProgressMockExamSession(compilationId);
        if (!createResult.ok || !createResult.session) {
            redirect(`/mock-exams/${compilationId}`);
        }
        runnerSession = createResult.session;
    }
    if (!runnerSession) {
        redirect(`/mock-exams/${compilationId}`);
    }

    const speakA2TaskIds = (compilation.examConfig.speakA2TaskIds || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const speakBranchA1TaskIds = (compilation.examConfig.speakBranchTaskIds?.A1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const speakBranchB1TaskIds = (compilation.examConfig.speakBranchTaskIds?.B1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const listeningA1Ids = (compilation.examConfig.listeningPackIds?.A1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const listeningA2Ids = (compilation.examConfig.listeningPackIds?.A2 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const listeningB1Ids = (compilation.examConfig.listeningPackIds?.B1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const readWriteA1A2TaskIds = (compilation.examConfig.readWriteTaskIds?.A1_A2 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const readWriteA2B1TaskIds = (compilation.examConfig.readWriteTaskIds?.A2_B1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const [speakA2Tasks, speakBranchA1Tasks, speakBranchB1Tasks, listeningA1Exams, listeningA2Exams, listeningB1Exams, readWriteA1A2Tasks, readWriteA2B1Tasks] = await Promise.all([
        getMockExamTasksByIds(speakA2TaskIds),
        getMockExamTasksByIds(speakBranchA1TaskIds),
        getMockExamTasksByIds(speakBranchB1TaskIds),
        getFideExamsByIds(listeningA1Ids),
        getFideExamsByIds(listeningA2Ids),
        getFideExamsByIds(listeningB1Ids),
        getMockExamTasksByIds(readWriteA1A2TaskIds),
        getMockExamTasksByIds(readWriteA2B1TaskIds),
    ]);

    const resume: ResumePointer = {
        state: runnerSession.resume?.state || "EXAM_INTRO",
        taskId: runnerSession.resume?.taskId,
        activityKey: runnerSession.resume?.activityKey,
        updatedAt: runnerSession.resume?.updatedAt || runnerSession.startedAt || new Date().toISOString(),
    };

    if (runnerSession.status === "in_progress" && (!runnerSession.resume?.updatedAt || !runnerSession.resume?.state)) {
        await patchSession(runnerSession._id, { set: { resume } });
    }

    const hydrationData: MockExamRunnerHydration = {
        compilationId: compilation._id,
        sessionKey: runnerSession._id,
        resume,
        examConfig: compilation.examConfig,
        oralBranch: runnerSession.oralBranch || {},
        writtenCombo: runnerSession.writtenCombo || { recommended: "A1_A2" },
    };

    const initialSpeakA2Answers = ([...(runnerSession.speakA2Answers || []), ...(runnerSession.speakBranchAnswers || [])] as SpeakingAnswer[]).filter(Boolean);
    const initialSpeakA2ScoreSummary = (runnerSession.scores?.speakA2 || null) as ScoreSummary | null;
    const initialSpeakBranchScoreSummary = (runnerSession.scores?.speakBranch || null) as ScoreSummary | null;
    const initialListeningScenarioResults = ((runnerSession.listeningScenarioResults || []) as ListeningScenarioResult[]).filter(Boolean);
    const initialListeningScoreSummary = (runnerSession.scores?.listening || null) as ScoreSummary | null;
    const initialReadWriteAnswers = ((runnerSession.readWriteAnswers || []) as ReadWriteAnswer[]).filter(Boolean);
    const initialReadWriteScoreSummary = (runnerSession.scores?.readWrite || null) as ScoreSummary | null;
    const initialSpeakA2CorrectionRetryCount = Number(runnerSession.speakA2CorrectionRetryCount || 0);
    const initialSpeakBranchCorrectionRetryCount = Number(runnerSession.speakBranchCorrectionRetryCount || 0);
    const initialReadWriteCorrectionRetryCount = Number(runnerSession.readWriteCorrectionRetryCount || 0);
    const compilationCorrections = (compilation.corrections || []) as ExamCorrectionContent[];

    return (
        <RunnerClient
            key={runnerSession._id}
            hydrationData={hydrationData}
            compilationName={String(compilation.name || "")}
            compilationCorrections={compilationCorrections}
            speakA2Tasks={speakA2Tasks}
            speakBranchA1Tasks={speakBranchA1Tasks}
            speakBranchB1Tasks={speakBranchB1Tasks}
            listeningA1Exams={listeningA1Exams as Exam[]}
            listeningA2Exams={listeningA2Exams as Exam[]}
            listeningB1Exams={listeningB1Exams as Exam[]}
            readWriteA1A2Tasks={readWriteA1A2Tasks}
            readWriteA2B1Tasks={readWriteA2B1Tasks}
            initialSpeakA2Answers={initialSpeakA2Answers}
            initialSpeakA2ScoreSummary={initialSpeakA2ScoreSummary}
            initialSpeakBranchScoreSummary={initialSpeakBranchScoreSummary}
            initialListeningScenarioResults={initialListeningScenarioResults}
            initialListeningScoreSummary={initialListeningScoreSummary}
            initialReadWriteAnswers={initialReadWriteAnswers}
            initialReadWriteScoreSummary={initialReadWriteScoreSummary}
            initialSpeakA2CorrectionRetryCount={initialSpeakA2CorrectionRetryCount}
            initialSpeakBranchCorrectionRetryCount={initialSpeakBranchCorrectionRetryCount}
            initialReadWriteCorrectionRetryCount={initialReadWriteCorrectionRetryCount}
            isAdmin={isAdmin}
        />
    );
}
