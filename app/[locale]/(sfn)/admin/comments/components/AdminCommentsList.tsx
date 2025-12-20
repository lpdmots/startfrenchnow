"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { setCommentAssignee, setCommentSeen } from "@/app/serverActions/comments";
import { useToast } from "@/app/hooks/use-toast";
import { useAdminCommentsStore } from "@/app/stores/adminCommentsStore";
import LinkArrow from "@/app/components/common/LinkArrow";
import clsx from "clsx";

export function getResourceTypeLabel(resourceType: string) {
    switch (resourceType) {
        case "blog":
            return "Article de blog";
        case "pack_fide":
            return "Pack FIDE";
        case "fide_dashboard":
            return <span className="font-bold text-secondary-6">Tableau de bord FIDE</span>;
        case "fide_scenario":
            return "Scénario FIDE";
        case "udemy_course_beginner":
            return "Cours Débutant";
        default:
            return "Inconnu";
    }
}

export default function AdminCommentsList() {
    const rows = useAdminCommentsStore((s) => s.rows);
    const filter = useAdminCommentsStore((s) => s.filter);
    const priorityAssignee = useAdminCommentsStore((s) => s.priorityAssignee);

    const filtered = useMemo(() => {
        let base = rows;
        if (filter === "unseen") base = base.filter((c) => !c.isSeen);
        else if (filter === "seen") base = base.filter((c) => c.isSeen);

        // Assigné à moi d’abord
        const sorted = [...base].sort((a, b) => {
            const aPri = priorityAssignee && a.assignedTo === priorityAssignee ? 1 : 0;
            const bPri = priorityAssignee && b.assignedTo === priorityAssignee ? 1 : 0;
            if (aPri !== bPri) return bPri - aPri;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return sorted;
    }, [rows, filter, priorityAssignee]);

    if (!filtered.length) {
        return <p className="text-neutral-600">Aucun commentaire à afficher.</p>;
    }

    return (
        <div className="space-y-3">
            {filtered.map((item) => (
                <CommentCard key={item.id} id={item.id} />
            ))}
        </div>
    );
}

function CommentCard({ id }: { id: string }) {
    const { toast } = useToast();
    const row = useAdminCommentsStore((s) => s.rows.find((r) => r.id === id)!);
    const patchRow = useAdminCommentsStore((s) => s.patchRow);
    const [savingSeen, setSavingSeen] = useState(false);
    const [savingAssign, setSavingAssign] = useState(false);

    if (!row) return null;

    const bgClass = row.status === "hidden" ? "bg-neutral-300" : row.isSeen ? "bg-neutral-200" : "bg-neutral-100";

    const handleCheck = async () => {
        if (savingSeen) return;
        setSavingSeen(true);
        const prev = row.isSeen;
        const next = !prev;

        patchRow(row.id, { isSeen: next }); // optimistic
        try {
            await setCommentSeen(row.id, next);
        } catch {
            patchRow(row.id, { isSeen: prev }); // revert
            toast({
                title: "Échec",
                description: "Impossible de mettre à jour « Vu ».",
            });
        } finally {
            setSavingSeen(false);
        }
    };

    const handleAssign = async (val: string) => {
        if (savingAssign) return;
        setSavingAssign(true);

        const to: "Nico" | "Yoh" | null = val === "none" ? null : (val as "Nico" | "Yoh");
        const prev = row.assignedTo;

        patchRow(row.id, { assignedTo: to }); // optimistic
        try {
            await setCommentAssignee(row.id, to);
        } catch {
            patchRow(row.id, { assignedTo: prev }); // revert
            toast({
                title: "Échec",
                description: "Impossible de modifier l'assignation.",
            });
        } finally {
            setSavingAssign(false);
        }
    };

    return (
        <div className={`border border-solid border-neutral-500 rounded-xl p-2 md:p-4 grid grid-cols-12 ${bgClass}`}>
            <div className="col-span-2 flex flex-col w-full justify-center items-center">
                <div className="w-checkbox checkbox-field-wrapper col-span-2 !mb-0">
                    <label className="w-form-label flex-col sm:flex flex-wrap items-center select-none cursor-pointer gap-2 justify-center" onClick={savingSeen ? undefined : handleCheck}>
                        <div
                            aria-hidden="true"
                            className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox !mr-0 ${row.isSeen ? "w--redirected-checked" : ""} ${savingSeen ? "opacity-60" : ""}`}
                        />
                        <p className="mb-0">Vu</p>
                    </label>
                </div>
            </div>
            <div className="col-span-10">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-neutral-500">{new Date(row.createdAt).toLocaleString()}</div>

                    <div className="flex items-center gap-2">{row.status === "hidden" && <span className="text-xs bg-neutral-800 text-white px-2 py-0.5 rounded">Masqué</span>}</div>
                    {row.isAnswered && <span className="text-xs bg-secondary-5 text-neutral-100 px-2 py-0.5 rounded">Répondu</span>}
                </div>

                <div className="mt-2 text-sm text-neutral-800 whitespace-pre-wrap">{row.body}</div>

                <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="text-xs text-neutral-600">
                        <span className="font-medium">{row.authorName}</span> — {getResourceTypeLabel(row.resourceType)}
                        {row.resourceTitle ? ` · ${row.resourceTitle}` : ""}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        {/* Select assignation */}
                        <Select value={row.assignedTo ?? "none"} onValueChange={handleAssign} disabled={savingAssign}>
                            <SelectTrigger
                                className={clsx("w-28 px-2 py-0 text-neutral-100 rounded", {
                                    "text-neutral-800": !row.assignedTo,
                                })}
                                style={{ backgroundColor: !row.assignedTo ? "transparent" : row.assignedTo === "Nico" ? "var(--secondary-2)" : "var(--secondary-4)" }}
                            >
                                <SelectValue placeholder="Assigner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="none" className="hover:bg-neutral-200 text-neutral-800">
                                        Assigner
                                    </SelectItem>
                                    <SelectItem value="Nico" className="hover:bg-neutral-200 text-neutral-800">
                                        Nico
                                    </SelectItem>
                                    <SelectItem value="Yoh" className="hover:bg-neutral-200 text-neutral-800">
                                        Yoh
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {/* Ouvrir */}
                        <LinkArrow url={row.href} className="text-secondary-2" target="_blank">
                            Ouvrir
                        </LinkArrow>
                    </div>
                </div>
            </div>
        </div>
    );
}
