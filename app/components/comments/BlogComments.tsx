"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import CommentThread from "./CommentThread";
import CommentComposerClient from "./CommentComposerClient";
import { createComment } from "@/app/serverActions/comments";
import type { CommentResourceType, ThreadItem } from "@/app/types/sfn/comment";

type Props = {
    resourceId: string;
    locale?: "fr" | "en";
    pageSize?: number;
};

type ApiComment = {
    _id: string;
    body?: string;
    voteCount?: number;
    _createdAt: string;
    _updatedAt?: string;
    status?: "active" | "hidden";
    isEdited?: boolean;
    isSeen?: boolean;
    author?: {
        name?: string;
        email?: string | null;
        isYou?: boolean;
        isAdmin?: boolean;
    };
    hasVoted?: boolean;
    replies?: Array<{
        _id: string;
        body?: string;
        voteCount?: number;
        _createdAt: string;
        _updatedAt?: string;
        status?: "active" | "hidden";
        isEdited?: boolean;
        isSeen?: boolean;
        author?: {
            name?: string;
            email?: string | null;
            isYou?: boolean;
            isAdmin?: boolean;
        };
        replyTo?: { id: string; name: string } | null;
        hasVoted?: boolean;
    }>;
};

export default function BlogComments({ resourceId, locale = "fr", pageSize = 20 }: Props) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;
    const viewerIsAdmin = session?.user?.isAdmin === true;
    const userDisplayName = session?.user?.name ?? null;
    const [items, setItems] = useState<ThreadItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const resourceType: CommentResourceType = "blog";

    const mapItem = useCallback((c: ApiComment): ThreadItem => {
        return {
            id: c._id,
            body: c.body ?? "",
            voteCount: c.voteCount ?? 0,
            createdAt: c._createdAt,
            updatedAt: c._updatedAt,
            status: c.status ?? "active",
            isSeen: c.isSeen ?? false,
            author: {
                name: c.author?.name ?? "Invité",
                email: c.author?.email ?? null,
                isYou: c.author?.isYou ?? false,
                isAdmin: c.author?.isAdmin ?? false,
            },
            hasVoted: !!c.hasVoted,
            isEdited: !!c.isEdited,
            replies: (c.replies || []).map((r) => ({
                id: r._id,
                body: r.body ?? "",
                voteCount: r.voteCount ?? 0,
                createdAt: r._createdAt,
                updatedAt: r._updatedAt,
                status: r.status ?? "active",
                isSeen: r.isSeen ?? false,
                author: {
                    name: r.author?.name ?? "Invité",
                    email: r.author?.email ?? null,
                    isYou: r.author?.isYou ?? false,
                    isAdmin: r.author?.isAdmin ?? false,
                },
                replyTo: r.replyTo ?? null,
                hasVoted: !!r.hasVoted,
                isEdited: !!r.isEdited,
            })),
        };
    }, []);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                rt: resourceType,
                rid: resourceId,
                page: "1",
                pageSize: String(pageSize),
            });
            const res = await fetch(`/api/comments?${params.toString()}`, { cache: "no-store" });
            if (!res.ok) {
                throw new Error("Impossible de charger les commentaires.");
            }
            const data = await res.json();
            const nextItems = Array.isArray(data?.items) ? data.items.map(mapItem) : [];
            setItems(nextItems);
        } catch (e: any) {
            setError(e?.message || "Erreur inconnue.");
        } finally {
            setLoading(false);
        }
    }, [mapItem, pageSize, resourceId, resourceType]);

    useEffect(() => {
        void fetchComments();
    }, [fetchComments]);

    const action = useCallback(
        async (_: any, formData: FormData) => {
            try {
                const payload = {
                    resourceType: formData.get("resourceType") as CommentResourceType,
                    resourceId: formData.get("resourceId") as string,
                    body: (formData.get("body") as string) ?? "",
                    guestName: (formData.get("guestName") as string) || undefined,
                    guestEmail: (formData.get("guestEmail") as string) || undefined,
                    parentId: (formData.get("parentId") as string) || null,
                    honeypot: (formData.get("honeypot") as string) || "",
                };
                const res = await createComment(payload);
                await fetchComments();
                return { ok: true as const, error: null, data: res };
            } catch (e: any) {
                return { ok: false as const, error: e?.message || "Erreur inconnue" };
            }
        },
        [fetchComments],
    );

    return (
        <div className="w-full flex items-center flex-col gap-4 m-auto max-w-7xl my-8 pb-12 md:pb-24">
            <CommentComposerClient
                action={action}
                resourceType={resourceType}
                resourceId={resourceId}
                parentId={null}
                isAuthenticated={isAuthenticated}
                userDisplayName={userDisplayName}
            />
            {error ? <div className="text-sm text-neutral-600">{error}</div> : null}
            {!loading ? <CommentThread resourceType={resourceType} resourceId={resourceId} items={items} isAuthenticated={isAuthenticated} viewerIsAdmin={viewerIsAdmin} locale={locale} /> : null}
        </div>
    );
}
