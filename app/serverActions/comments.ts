// app/serverActions/comments.ts
"use server";

/**
 * Server Actions — Commentaires (V1, texte simple)
 * - Fil à 2 niveaux (message initial + réponses via parentRef)
 * - Upvote unique (utilisateurs connectés uniquement)
 * - Invités autorisés (nom requis, email facultatif)
 * - Posts = publics ; Dashboard (resourceType=user) = propriétaire ou admin
 * - body: string (texte simple), HTML supprimé, shortcodes/emoticons → emoji
 */

import { headers, cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import sanitizeHtml from "sanitize-html";
import { randomUUID } from "crypto";
import type { Reference } from "../types/sfn/blog";
import { emojify as emojifyShortcodes } from "node-emoji";
import { CommentResourceType } from "../types/sfn/comment";
import { POSTCOMMENTRESOURCE } from "../lib/constantes";

const MAX_LENGTH = 1000;
const MAX_LINKS = 3;
const EDIT_WINDOW_MIN = 15;

// -------------------- Utils --------------------
function nowIso() {
    return new Date().toISOString();
}

function minutesBetween(aIso: string, bIso: string) {
    return (new Date(bIso).getTime() - new Date(aIso).getTime()) / 60000;
}

function hasTooManyLinks(text: string) {
    const re = /(https?:\/\/|www\.)/gi;
    const matches = text.match(re);
    return (matches?.length || 0) > MAX_LINKS;
}

/** Texte brut : supprime tout HTML éventuel. */
function sanitizePlainText(body: string) {
    return sanitizeHtml(body ?? "", { allowedTags: [], allowedAttributes: {} }).trim();
}

/** Conversion légère des shortcodes/emoticons courants → emoji (sans dépendance). */
function emojifyShort(text: string) {
    if (!text) return text;
    let out = emojifyShortcodes(text); // :smile: → 😄, :heart: → ❤️, etc.
    // Optionnel: quelques emoticons -> emoji
    out = out
        .replace(/(^|\s):-?\)(?=\s|$)/g, "$1🙂")
        .replace(/(^|\s):-?\((?=\s|$)/g, "$1☹️")
        .replace(/(^|\s);-?\)(?=\s|$)/g, "$1😉")
        .replace(/(^|\s):D(?=\s|$)/g, "$1😃");
    return out;
}

/** Récupère le user Sanity depuis la session (obligatoire si connecté). */
export async function getSessionUserRef() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { session: null, userRef: null, isAdmin: false };

    const user = await sanity.fetch<{ _id: string; isAdmin?: boolean } | null>(`*[_type=="user" && email==$email][0]{ _id, isAdmin }`, { email: session.user.email });

    if (!user?._id) throw new Error("Utilisateur introuvable dans la base.");

    return {
        session,
        userRef: { _type: "reference", _ref: user._id } as const,
        isAdmin: !!user.isAdmin,
    };
}

/** Rate-limit ultra simple par cookie (MVP) : 5 posts / 5 min */
function canPostRateLimited(bucketKey = "cmnt_rate_bucket", limit = 5, windowMin = 5) {
    const storeCookie = cookies().get(bucketKey)?.value;
    const now = Date.now();
    const arr: number[] = storeCookie ? JSON.parse(storeCookie) : [];
    const recent = arr.filter((ts) => now - ts < windowMin * 60_000);
    if (recent.length >= limit) return false;
    recent.push(now);
    cookies().set(bucketKey, JSON.stringify(recent), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });
    return true;
}

// -------------------- Types d’Entrée --------------------
export type CreateCommentInput = {
    resourceType: CommentResourceType;
    resourceId: string; // _id Sanity du post ou du user
    body: string; // texte simple
    guestName?: string; // requis si pas connecté
    guestEmail?: string; // facultatif (invité)
    parentId?: string | null; // null pour top-level, sinon _id du top-level
    honeypot?: string; // doit rester vide
};

export type ListCommentsInput = {
    resourceType: CommentResourceType;
    resourceId: string;
    page?: number; // 1-based
    pageSize?: number; // défaut 20 (top-level)
};

export type ToggleUpvoteInput = { commentId: string };
export type EditCommentInput = { commentId: string; newBody: string; isAdmin: boolean };
export type HideCommentInput = { commentId: string };
export type CountCommentsInput = { resourceType: CommentResourceType; resourceId: string };
export type SetCommentStatusInput = { commentId: string; status: "active" | "hidden" };

