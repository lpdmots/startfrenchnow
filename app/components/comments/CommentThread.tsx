// app/components/comments/CommentThread.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleUpvote, createComment, updateComment, setCommentStatus, deleteComment, setCommentSeen } from "@/app/serverActions/comments";
import type { CommentResourceType, ThreadItem } from "@/app/types/sfn/comment";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { PiArrowBendDownRightDuotone } from "react-icons/pi";
import { Popover } from "../animations/Popover";
import { MAXCOMMENTLENGTH } from "./CommentComposerClient";
import clsx from "clsx"; // FIX: import par défaut
import { AiOutlineLike } from "react-icons/ai";
import { FaEdit, FaRegEye, FaRegEyeSlash, FaRegTrashAlt, FaTrash } from "react-icons/fa";
import { ModalFromBottom } from "../animations/Modals";

type Props = {
    resourceType: CommentResourceType;
    resourceId: string;
    items: ThreadItem[];
    isAuthenticated: boolean;
    locale?: "fr" | "en";
    viewerIsAdmin?: boolean;
};

type UILocale = "fr" | "en";

const EMOJIS = ["🙂", "😄", "😁", "😂", "😉", "😊", "😍", "😎", "🤔", "🙌", "🎉", "👍", "👎", "🔥", "💡", "❓"];

function formatRelativeCompact(date: Date, locale: UILocale) {
    const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { style: "narrow", numeric: "auto" });
    const abs = Math.abs(diffSec);
    if (abs < 60) return rtf.format(diffSec, "second");
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
    const diffHour = Math.round(diffMin / 60);
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
    const diffDay = Math.round(diffHour / 24);
    if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
    const diffMonth = Math.round(diffDay / 30);
    if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
    const diffYear = Math.round(diffMonth / 12);
    return rtf.format(diffYear, "year");
}

export function RelativeDate({ iso, locale = "fr", small = false }: { iso: string; locale?: UILocale; small?: boolean }) {
    const d = useMemo(() => new Date(iso), [iso]);
    const dfnsLocale = locale === "fr" ? fr : enUS;
    const long = useMemo(() => formatDistanceToNow(d, { addSuffix: true, locale: dfnsLocale }), [d, dfnsLocale]);
    const compact = useMemo(() => formatRelativeCompact(d, locale), [d, locale]);

    if (small) return <span className="text-xs text-neutral-500">{compact}</span>;

    return (
        <>
            <span className="text-xs md:hidden text-neutral-500">{compact}</span>
            <span className="text-xs hidden md:inline text-neutral-500">{long}</span>
        </>
    );
}

// --- helpers UX ---

function getInitials(name: string) {
    const parts = (name || "").trim().split(/\s+/).slice(0, 2);
    return (
        parts
            .map((p) => p[0])
            .join("")
            .toUpperCase() || "?"
    );
}

