"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { restartMockExamCompilation } from "@/app/serverActions/mockExamActions";

export default function RestartSessionDialog({ compilationId }: { compilationId: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="btn-secondary">Recommencer</button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Recommencer l'examen ?</DialogTitle>
                    <DialogDescription>
                        La session en cours sera supprimée et votre progression actuelle sera perdue. Vous pourrez repartir de zéro.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <form action={restartMockExamCompilation}>
                        <input type="hidden" name="compilationId" value={compilationId} />
                        <button type="submit" className="btn-primary">
                            Oui, recommencer
                        </button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
