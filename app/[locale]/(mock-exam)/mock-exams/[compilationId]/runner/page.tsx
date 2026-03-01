import { notFound } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import { appendSession, getCompilation, getMockExamTasksByIds, patchSession } from "@/app/serverActions/mockExamActions";
import type { MockExamSession, ResumePointer, SpeakingAnswer } from "@/app/types/fide/mock-exam";
import type { MockExamRunnerHydration } from "@/app/stores/mockExamRunnerStore";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";
import RunnerClient from "./RunnerClient";

export const dynamic = "force-dynamic";

const buildInitialSession = (): MockExamSession => {
    const now = new Date().toISOString();

    return {
        _key: uuidv4(),
        status: "in_progress",
        startedAt: now,
        resume: {
            state: "EXAM_INTRO",
            updatedAt: now,
        },
        speakA2Answers: [],
        speakBranchAnswers: [],
        readWriteAnswers: [],
    };
};

export default async function MockExamRunnerPage({ params: { compilationId } }: { params: { compilationId: string } }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;

    let compilation = await getCompilation(compilationId);
    if (!compilation || !userId || compilation.userId !== userId) {
        notFound();
    }

    let inProgressSession = (compilation.session || []).find((entry) => entry.status === "in_progress");

    if (!inProgressSession) {
        const newSession = buildInitialSession();
        await appendSession(compilationId, newSession);

        const refreshedCompilation = await getCompilation(compilationId);
        if (!refreshedCompilation) {
            notFound();
        }

        compilation = refreshedCompilation;
        inProgressSession = (refreshedCompilation.session || []).find((entry) => entry._key === newSession._key) || newSession;
    }

    if (!compilation.examConfig || !compilation.oralBranch || !compilation.writtenCombo || !inProgressSession?._key) {
        notFound();
    }

    const speakA2TaskIds = (compilation.examConfig.speakA2TaskIds || []).map((ref) => ref?._ref).filter(Boolean) as string[];
    const speakA2Tasks: RunnerTask[] = await getMockExamTasksByIds(speakA2TaskIds);

    let resume: ResumePointer = {
        state: inProgressSession.resume?.state || "EXAM_INTRO",
        taskId: inProgressSession.resume?.taskId,
        activityKey: inProgressSession.resume?.activityKey,
        updatedAt: inProgressSession.resume?.updatedAt || inProgressSession.startedAt || new Date().toISOString(),
    };

    if (!inProgressSession.resume?.updatedAt || !inProgressSession.resume?.state) {
        await patchSession(compilationId, inProgressSession._key, { set: { resume } });
    }

    const hydrationData: MockExamRunnerHydration = {
        compilationId: compilation._id,
        sessionKey: inProgressSession._key,
        resume,
        examConfig: compilation.examConfig,
        oralBranch: compilation.oralBranch,
        writtenCombo: compilation.writtenCombo,
    };

    const initialSpeakA2Answers = (inProgressSession.speakA2Answers || []) as SpeakingAnswer[];

    return <RunnerClient hydrationData={hydrationData} speakA2Tasks={speakA2Tasks} initialSpeakA2Answers={initialSpeakA2Answers} />;
}