function scrollToComment(id: string, highlight = true) {
    const el = document.getElementById(`comment-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (highlight) {
        el.classList.add("bg-neutral-200");
        setTimeout(() => el.classList.remove("bg-neutral-200"), 1400);
    }
}

export function AuthorLine({ name, isYou, isAdmin, status }: { name: string; isYou?: boolean; isAdmin?: boolean; status?: string }) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300 text-sm font-semibold text-neutral-700" aria-hidden>
                {getInitials(name)}
            </div>
            <div className="text-sm font-bold text-neutral-700">{name}</div>
            {isYou && <span className="rounded bg-secondary-2 px-2 py-0.5 text-xs font-medium text-neutral-100">Vous</span>}
            {isAdmin && <span className="rounded bg-secondary-5 px-2 py-0.5 text-xs font-medium text-neutral-100">Admin</span>}
            {isAdmin && status === "hidden" && (
                <span className="rounded bg-neutral-300 text-neutral-700 px-2 py-0.5 text-xs font-medium" title="Masqué (visible staff)">
                    Masqué
                </span>
            )}
        </div>
    );
}

export default function CommentThread({ resourceType, resourceId, items, isAuthenticated, viewerIsAdmin, locale = "fr" }: Props) {
    const router = useRouter();
    const [voteBusyId, setVoteBusyId] = useState<string | null>(null);
    const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
    const [returnFocusEl, setReturnFocusEl] = useState<HTMLElement | null>(null);
    // POUR L’ÉDITION
    const [editOpenFor, setEditOpenFor] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<string>("");
    // POUR LA SUPPRESSION
    const [deleteOpenFor, setDeleteOpenFor] = useState<string | null>(null);

    // POUR TOUTES ACTIONS (edit/hide/delete) → spinner ciblé
    const [actionBusyId, setActionBusyId] = useState<string | null>(null);

    const totalAll = useMemo(() => items.reduce((acc, c) => acc + 1 + c.replies.length, 0), [items]);

    const EDIT_WINDOW_MIN = 15;

    function minutesSince(iso?: string) {
        if (!iso) return Number.POSITIVE_INFINITY;
        const t = new Date(iso).getTime();
        return Math.floor((Date.now() - t) / 60000);
    }

    // Autorisations d’édition/suppression
    function canEditItem(item: { createdAt: string; author: { isYou?: boolean } }, viewerIsAdmin?: boolean) {
        // Auteur : ≤ 15 min
        if (item.author?.isYou && minutesSince(item.createdAt) <= EDIT_WINDOW_MIN) return true;
        // Admin : peut éditer ses propres commentaires à tout moment
        if (viewerIsAdmin && item.author?.isYou) return true;
        return false;
    }

    function canDeleteItem(item: { createdAt: string; author: { isYou?: boolean } }, viewerIsAdmin?: boolean) {
        // Admin : tout le temps (n’importe quel commentaire)
        if (viewerIsAdmin) return true;
        // Auteur : ≤ 15 min
        if (item.author?.isYou && minutesSince(item.createdAt) <= EDIT_WINDOW_MIN) return true;
        return false;
    }

    // #comment-... : autoscroll + highlight au chargement
    useEffect(() => {
        if (typeof window === "undefined") return;
        const hash = window.location.hash;
        if (hash && hash.startsWith("#comment-")) {
            const id = hash.replace("#comment-", "");
            // attendre le layout
            setTimeout(() => scrollToComment(id, true), 50);
        }
    }, [items.length]);

    async function handleVote(id: string) {
        try {
            setVoteBusyId(id);
            await toggleUpvote({ commentId: id });
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setVoteBusyId(null);
        }
    }

    async function handleEditSave(id: string, body: string) {
        try {
            setActionBusyId(id);
            await updateComment({ commentId: id, body, isAdmin: !!viewerIsAdmin });
            setEditOpenFor(null);
            setEditDraft("");
            // refresh pour refléter _updatedAt et body
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setActionBusyId(null);
        }
    }

    async function handleToggleHide(id: string, currentStatus: "active" | "hidden" | undefined) {
        try {
            setActionBusyId(id);
            const next = currentStatus === "hidden" ? "active" : "hidden";
            await setCommentStatus({ commentId: id, status: next });
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setActionBusyId(null);
        }
    }

    const handleCheck = async (id: string, isSeen: boolean) => {
        setActionBusyId(id);
        await setCommentSeen(id, isSeen);
        router.refresh();
    };

    return (
        <div className="card py-4 px-2 md:p-8 border-2 w-full">
            {/* Header compteur (total messages) */}
            <div className="text-neutral-700 text-2xl mb-4 px-2 sm:px-4">
                <span className="font-bold">{totalAll}</span> <span className="heading-span-secondary-3">commentaire{totalAll > 1 ? "s" : ""}</span>
            </div>

            {/* Liste top-level */}
            {items.length === 0 ? (
                <div className="text-sm text-neutral-600 flex justify-center w-full items-center min-h-40 px-2 sm:px-4">Aucun commentaire pour le moment.</div>
            ) : (
                <div className="flex w-full flex-col gap-4">
                    {items.map((c, i) => (
                        <div key={c.id} className="flex flex-col w-full pb-4" style={items.length - 1 === i ? {} : { borderBottom: "solid 2px var(--neutral-300)" }}>
                            <div id={`comment-${c.id}`} className={(viewerIsAdmin && c.status === "hidden" && "bg-neutral-200") || ""}>
                                <div className="p-2 sm:p-4 pt-0 sm:pt-0">
                                    {/* Ligne auteur + date */}
                                    <div className="flex items-center justify-between mb-2">
                                        <AuthorLine name={c.author.name} isYou={c.author.isYou} isAdmin={c.author.isAdmin} status={c.status} />
                                        <div className="flex items-center gap-2 shrink-0">
                                            <RelativeDate iso={c.createdAt} locale={locale} />
                                            {c.isEdited && <span className="text-xs text-neutral-500">(édité)</span>}
                                        </div>
                                    </div>

                                    {/* Corps */}
                                    <div className={clsx("whitespace-pre-wrap break-words text-neutral-600", viewerIsAdmin && c.status === "hidden" && "opacity-70 italic")}>{c.body}</div>

                                    {/* Actions */}
                                    <div className="mb-2 mt-2 flex items-center gap-2">
                                        <UpvoteIconButton
                                            count={c.voteCount}
                                            hasVoted={c.hasVoted}
                                            disabled={voteBusyId === c.id || !isAuthenticated || !!c.author.isYou}
                                            onClick={() => handleVote(c.id)}
                                        />

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                setReplyOpenFor((prev) => (prev === c.id ? null : c.id));
                                                setReturnFocusEl(e.currentTarget as HTMLElement);
                                                // scroll le parent dans la vue si on ouvre
                                                if (replyOpenFor !== c.id) scrollToComment(c.id, false);
                                            }}
                                            className="!border-none p-2 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 flex items-center gap-1"
                                            aria-expanded={replyOpenFor === c.id}
                                            aria-controls={`replyform-${c.id}`}
                                            title="Répondre"
                                        >
                                            <PiArrowBendDownRightDuotone />
                                            Répondre
                                        </button>

                                        {/* --- ACTIONS auteur/admin --- */}
                                        {canEditItem(c, viewerIsAdmin) && (
                                            <button
                                                type="button"
                                                className="!border-none p-2 text-sm font-bold text-neutral-700"
                                                title="Éditer"
                                                onClick={() => {
                                                    const opening = editOpenFor !== c.id;
                                                    setEditOpenFor(opening ? c.id : null);
                                                    setEditDraft(opening ? c.body : "");
                                                }}
                                                disabled={actionBusyId === c.id}
                                            >
                                                <FaEdit />
                                            </button>
                                        )}

                                        {/* Staff: Masquer / Ré-afficher */}
                                        {viewerIsAdmin && (
                                            <button
                                                type="button"
                                                className="!border-none p-2 font-bold text-sm text-neutral-700"
                                                title={c.status === "hidden" ? "Ré-afficher" : "Masquer"}
                                                onClick={() => handleToggleHide(c.id, c.status)}
                                                disabled={actionBusyId === c.id}
                                            >
                                                {c.status === "hidden" ? <FaRegEyeSlash /> : <FaRegEye />}
                                            </button>
                                        )}

                                        {/* Supprimer (auteur ou admin) */}
                                        {canDeleteItem(c, viewerIsAdmin) && (
                                            <button
                                                type="button"
                                                className="!border-none p-2 font-bold text-sm text-neutral-700"
                                                title="Supprimer"
                                                onClick={() => setDeleteOpenFor(c.id)}
                                                disabled={actionBusyId === c.id}
                                            >
                                                <FaRegTrashAlt />
                                            </button>
                                        )}

                                        {viewerIsAdmin && (
                                            <div className="w-checkbox checkbox-field-wrapper col-span-2 !mb-0">
                                                <label
                                                    className="w-form-label flex items-center select-none cursor-pointer gap-2 justify-center"
                                                    onClick={actionBusyId === c.id ? undefined : () => handleCheck(c.id, !c.isSeen)}
                                                >
                                                    <div
                                                        aria-hidden="true"
                                                        className={`w-checkbox-input !min-h-5 !min-w-5 !h-5 !w-5 w-checkbox-input--inputType-custom checkbox !mr-0 ${
                                                            c.isSeen ? "w--redirected-checked" : ""
                                                        } ${actionBusyId === c.id ? "opacity-60" : ""}`}
                                                    />
                                                    <p className="mb-0">Vu</p>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {editOpenFor === c.id && (
                                        <InlineEditForm
                                            id={c.id}
                                            initialValue={editDraft}
                                            busy={actionBusyId === c.id}
                                            onCancel={() => {
                                                setEditOpenFor(null);
                                                setEditDraft("");
                                            }}
                                            onSave={(next) => handleEditSave(c.id, next)}
                                        />
                                    )}

                                    {/* Composer de réponse (simple, inline) */}
                                    {replyOpenFor === c.id && (
                                        <ReplyForm
                                            id={`replyform-${c.id}`}
                                            parentId={c.id}
                                            resourceType={resourceType}
                                            resourceId={resourceId}
                                            isAuthenticated={isAuthenticated}
                                            onDone={() => {
                                                setReplyOpenFor(null);
                                                // remettre le focus sur le bouton qui a ouvert
                                                returnFocusEl?.focus();
                                                router.refresh();
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                {/* Réponses */}
                                {c.replies.length > 0 && (
                                    <div className="flex w-full flex-col gap-4">
                                        {c.replies.map((r) => {
                                            const isReplyToMainComment = !!(r.replyTo && r.replyTo.id === c.id);
                                            return (
                                                <div key={r.id} className="grid grid-cols-12">
                                                    <div className="col-span-1"></div>
                                                    <div className="col-span-11">
                                                        <div
                                                            id={`comment-${r.id}`}
                                                            className={clsx("", viewerIsAdmin && (r as any).status === "hidden" && "bg-neutral-200")}
                                                            style={{ borderLeft: "solid 4px var(--neutral-400)" }}
                                                        >
                                                            <div className="p-2 sm:p-4">
                                                                <div className="mb-2 flex items-center justify-between text-lg">
                                                                    <AuthorLine name={r.author.name} isYou={r.author.isYou} isAdmin={r.author.isAdmin} status={r.status} />
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <RelativeDate iso={r.createdAt} locale={locale} />
                                                                        {r.isEdited && <span className="text-xs text-neutral-500">(édité)</span>}
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className={clsx("whitespace-pre-wrap break-words text-neutral-600", viewerIsAdmin && r.status === "hidden" && "opacity-70 italic")}
                                                                >
                                                                    {r.replyTo && !isReplyToMainComment && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => scrollToComment(r.replyTo!.id)}
                                                                            className="mx-2 rounded bg-neutral-200 px-2 py-0.5 text-sm text-secondary-2 inline-block font-bold hover:bg-neutral-300"
                                                                            title={`Voir le message de ${r.replyTo.name}`}
                                                                        >
                                                                            @{r.replyTo.name}
                                                                        </button>
                                                                    )}
                                                                    {r.body}
                                                                </div>
                                                                <div className="mt-2 flex items-center gap-2 text-sm">
                                                                    <UpvoteIconButton
                                                                        count={r.voteCount}
                                                                        hasVoted={r.hasVoted}
                                                                        disabled={voteBusyId === r.id || !isAuthenticated || !!r.author.isYou}
                                                                        onClick={() => handleVote(r.id)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            setReplyOpenFor((prev) => (prev === r.id ? null : r.id));
                                                                            setReturnFocusEl(e.currentTarget as HTMLElement);
                                                                            if (replyOpenFor !== r.id) scrollToComment(r.id, false);
                                                                        }}
                                                                        className="!border-none p-2 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 flex items-center gap-1"
                                                                        aria-expanded={replyOpenFor === r.id}
                                                                        aria-controls={`replyform-${r.id}`}
                                                                        title="Répondre"
                                                                    >
                                                                        <PiArrowBendDownRightDuotone />
                                                                        Répondre
                                                                    </button>
                                                                    {isAuthenticated && (r.author.isYou || viewerIsAdmin) && (
                                                                        <>
                                                                            {canEditItem(r, viewerIsAdmin) && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="!border-none p-2 font-bold text-sm text-neutral-700"
                                                                                    title="Éditer"
                                                                                    onClick={() => {
                                                                                        const opening = editOpenFor !== r.id;
                                                                                        setEditOpenFor(opening ? r.id : null);
                                                                                        setEditDraft(opening ? r.body : "");
                                                                                    }}
                                                                                    disabled={actionBusyId === r.id}
                                                                                >
                                                                                    <FaEdit />
                                                                                </button>
                                                                            )}

                                                                            {viewerIsAdmin && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="!border-none p-2 font-bold text-sm text-neutral-700"
                                                                                    title="Masquer (admin)"
                                                                                    onClick={() => handleToggleHide(r.id, (r as any).status)}
                                                                                    disabled={actionBusyId === r.id}
                                                                                >
                                                                                    {(r as any).status === "hidden" ? <FaRegEyeSlash /> : <FaRegEye />}
                                                                                </button>
                                                                            )}

                                                                            {canDeleteItem(r, viewerIsAdmin) && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="!border-none p-2 font-bold text-sm text-neutral-700"
                                                                                    title="Supprimer"
                                                                                    onClick={() => setDeleteOpenFor(r.id)}
                                                                                    disabled={actionBusyId === r.id}
                                                                                >
                                                                                    <FaRegTrashAlt />
                                                                                </button>
                                                                            )}

                                                                            {viewerIsAdmin && (
                                                                                <div className="w-checkbox checkbox-field-wrapper col-span-2 !mb-0">
                                                                                    <label
                                                                                        className="w-form-label flex items-center select-none cursor-pointer gap-2 justify-center"
                                                                                        onClick={actionBusyId === r.id ? undefined : () => handleCheck(r.id, !r.isSeen)}
                                                                                    >
                                                                                        <div
                                                                                            aria-hidden="true"
                                                                                            className={`w-checkbox-input !min-h-5 !min-w-5 !h-5 !w-5 w-checkbox-input--inputType-custom checkbox !mr-0 ${
                                                                                                r.isSeen ? "w--redirected-checked" : ""
                                                                                            } ${actionBusyId === r.id ? "opacity-60" : ""}`}
                                                                                        />
                                                                                        <p className="mb-0">Vu</p>
                                                                                    </label>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {editOpenFor === r.id && (
                                                            <InlineEditForm
                                                                id={r.id}
                                                                initialValue={editDraft}
                                                                busy={actionBusyId === r.id}
                                                                onCancel={() => {
                                                                    setEditOpenFor(null);
                                                                    setEditDraft("");
                                                                }}
                                                                onSave={(next) => handleEditSave(r.id, next)}
                                                            />
                                                        )}

                                                        {replyOpenFor === r.id && (
                                                            <ReplyForm
                                                                id={`replyform-${r.id}`}
                                                                parentId={r.id} // on répond à cette réponse
                                                                resourceType={resourceType}
                                                                resourceId={resourceId}
                                                                isAuthenticated={isAuthenticated}
                                                                onDone={() => {
                                                                    setReplyOpenFor(null);
                                                                    returnFocusEl?.focus();
                                                                    router.refresh();
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination à brancher si besoin */}
            {deleteOpenFor && (
                <ModalFromBottom
                    data={{
                        setOpen: (open) => setDeleteOpenFor(open ? deleteOpenFor : null),
                        title: "Confirmer la suppression",
                        message: (
                            <div className="text-neutral-900 text-sm mt-2">
                                <p className="mb-2">Cette action va supprimer définitivement le message.</p>
                                <p className="text-neutral-600">
                                    {viewerIsAdmin
                                        ? "En tant qu’administrateur, la suppression peut être appliquée à n’importe quel message (les réponses associées peuvent aussi être supprimées)."
                                        : "En tant qu’auteur, vous pouvez supprimer votre message pendant 15 minutes après sa création."}
                                </p>
                            </div>
                        ),
                        functionOk: async () => {
                            const id = deleteOpenFor!;
                            setActionBusyId(id);
                            try {
                                await deleteComment({ commentId: id, resourceType, resourceRef: resourceId });
                                router.refresh();
                            } catch (e) {
                                console.error(e);
                            } finally {
                                setActionBusyId(null);
                                setDeleteOpenFor(null);
                            }
                        },
                        functionCancel: () => {
                            setDeleteOpenFor(null);
                        },
                        buttonOkStr: "Supprimer",
                        buttonAnnulerStr: "Annuler",
                        clickOutside: true,
                    }}
                />
            )}
        </div>
    );
}

function ReplyForm({
    id,
    parentId,
    resourceType,
    resourceId,
    isAuthenticated,
    onDone,
}: {
    id: string;
    parentId: string;
    resourceType: CommentResourceType;
    resourceId: string;
    isAuthenticated: boolean;
    onDone: () => void;
}) {
    const [body, setBody] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-focus du composer quand il s'ouvre
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const linkCount = (body.match(/(https?:\/\/|www\.)/gi) || []).length;
    const tooLong = body.length > 1000;
    const tooManyLinks = linkCount > 3;
    const isEmpty = body.trim().length === 0;
    const disable = pending || isEmpty || tooLong || tooManyLinks || (!isAuthenticated && guestName.trim() === "");

    async function submit() {
        if (disable) return;
        setPending(true);
        setError(null);
        try {
            await createComment({
                resourceType,
                resourceId,
                body,
                parentId,
                guestName: isAuthenticated ? undefined : guestName,
                guestEmail: isAuthenticated ? undefined : guestEmail || undefined,
                honeypot: "",
            });
            setBody("");
            setGuestName("");
            setGuestEmail("");
            onDone(); // le parent remet le focus et refresh
        } catch (e: any) {
            setError(e?.message || "Erreur inconnue");
        } finally {
            setPending(false);
        }
    }

    const insertAtCursor = useCallback(
        (text: string) => {
            const el = textareaRef.current;
            if (!el) return;
            const start = el.selectionStart ?? body.length;
            const end = el.selectionEnd ?? body.length;
            const next = body.slice(0, start) + text + body.slice(end);
            setBody(next);
            requestAnimationFrame(() => {
                el.focus();
                const pos = start + text.length;
                el.setSelectionRange(pos, pos);
            });
        },
        [body]
    );

    return (
        <div id={id} className="flex flex-col w-full gap-2 my-4">
            <div className="flex gap-2 flex-wrap items-center">
                {!isAuthenticated && (
                    <>
                        <div className="w-full sm:w-auto">
                            <input
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder="Nom (requis)"
                                maxLength={80}
                                className="w-full rounded-lg border-2 border-neutral-700 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <input
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                placeholder="Email (optionnel)"
                                type="email"
                                className="w-full rounded-lg border-2 border-neutral-700 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                            />
                        </div>
                    </>
                )}
                <div>
                    <Popover
                        content={<span className="mb-0 cursor-pointer p-1 border-2 border-solid border-neutral-600 rounded-lg translate_on_hover h-10 w-10 flex justify-center">😊</span>}
                        popover={
                            <div onMouseDown={(e) => e.preventDefault()}>
                                <div className="flex flex-wrap gap-2 max-w-sm">
                                    {EMOJIS.map((emo) => (
                                        <div
                                            key={emo}
                                            className="cursor-pointer rounded px-1 py-1 text-lg hover:bg-neutral-100"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                insertAtCursor(emo);
                                            }}
                                        >
                                            {emo}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                        isOnClick={true}
                        withShadow={false}
                        small={true}
                    />
                </div>
            </div>

            <textarea
                value={body}
                ref={textareaRef}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Votre réponse…"
                className="min-h-[120px] w-full resize-y rounded-md border-2 border-neutral-700 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
            />

            {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={submit} disabled={disable} className="btn btn-primary small !py-3 !text-sm">
                        {pending ? "Envoi…" : "Répondre"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setBody("");
                            setGuestName("");
                            setGuestEmail("");
                        }}
                        disabled={pending}
                        className="btn btn-secondary small !py-3 !text-sm"
                    >
                        Effacer
                    </button>
                </div>
                <div className="flex items-center justify-end text-xs">
                    <span className={tooLong ? "text-secondary-3" : "text-neutral-500"}>
                        {body.length} / {MAXCOMMENTLENGTH}
                    </span>
                </div>
            </div>
        </div>
    );
}

function InlineEditForm({ id, initialValue, onCancel, onSave, busy }: { id: string; initialValue: string; onCancel: () => void; onSave: (next: string) => void; busy: boolean }) {
    const [value, setValue] = useState(initialValue);
    const tooLong = value.length > 1000;
    const linkCount = (value.match(/(https?:\/\/|www\.)/gi) || []).length;
    const tooManyLinks = linkCount > 3;
    const isEmpty = value.trim().length === 0;
    const disable = busy || isEmpty || tooLong || tooManyLinks;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const insertAtCursor = useCallback(
        (text: string) => {
            const el = textareaRef.current;
            if (!el) return;
            const start = el.selectionStart ?? value.length;
            const end = el.selectionEnd ?? value.length;
            const next = value.slice(0, start) + text + value.slice(end);
            setValue(next);
            requestAnimationFrame(() => {
                el.focus();
                const pos = start + text.length;
                el.setSelectionRange(pos, pos);
            });
        },
        [value]
    );

    return (
        <div id={`edit-${id}`} className="flex flex-col gap-2 my-3">
            <div>
                <Popover
                    content={<span className="mb-0 cursor-pointer p-1 border-2 border-solid border-neutral-600 rounded-lg translate_on_hover h-10 w-10 flex justify-center">😊</span>}
                    popover={
                        <div onMouseDown={(e) => e.preventDefault()}>
                            <div className="flex flex-wrap gap-2 max-w-sm">
                                {EMOJIS.map((emo) => (
                                    <div
                                        key={emo}
                                        className="cursor-pointer rounded px-1 py-1 text-lg hover:bg-neutral-100"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            insertAtCursor(emo);
                                        }}
                                    >
                                        {emo}
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                    isOnClick={true}
                    withShadow={false}
                    small={true}
                />
            </div>
            <textarea
                value={value}
                ref={textareaRef}
                onChange={(e) => setValue(e.target.value)}
                rows={5}
                maxLength={2000}
                className="min-h-[120px] w-full resize-y rounded-md border-2 border-neutral-700 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-2">
                    <button type="button" className="btn btn-primary small !py-3 !text-sm" disabled={disable} onClick={() => onSave(value)}>
                        {busy ? "Enregistrement…" : "Enregistrer"}
                    </button>
                    <button type="button" className="btn btn-secondary small !py-3 !text-sm" onClick={onCancel} disabled={busy}>
                        Annuler
                    </button>
                </div>
                <div className="text-xs">
                    <span className={tooLong ? "text-secondary-3" : "text-neutral-500"}>{value.length} / 1000</span>
                </div>
            </div>
        </div>
    );
}

export function UpvoteIconButton({ count, hasVoted, disabled, onClick }: { count: number; hasVoted?: boolean; disabled: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={!!hasVoted}
            title={hasVoted ? "Retirer mon vote" : "Utile"}
            className={clsx(
                "!border-none px-0 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1",
                hasVoted ? "text-secondary-2" : "text-neutral-600 hover:text-neutral-700"
            )}
        >
            <AiOutlineLike className={clsx("text-xl", !hasVoted && "opacity-80")} />
            <span className={hasVoted ? "font-bold" : undefined}>{count}</span>
        </button>
    );
}