// -------------------- CREATE --------------------
export async function createComment(input: CreateCommentInput) {
    const { resourceType, resourceId, body, guestName, guestEmail, parentId = null, honeypot = "" } = input;

    // Honeypot anti-bot
    if (honeypot && honeypot.trim() !== "") throw new Error("Spam détecté.");

    // Rate limit basique (MVP)
    const ip = headers().get("x-forwarded-for") || headers().get("x-real-ip") || "unknown";
    if (!canPostRateLimited()) throw new Error("Vous avez posté trop rapidement. Réessayez bientôt.");

    // Validations générales
    if (!body?.trim()) throw new Error("Message vide.");

    const clean = sanitizePlainText(body);
    if (clean.length > MAX_LENGTH) throw new Error(`Message trop long (max ${MAX_LENGTH} caractères).`);
    if (hasTooManyLinks(clean)) throw new Error(`Trop de liens (max ${MAX_LINKS}).`);
    const finalText = emojifyShort(clean);

    // Contexte utilisateur
    const { session, userRef, isAdmin } = await getSessionUserRef().catch(() => ({ session: null, userRef: null, isAdmin: false }));

    // Cas Dashboard (= ressourceType "fide_dashboard") : il faut être connecté et cibler SON propre userId OU être admin
    if (resourceType === "fide_dashboard") {
        if (!session || !userRef?._ref) throw new Error("Connexion requise pour ce fil.");
        if (userRef._ref !== resourceId && !isAdmin) throw new Error("Accès refusé au fil de ce tableau de bord.");
    }

    // Vérifier existence ressource
    const exists = await sanity.fetch<number>(`count(*[_type==$t && _id==$rid])`, { t: POSTCOMMENTRESOURCE.includes(resourceType as any) ? "post" : "user", rid: resourceId });
    if (exists === 0) throw new Error("Ressource introuvable.");

    // 2 niveaux max : si parentId fourni, il doit référencer un top-level de la même ressource
    let topLevelId: string | null = null;
    if (parentId) {
        const parent = await sanity.fetch<{
            _id: string;
            parentRef?: Reference;
            resourceRef: { _ref: string };
            resourceType: CommentResourceType;
        } | null>(`*[_type=="comment" && _id==$id][0]{ _id, parentRef, resourceRef, resourceType }`, { id: parentId });
        if (!parent) throw new Error("Message parent introuvable.");
        if (parent.resourceType !== resourceType || parent.resourceRef?._ref !== resourceId) {
            throw new Error("Parent et ressource ne correspondent pas.");
        }
        topLevelId = parent.parentRef?._ref ?? parent._id; // si parent est une réponse → remonter au top-level
    }

    // Créer le doc
    const _id = `comment.${randomUUID()}`;
    const doc: any = {
        _id,
        _type: "comment",
        resourceType,
        resourceRef: { _type: "reference", _ref: resourceId },
        parentRef: topLevelId ? { _type: "reference", _ref: topLevelId } : undefined, // top-level
        replyToRef: parentId ? { _type: "reference", _ref: parentId } : undefined, // cible directe (peut être top-level ou réponse)
        body: finalText,
        voteCount: 0,
        status: "active",
        isSeen: isAdmin,
        assignedTo: null,
    };

    if (session && userRef) {
        doc.createdBy = userRef;
    } else {
        // Invité
        if (!guestName?.trim()) throw new Error("Nom requis pour poster en invité.");
        doc.guestName = guestName.trim();
        if (guestEmail?.trim()) doc.guestEmail = guestEmail.trim();
    }

    const created = await sanity.create(doc);

    // --- Notifications (MVP) -----------------------------------------------
    // Règle : si c'est une réponse (parentId défini),
    // - notifier l'auteur du commentaire ciblé (reply target = parentId)
    // - notifier aussi l'auteur du top-level (parentRef) si différent
    // - ne rien faire si l'auteur est un invité (pas de user doc), ni en self-reply

    try {
        const recipients = new Set<string>();

        if (parentId) {
            const replyTo = await sanity.fetch<{
                _id: string;
                createdBy?: { _ref: string } | null;
                parentRef?: { _ref: string } | null;
            } | null>(`*[_type=="comment" && _id==$id][0]{ _id, createdBy, parentRef }`, { id: parentId });

            if (replyTo?.createdBy?._ref) {
                recipients.add(replyTo.createdBy._ref);
            }

            const topLevelId = replyTo?.parentRef?._ref ?? replyTo?._id ?? null;
            if (topLevelId && topLevelId !== replyTo?._id) {
                const root = await sanity.fetch<{ createdBy?: { _ref: string } | null } | null>(`*[_type=="comment" && _id==$id][0]{ createdBy }`, { id: topLevelId });
                if (root?.createdBy?._ref) {
                    recipients.add(root.createdBy._ref);
                }
            }
        }

        // ✅ AJOUT : notifier tous les admins si l'auteur n'est pas admin
        if (!isAdmin) {
            const adminIds = await sanity.fetch<string[]>(`*[_type=="user" && isAdmin==true]._id`);
            for (const adminId of adminIds) recipients.add(adminId);
        }

        // Retirer l'auteur lui-même (pas d'auto-notif)
        const me = (session && userRef?._ref) || null;
        if (me) recipients.delete(me);

        if (recipients.size > 0) {
            const nowIsoStr = new Date().toISOString();
            const tx = sanity.transaction();

            for (const userId of recipients) {
                tx.patch(userId, (p) =>
                    p
                        .setIfMissing({ notifications: [] })
                        .unset([`notifications[reference._ref=="${created._id}"][kind=="comment"]`])
                        .append("notifications", [
                            {
                                kind: "comment",
                                reference: { _type: "reference", _ref: created._id },
                                createdAt: nowIsoStr,
                            },
                        ]),
                );
            }

            await tx.commit({ autoGenerateArrayKeys: true });
        }
    } catch (e) {
        console.error("[comments] notify on create failed:", e);
    }

    //si un admin répond à un commentaire, marquer ce commentaire "vu" + "répondu"
    try {
        if (isAdmin && parentId) {
            await sanity.patch(parentId).set({ isSeen: true, isAnswered: true }).commit({ autoGenerateArrayKeys: true });
        }
    } catch (e) {
        console.error("[comments] failed to mark parent as answered/seen:", e);
    }

    return { id: created._id, createdAt: created._createdAt };
}

