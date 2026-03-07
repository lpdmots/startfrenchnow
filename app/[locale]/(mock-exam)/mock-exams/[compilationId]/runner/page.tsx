import { notFound, redirect } from "next/navigation";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import { getCompilation, getCompilationSessions, getMockExamTasksByIds, getOrCreateInProgressMockExamSession, isMockExamCompilationUnlockedForUser, patchSession } from "@/app/serverActions/mockExamActions";
import type { ResumePointer, SpeakingAnswer } from "@/app/types/fide/mock-exam";
import type { MockExamRunnerHydration } from "@/app/stores/mockExamRunnerStore";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";
import RunnerClient from "./RunnerClient";

export const dynamic = "force-dynamic";

export default async function MockExamRunnerPage({ params: { compilationId } }: { params: { compilationId: string } }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;
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
    const speakA2Tasks: RunnerTask[] = await getMockExamTasksByIds(speakA2TaskIds);

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
        oralBranch: inProgressSession.oralBranch || { recommended: "A1" },
        writtenCombo: inProgressSession.writtenCombo || { recommended: "A1_A2" },
    };

    const initialSpeakA2Answers = (inProgressSession.speakA2Answers || []) as SpeakingAnswer[];

    return <RunnerClient hydrationData={hydrationData} speakA2Tasks={speakA2Tasks} initialSpeakA2Answers={initialSpeakA2Answers} />;
}
