"use client";

import React, { useEffect } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import AdminCommentsList from "./AdminCommentsList";
import { useAdminCommentsStore } from "@/app/stores/adminCommentsStore";

export type AdminComment = {
    id: string;
    createdAt: string;
    body: string;
    status: "active" | "hidden";
    isSeen: boolean;
    assignedTo: "Nico" | "Yoh" | null;
    resourceType: "blog" | "pack_fide";
    authorName: string;
    authorIsAdmin: boolean;
    resourceTitle: string | null;
    href: string;
    isAnswered: boolean;
};

export default function AdminCommentsPageClient({ comments, priorityAssignee }: { comments: AdminComment[]; priorityAssignee: "Nico" | "Yoh" | null }) {
    const filter = useAdminCommentsStore((s) => s.filter);
    const setFilter = useAdminCommentsStore((s) => s.setFilter);
    const init = useAdminCommentsStore((s) => s.init);

    useEffect(() => {
        init(comments, priorityAssignee);
    }, [comments, priorityAssignee, init]);

    const selectedLabel = filter === "unseen" ? "Non vus" : filter === "seen" ? "Vus" : "Tous";

    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            <div className="section hero v3 wf-section !pt-6">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center mb-8">
                            <div className="inner-container max-w-[725px] mr-auto ml-auto max-[991px]:max-w-full max-[767px]:max-w-full mr-auto ml-auto max-[767px]:max-w-full">
                                <div className="text-center mg-bottom-40px">
                                    <h1 className="display-1 mg-bottom-8px mb-8">
                                        Modération des <span className="heading-span-secondary-1">commentaires</span>
                                    </h1>
                                    <p className="mg-bottom-0">Affiche les 100 derniers commentaires. Pour répondre ou masquer/supprimer un commentaire, il faut aller sur la page correspondante.</p>
                                </div>
                            </div>

                            <div className="flex justify-center w-full">
                                <div className="max-w-3xl xl:max-w-none w-full">
                                    <div className="flex mb-8">
                                        <Select name="filter" value={filter} onValueChange={(val) => setFilter(val === "unseen" || val === "seen" || val === "all" ? val : "unseen")}>
                                            <SelectTrigger className="max-w-52 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--neutral-800)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--neutral-800)] mb-2">
                                                <SelectValue>
                                                    <p className="flex items-center mb-0">
                                                        <span className="underline">Filtre</span> :{" "}
                                                        <span className="font-bold ml-2" style={{ color: "var(--neutral-800)" }}>
                                                            {selectedLabel}
                                                        </span>
                                                    </p>
                                                </SelectValue>
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem className="hover:bg-neutral-200" value="unseen">
                                                        Non vus
                                                    </SelectItem>
                                                    <SelectItem className="hover:bg-neutral-200" value="seen">
                                                        Vus
                                                    </SelectItem>
                                                    <SelectItem className="hover:bg-neutral-200" value="all">
                                                        Tous
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <AdminCommentsList />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