// -------------------- LIST --------------------
/**
 * Renvoie les commentaires top-level paginés et leurs réponses.
 * - Posts (resourceType=blog ou pack_fide) : PUBLIC
 * - Dashboard (resourceType=fide_dashboard) : viewer = propriétaire ou admin
 */
export async function listComments(input: ListCommentsInput) {
    const { resourceType, resourceId, page = 1, pageSize = 20 } = input;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const { session, userRef, isAdmin } = await getSessionUserRef().catch(() => ({
        session: null,
        userRef: null,
        isAdmin: false,
    }));
    const viewerId = userRef?._ref || null;

    // Dashboard : seul le propriétaire (ou admin) peut lister
    const canGetThisData = isAdmin || (session && userRef?._ref === resourceId);
    if (["fide_dashboard", "french_dashboard"].includes(resourceType) && !canGetThisData) {
        return { totalTopLevel: 0, items: [], page, pageSize };
    }

    const query = `
{
  "total": count(
    *[_type=="comment" && status=="active" && resourceType==$rt && resourceRef._ref==$rid && !defined(parentRef)]
  ),
  "items": *[_type=="comment" && (status=="active" || $isAdmin == true) && resourceType==$rt && resourceRef._ref==$rid && !defined(parentRef)] | order(_createdAt asc) [${start}...${end}]{
    _id, body, voteCount, _createdAt, _updatedAt, status, isEdited, isSeen,
    "author": select(
      defined(createdBy) => {
        "name": coalesce(createdBy->name, createdBy->email),
        "email": createdBy->email,
        "isYou": createdBy._ref == $viewer,
        "isAdmin": createdBy->isAdmin == true
      },
      defined(guestName) => {"name": guestName, "email": guestEmail, "isYou": false, "isAdmin": false},
      {"name": "Invité", "email": null, "isYou": false, "isAdmin": false}
    ),
    "hasVoted": $viewer != null && count(upvoters[@._ref == $viewer]) > 0,
    "replies": *[_type=="comment" && (status=="active" || $isAdmin == true) && parentRef._ref == ^._id
    ] | order(_createdAt asc){
      _id, body, voteCount, _createdAt, _updatedAt, status, isEdited, isSeen,
      "author": select(
        defined(createdBy) => {
          "name": coalesce(createdBy->name, createdBy->email),
          "email": createdBy->email,
          "isYou": createdBy._ref == $viewer,
          "isAdmin": createdBy->isAdmin == true
        },
        defined(guestName) => {"name": guestName, "email": guestEmail, "isYou": false, "isAdmin": false},
        {"name": "Invité", "email": null, "isYou": false, "isAdmin": false}
      ),
      "replyTo": select(
        defined(replyToRef) => {
          "id": replyToRef->_id,
          "name": select(
            defined(replyToRef->createdBy) => coalesce(replyToRef->createdBy->name, replyToRef->createdBy->email),
            defined(replyToRef->guestName) => replyToRef->guestName,
            "Invité"
          )
        },
        null
      ),
      "hasVoted": $viewer != null && count(upvoters[@._ref == $viewer]) > 0
    }
  }
}`;

    const data = await sanity.fetch(query, {
        rt: resourceType,
        rid: resourceId,
        viewer: viewerId,
        isAdmin,
    });

    return {
        totalTopLevel: (data?.total as number) ?? 0,
        items: (data?.items as any[]) ?? [],
        page,
        pageSize,
    };
}

