"use client";

import { useRef, useState } from "react";
import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import { restartMockExamCompilation } from "@/app/serverActions/mockExamActions";

export default function RestartSessionDialog({ compilationId }: { compilationId: string }) {
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <>
            <button type="button" className="btn-secondary" onClick={() => setOpen(true)}>
                Recommencer
            </button>

            <form ref={formRef} action={restartMockExamCompilation} className="hidden">
                <input type="hidden" name="compilationId" value={compilationId} />
            </form>

            <ModalFromBottomWithPortal
                open={open}
                data={{
                    setOpen,
                    title: "Recommencer l'examen ?",
                    message: "La session en cours sera supprimée. Une nouvelle session sera créée et vous repartirez de zéro.",
                    buttonAnnulerStr: "Annuler",
                    buttonOkStr: "Oui, recommencer",
                    clickOutside: true,
                    functionOk: () => formRef.current?.requestSubmit(),
                }}
            />
        </>
    );
}
