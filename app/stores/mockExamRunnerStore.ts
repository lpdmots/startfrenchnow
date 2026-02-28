import { create } from "zustand";
import type { MockExamConfigRef, OralBranch, ResumePointer, WrittenCombo } from "@/app/types/fide/mock-exam";
import { devtools } from "zustand/middleware";

export type MockExamRunnerHydration = {
    compilationId: string;
    sessionKey: string;
    resume: ResumePointer;
    examConfig: MockExamConfigRef;
    oralBranch: { recommended: OralBranch; chosen?: OralBranch };
    writtenCombo: { recommended: WrittenCombo; chosen?: WrittenCombo };
};

type MockExamRunnerState = {
    hydrated: boolean;
    compilationId: string | null;
    sessionKey: string | null;
    resume: ResumePointer | null;
    examConfig: MockExamConfigRef | null;
    oralBranch: { recommended: OralBranch; chosen?: OralBranch } | null;
    writtenCombo: { recommended: WrittenCombo; chosen?: WrittenCombo } | null;
    hydrate: (payload: MockExamRunnerHydration) => void;
    setResume: (resume: ResumePointer) => void;
    reset: () => void;
};

const INITIAL_STATE: Omit<MockExamRunnerState, "hydrate" | "setResume" | "reset"> = {
    hydrated: false,
    compilationId: null,
    sessionKey: null,
    resume: null,
    examConfig: null,
    oralBranch: null,
    writtenCombo: null,
};

export const useMockExamRunnerStore = create<MockExamRunnerState>()(
    devtools(
        (set) => ({
            ...INITIAL_STATE,
            hydrate: (payload) =>
                set({
                    hydrated: true,
                    compilationId: payload.compilationId,
                    sessionKey: payload.sessionKey,
                    resume: payload.resume,
                    examConfig: payload.examConfig,
                    oralBranch: payload.oralBranch,
                    writtenCombo: payload.writtenCombo,
                }),
            setResume: (resume) =>
                set({
                    resume,
                }),
            reset: () => set(INITIAL_STATE),
        }),
        {
            name: "mock-exams-store", // nom affiché dans Redux DevTools
            enabled: process.env.NODE_ENV === "development",
        },
    ),
);
