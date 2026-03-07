"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";
import { purchaseMockExamCompilation } from "@/app/serverActions/mockExamActions";

export default function PurchaseMockExamForm({ disabled, credits }: { disabled: boolean; credits: number }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handlePurchase = async () => {
        if (disabled || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const result = await purchaseMockExamCompilation();
            if (!result?.ok || !result.compilationId) {
                toast({
                    variant: "destructive",
                    title: "Achat impossible",
                    description: result?.error || "La compilation n'a pas pu être débloquée.",
                });
                return;
            }

            router.push(`/mock-exams/${result.compilationId}`);
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Erreur inattendue",
                description: "Impossible de débloquer une compilation pour le moment.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handlePurchase}
            disabled={disabled || isSubmitting}
            aria-disabled={disabled || isSubmitting}
            className="btn btn-primary small disabled:opacity-60 disabled:cursor-not-allowed min-w-[220px] inline-flex items-center justify-center gap-2"
        >
            {isSubmitting ? (
                <>
                    <span className="h-4 w-4 rounded-full border-2 border-solid border-neutral-600 border-t-neutral-200 animate-spin" aria-hidden="true" />
                    <span>Achat en cours...</span>
                </>
            ) : (
                `Acheter (${credits} crédit${credits > 1 ? "s" : ""} restant${credits > 1 ? "s" : ""})`
            )}
        </button>
    );
}
