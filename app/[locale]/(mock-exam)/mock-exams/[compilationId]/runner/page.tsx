import { notFound, redirect } from "next/navigation";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import {
    getCompilation,
    getCompilationSessions,
    getFideExamsByIds,
    getMockExamTasksByIds,
    getOrCreateInProgressMockExamSession,
    isMockExamCompilationUnlockedForUser,
    patchSession,
} from "@/app/serverActions/mockExamActions";
import type { ExamCorrectionContent, ListeningScenarioResult, ResumePointer, ScoreSummary, SpeakingAnswer } from "@/app/types/fide/mock-exam";
import type { MockExamRunnerHydration } from "@/app/stores/mockExamRunnerStore";
import type { Exam } from "@/app/types/fide/exam";
import RunnerClient from "./RunnerClient";

export const dynamic = "force-dynamic";

export default async function MockExamRunnerPage({ params: { compilationId } }: { params: { compilationId: string } }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
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

    let inProgressSession = (sessions || [])
        .filter((entry) => entry.status === "in_progress")
        .sort((a, b) => (b.resume?.updatedAt || b.startedAt || "").localeCompare(a.resume?.updatedAt || a.startedAt || ""))[0];

    if (!inProgressSession) {
        const createResult = await getOrCreateInProgressMockExamSession(compilationId);
        if (!createResult.ok || !createResult.session) {
            redirect(`/mock-exams/${compilationId}`);
        }
        inProgressSession = createResult.session;
    }

    const speakA2TaskIds = (compilation.examConfig.speakA2TaskIds || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const speakBranchA1TaskIds = (compilation.examConfig.speakBranchTaskIds?.A1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const speakBranchB1TaskIds = (compilation.examConfig.speakBranchTaskIds?.B1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const listeningA1Ids = (compilation.examConfig.listeningPackIds?.A1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const listeningA2Ids = (compilation.examConfig.listeningPackIds?.A2 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const listeningB1Ids = (compilation.examConfig.listeningPackIds?.B1 || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const [speakA2Tasks, speakBranchA1Tasks, speakBranchB1Tasks, listeningA1Exams, listeningA2Exams, listeningB1Exams] = await Promise.all([
        getMockExamTasksByIds(speakA2TaskIds),
        getMockExamTasksByIds(speakBranchA1TaskIds),
        getMockExamTasksByIds(speakBranchB1TaskIds),
        getFideExamsByIds(listeningA1Ids),
        getFideExamsByIds(listeningA2Ids),
        getFideExamsByIds(listeningB1Ids),
    ]);

    const resume: ResumePointer = {
        state: inProgressSession.resume?.state || "EXAM_INTRO",
        taskId: inProgressSession.resume?.taskId,
        activityKey: inProgressSession.resume?.activityKey,
        updatedAt: inProgressSession.resume?.updatedAt || inProgressSession.startedAt || new Date().toISOString(),
    };

    if (!inProgressSession.resume?.updatedAt || !inProgressSession.resume?.state) {
        await patchSession(inProgressSession._id, { set: { resume } });
    }

    const hydrationData: MockExamRunnerHydration = {
        compilationId: compilation._id,
        sessionKey: inProgressSession._id,
        resume,
        examConfig: compilation.examConfig,
        oralBranch: inProgressSession.oralBranch || {},
        writtenCombo: inProgressSession.writtenCombo || { recommended: "A1_A2" },
    };

    const initialSpeakA2Answers = ([...(inProgressSession.speakA2Answers || []), ...(inProgressSession.speakBranchAnswers || [])] as SpeakingAnswer[]).filter(Boolean);
    const initialSpeakA2ScoreSummary = (inProgressSession.scores?.speakA2 || null) as ScoreSummary | null;
    const initialSpeakBranchScoreSummary = (inProgressSession.scores?.speakBranch || null) as ScoreSummary | null;
    const initialListeningScenarioResults = ((inProgressSession.listeningScenarioResults || []) as ListeningScenarioResult[]).filter(Boolean);
    const initialListeningScoreSummary = (inProgressSession.scores?.listening || null) as ScoreSummary | null;
    const initialSpeakA2CorrectionRetryCount = Number(inProgressSession.speakA2CorrectionRetryCount || 0);
    const compilationCorrections = (compilation.corrections || []) as ExamCorrectionContent[];

    return (
        <RunnerClient
            hydrationData={hydrationData}
            compilationName={String(compilation.name || "")}
            compilationCorrections={compilationCorrections}
            speakA2Tasks={speakA2Tasks}
            speakBranchA1Tasks={speakBranchA1Tasks}
            speakBranchB1Tasks={speakBranchB1Tasks}
            listeningA1Exams={listeningA1Exams as Exam[]}
            listeningA2Exams={listeningA2Exams as Exam[]}
            listeningB1Exams={listeningB1Exams as Exam[]}
            initialSpeakA2Answers={initialSpeakA2Answers}
            initialSpeakA2ScoreSummary={initialSpeakA2ScoreSummary}
            initialSpeakBranchScoreSummary={initialSpeakBranchScoreSummary}
            initialListeningScenarioResults={initialListeningScenarioResults}
            initialListeningScoreSummary={initialListeningScoreSummary}
            initialSpeakA2CorrectionRetryCount={initialSpeakA2CorrectionRetryCount}
            isAdmin={isAdmin}
        />
    );
}
