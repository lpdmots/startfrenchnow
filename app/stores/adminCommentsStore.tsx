"use client";

import { create } from "zustand";
import { AdminComment } from "../[locale]/(sfn)/admin/comments/components/AdminCommentsPageClient";

type FilterValue = "unseen" | "seen" | "all";

type State = {
    rows: AdminComment[];
    filter: FilterValue;
    priorityAssignee: "Nico" | "Yoh" | null;
};

type Actions = {
    init: (rows: AdminComment[], priority: State["priorityAssignee"]) => void;
    setFilter: (f: FilterValue) => void;
    patchRow: (id: string, patch: Partial<AdminComment>) => void;
};

export const useAdminCommentsStore = create<State & Actions>((set) => ({
    rows: [],
    filter: "all",
    priorityAssignee: null,
    init: (rows, priority) => set({ rows, priorityAssignee: priority }),
    setFilter: (f) => set({ filter: f }),
    patchRow: (id, patch) =>
        set((s) => ({
            rows: s.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
}));