// -------------------- UPVOTE (toggle, connectés uniquement) --------------------
export async function toggleUpvote(input: ToggleUpvoteInput) {
    const { commentId } = input;
    const { session, userRef } = await getServerSession(authOptions).then(async (s) => {
        if (!s?.user?.email) return { session: null, userRef: null as any };
        const u = await sanity.fetch<{ _id: string } | null>(`*[_type=="user" && email==$email][0]{_id}`, { email: s.user.email });
        return { session: s, userRef: u ? { _type: "reference", _ref: u._id } : null };
    });

    if (!session || !userRef?._ref) throw new Error("Connexion requise pour voter.");

    const doc = await sanity.fetch<{ _id: string; upvoters?: string[]; voteCount?: number } | null>(`*[_type=="comment" && _id==$id][0]{ _id, "upvoters": upvoters[]._ref, voteCount }`, {
        id: commentId,
    });
    if (!doc) throw new Error("Commentaire introuvable.");

    const myId = userRef._ref;
    const hasVoted = (doc.upvoters || []).includes(myId);

    const tx = sanity.transaction();

    if (hasVoted) {
        tx.patch(commentId, {
            unset: [`upvoters[_ref=="${myId}"]`],
            dec: { voteCount: 1 },
        });
    } else {
        tx.patch(commentId, {
            setIfMissing: { upvoters: [] },
            insert: { after: "upvoters[-1]", items: [userRef] },
            inc: { voteCount: 1 },
        });
    }

    await tx.commit();
    return { ok: true, voted: !hasVoted };
}

// -------------------- EDIT (fenêtre 15 min, auteur connecté) --------------------
export async function editComment(input: EditCommentInput) {
    const { commentId, newBody, isAdmin } = input;
    const { session, userRef } = await getServerSession(authOptions).then(async (s) => {
        if (!s?.user?.email) return { session: s, userRef: null as any };
        const u = await sanity.fetch<{ _id: string } | null>(`*[_type=="user" && email==$email][0]{_id}`, { email: s.user.email });
        return { session: s, userRef: u ? { _type: "reference", _ref: u._id } : null };
    });

    if (!session || !userRef?._ref) throw new Error("Connexion requise pour éditer.");

    const doc = await sanity.fetch<{
        _id: string;
        body: string;
        _createdAt: string;
        createdBy?: { _ref: string };
        status: string;
    } | null>(`*[_type=="comment" && _id==$id][0]{ _id, body, _createdAt, createdBy, status }`, { id: commentId });

    if (!doc || doc.status !== "active") throw new Error("Commentaire introuvable.");
    if (doc.createdBy?._ref !== userRef._ref) throw new Error("Vous ne pouvez pas éditer ce message.");

    const ageMin = minutesBetween(doc._createdAt, nowIso());
    if (ageMin > EDIT_WINDOW_MIN && !isAdmin) throw new Error("La fenêtre d’édition est expirée.");

    if (!newBody?.trim()) throw new Error("Message vide.");

    const clean = sanitizePlainText(newBody);
    if (clean.length > MAX_LENGTH) throw new Error(`Message trop long (max ${MAX_LENGTH} caractères).`);
    if (hasTooManyLinks(clean)) throw new Error(`Trop de liens (max ${MAX_LINKS}).`);

    const finalText = emojifyShort(clean);

    await sanity.patch(commentId, { set: { body: finalText, isEdited: true } }).commit();
    return { ok: true };
}

