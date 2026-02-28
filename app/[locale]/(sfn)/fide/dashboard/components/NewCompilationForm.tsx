"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMockExamCompilation } from "@/app/serverActions/mockExamActions";
import { useToast } from "@/app/hooks/use-toast";
import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";

export default function NewCompilationForm({ disabled }: { disabled: boolean }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const router = useRouter();
    const { toast } = useToast();

    const handleCreate = async (allowTaskReuse: boolean) => {
        if (disabled || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createMockExamCompilation({ allowTaskReuse });

            if (result?.ok && result.compilationId) {
                router.push(`/mock-exams/${result.compilationId}`);
                return;
            }

            if (result?.requiresConfirmation) {
                setConfirmMessage(result.error || "Certaines tâches devront être réutilisées.");
                setShowConfirmModal(true);
                return;
            }

            toast({
                variant: "destructive",
                title: "Création impossible",
                description: result?.error || "La compilation n'a pas pu être créée.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur inattendue",
                description: "Une erreur est survenue pendant la création.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form
                onSubmit={async (event) => {
                    event.preventDefault();
                    await handleCreate(false);
                }}
            >
                <button
                    type="submit"
                    disabled={disabled || isSubmitting}
                    aria-disabled={disabled || isSubmitting}
                    className="btn btn-primary small disabled:opacity-60 disabled:cursor-not-allowed min-w-[220px] inline-flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <span className="h-4 w-4 rounded-full border-2 border-solid border-neutral-600 border-t-neutral-200 animate-spin" aria-hidden="true" />
                            <span>Création en cours...</span>
                        </>
                    ) : (
                        "Nouvelle compilation"
                    )}
                </button>
            </form>

            <ModalFromBottomWithPortal
                open={showConfirmModal}
                data={{
                    setOpen: setShowConfirmModal,
                    title: "Créer une compilation avec quelques tâches déjà vues ?",
                    message: confirmMessage,
                    buttonAnnulerStr: "Annuler",
                    buttonOkStr: isSubmitting ? "Création en cours..." : "Continuer quand même",
                    clickOutside: !isSubmitting,
                    className: "max-w-xl",
                    functionOk: async () => {
                        if (isSubmitting) return;
                        await handleCreate(true);
                    },
                    functionCancel: () => {
                        if (isSubmitting) return;
                        setShowConfirmModal(false);
                    },
                }}
            />
        </>
    );
}
