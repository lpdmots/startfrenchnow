"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import { useMockExamRunnerStore, type MockExamRunnerHydration } from "@/app/stores/mockExamRunnerStore";

type RunnerClientProps = {
    hydrationData: MockExamRunnerHydration;
};

export default function RunnerClient({ hydrationData }: RunnerClientProps) {
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const router = useRouter();
    const hydrate = useMockExamRunnerStore((state) => state.hydrate);
    const hasHydratedRef = useRef(false);

    useEffect(() => {
        if (hasHydratedRef.current) return;
        hydrate(hydrationData);
        hasHydratedRef.current = true;
    }, [hydrate, hydrationData]);

    useEffect(() => {
        const guardState = { mockExamGuard: true, compilationId: hydrationData.compilationId };
        window.history.pushState(guardState, "", window.location.href);

        const onPopState = () => {
            if (isLeaving) return;
            setShowQuitModal(true);
            window.history.pushState(guardState, "", window.location.href);
        };

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isLeaving) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("popstate", onPopState);
        window.addEventListener("beforeunload", onBeforeUnload);

        return () => {
            window.removeEventListener("popstate", onPopState);
            window.removeEventListener("beforeunload", onBeforeUnload);
        };
    }, [hydrationData.compilationId, isLeaving]);

    return (
        <>
            <div className="w-full flex flex-col items-center gap-8 mt-8 md:mt-12 p-4 mb-12 lg:mb-24">
                <section className="max-w-6xl w-full flex justify-end py-0">
                    <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-100 text-neutral-800 transition-colors hover:bg-neutral-300"
                        aria-label="Quitter l'examen"
                        title="Quitter l'examen"
                        onClick={() => setShowQuitModal(true)}
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </section>

                <section className="max-w-6xl w-full card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col gap-4 py-0">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">EXAMEN BLANC</p>
                        <h1 className="display-2 font-medium mb-0">Runner en préparation</h1>
                    </div>

                    <p className="mb-0 text-neutral-700">
                        Session active créée/reprise. L'état du runner est maintenant hydraté dans Zustand.
                    </p>

                    <div className="rounded-xl border border-neutral-300 p-4 bg-neutral-100 text-sm">
                        <p className="mb-1">
                            <span className="font-semibold">Session :</span> {hydrationData.sessionKey}
                        </p>
                        <p className="mb-0">
                            <span className="font-semibold">État courant :</span> {hydrationData.resume.state}
                        </p>
                    </div>
                </section>
            </div>

            <ModalFromBottomWithPortal
                open={showQuitModal}
                data={{
                    setOpen: setShowQuitModal,
                    title: "Quitter l'examen ?",
                    message: "Ta progression est enregistrée. Tu pourras reprendre plus tard.",
                    buttonAnnulerStr: "Continuer l'examen",
                    buttonOkStr: "Quitter",
                    clickOutside: true,
                    functionCancel: () => setShowQuitModal(false),
                    functionOk: () => {
                        setIsLeaving(true);
                        router.push("/fide/dashboard");
                    },
                }}
            />
        </>
    );
}