export async function updateComment(input: { commentId: string; body: string; isAdmin: boolean }) {
    return editComment({ commentId: input.commentId, newBody: input.body, isAdmin: input.isAdmin });
}

// -------------------- DELETE (auteur connecté dans fenêtre 15 min OU admin) --------------------

export type DeleteCommentInput = {
    commentId: string;
    resourceType: CommentResourceType;
    resourceRef: string;
};

type CommentLite = {
    _id: string;
    _createdAt: string;
    createdBy?: { _ref: string } | null;
    parentRef?: { _ref: string } | null;
    replyToRef?: { _ref: string } | null;
};

async function computeCascadeOrderForResource(rootId: string, resourceType: CommentResourceType, resourceRef: string): Promise<{ toDelete: string[][] }> {
    // 1) Charger TOUS les comments de la ressource (sans filtrer status)
    const all = await sanity.fetch<CommentLite[]>(
        `*[_type=="comment" && resourceType==$rt && resourceRef._ref==$rid]{
      _id, replyToRef
    }`,
        { rt: resourceType, rid: resourceRef },
    );

    const toDelete = [[rootId]];

    for (let i = 0; i < 100; i++) {
        const lastChildrenCheck = toDelete[toDelete.length - 1];
        const children = all.filter((c) => c.replyToRef && lastChildrenCheck.includes(c.replyToRef._ref)).map((c) => c._id);
        if (children.length === 0) break;
        toDelete.push(children);
    }

    return { toDelete };
}

export async function deleteComment(input: DeleteCommentInput) {
    const { commentId, resourceType, resourceRef } = input;
    const { session, userRef, isAdmin } = await getSessionUserRef();

    // Doc ciblé (pour auteur + fenêtre temps + top-level check)
    const doc = await sanity.fetch<{
        _id: string;
        _createdAt: string;
        createdBy?: { _ref: string } | null;
        parentRef?: { _ref: string } | null;
    } | null>(`*[_type=="comment" && _id==$id][0]{ _id, _createdAt, createdBy, parentRef }`, { id: commentId });
    if (!doc) throw new Error("Commentaire introuvable.");

    const isAuthor = !!(session && userRef && doc.createdBy?._ref === userRef._ref);

    // Cascade calculée STRICTEMENT à partir des comments de la ressource + replyTo
    const { toDelete } = await computeCascadeOrderForResource(commentId, resourceType, resourceRef);

    const ageMin = minutesBetween(doc._createdAt, nowIso());
    const userCanDelete = (isAuthor && ageMin <= EDIT_WINDOW_MIN) || isAdmin;

    if (!userCanDelete) throw new Error("Action non autorisée.");
    const flatOrder = toDelete.slice().reverse().flat();
    const tx = sanity.transaction();
    for (const id of flatOrder) tx.delete(id);
    await tx.commit();

    return { ok: true, deleted: true, cascade: toDelete.length };
}

// -------------------- HIDE (admin via user.isAdmin) --------------------
export async function hideComment(input: HideCommentInput) {
    const { isAdmin } = await getSessionUserRef();
    if (!isAdmin) throw new Error("Réservé aux administrateurs.");
    await sanity.patch(input.commentId, { set: { status: "hidden", isSeen: true } }).commit();
    return { ok: true };
}

export async function setCommentStatus(input: SetCommentStatusInput) {
    const { isAdmin } = await getSessionUserRef();
    if (!isAdmin) throw new Error("Réservé aux administrateurs.");
    const status = input.status === "hidden" ? "hidden" : "active";
    await sanity.patch(input.commentId, { set: { status, isSeen: true } }).commit();
    return { ok: true, status };
}

// -------------------- COUNT (public) --------------------
export async function countComments(input: CountCommentsInput) {
    const { resourceType, resourceId } = input;
    const count = await sanity.fetch<number>(`count(*[_type=="comment" && status=="active" && resourceType==$rt && resourceRef._ref==$rid])`, { rt: resourceType, rid: resourceId });
    return { count };
}

export async function setCommentSeen(commentId: string, isSeen: boolean): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) throw new Error("Unauthorized");

    await sanity.patch(commentId).set({ isSeen }).commit({ autoGenerateArrayKeys: true });
}

export async function setCommentAssignee(commentId: string, assignedTo: "Nico" | "Yoh" | null): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) throw new Error("Unauthorized");

    await sanity.patch(commentId).set({ assignedTo }).commit({ autoGenerateArrayKeys: true });
}
