// app/serverActions/comments.ts
"use server";

/**
 * Server Actions pour le module Commentaires (V1)
 * - Fil à 2 niveaux (message initial + réponses via parentRef)
 * - Upvote unique (utilisateurs connectés uniquement)
 * - Invités autorisés pour poster (nom requis, email facultatif)
 * - Lecture/écriture via Server Actions (pas d’accès client direct)
 * - Stockage du corps en Slate JSON (Descendant[])
 */

import { headers, cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import { randomUUID } from "crypto";
import type { Descendant } from "slate";
import type { Reference } from "../types/sfn/blog";

type ResourceType = "post" | "user";

const MAX_TEXT_LENGTH = 1000;
const MAX_LINKS = 3;
const EDIT_WINDOW_MIN = 15;

// -------------------- Utils --------------------
function nowIso() {
    return new Date().toISOString();
}

function minutesBetween(aIso: string, bIso: string) {
    return (new Date(bIso).getTime() - new Date(aIso).getTime()) / 60000;
}

function parseBodies<T extends { body?: unknown; replies?: any[] }>(docs: T[]): T[] {
    return (docs || []).map((d) => {
        if (typeof (d as any).body === "string") {
            try {
                (d as any).body = JSON.parse((d as any).body as string);
            } catch {}
        }
        if (Array.isArray(d.replies)) {
            (d as any).replies = d.replies.map((r: any) => {
                if (typeof r?.body === "string") {
                    try {
                        r.body = JSON.parse(r.body);
                    } catch {}
                }
                return r;
            });
        }
        return d;
    });
}

/** Autorise seulement http/https/mailto; sinon on invalide le lien. */
function isAllowedUrl(url: unknown): url is string {
    if (typeof url !== "string") return false;
    try {
        if (url.startsWith("mailto:")) return true;
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

/** Parcourt un document Slate pour :
 * - retirer les propriétés non attendues,
 * - ne garder que les types autorisés (paragraph/p, ul, ol, li, link/a),
 * - ne garder que les marks bold/italic,
 * - valider et normaliser les URLs.
 * Retourne {docNettoye, plainText, linkCount}.
 */
function sanitizeSlateDoc(input: unknown): {
    clean: Descendant[];
    plainText: string;
    linkCount: number;
} {
    const allowedBlocks = new Set(["p", "paragraph", "ul", "ol", "li", "a", "link"]);
    let plain: string[] = [];
    let links = 0;

    function cleanNode(node: any): any | null {
        // Texte (leaf)
        if (typeof node?.text === "string") {
            plain.push(node.text);
            // On ne garde que bold/italic
            const leaf: any = { text: node.text };
            if (node.bold) leaf.bold = true;
            if (node.italic) leaf.italic = true;
            return leaf;
        }

        // Élement
        const type = node?.type;
        if (!allowedBlocks.has(type)) {
            // Si le type n'est pas autorisé mais a des enfants, on "bypass" en gardant juste les enfants nettoyés
            if (Array.isArray(node?.children)) {
                const cleanedChildren = node.children.map(cleanNode).filter(Boolean);
                if (cleanedChildren.length === 0) return null;
                // pas de wrapper, on remontera les enfants au niveau supérieur (fait à l'appelant)
                return { type: "fragment", children: cleanedChildren };
            }
            return null;
        }

        // Nettoyage commun
        if (!Array.isArray(node?.children)) return null;
        const children = node.children
            .map(cleanNode)
            .filter(Boolean)
            // "aplatissement" si un enfant a type "fragment"
            .flatMap((n: any) => (n?.type === "fragment" ? n.children ?? [] : [n]));

        if (children.length === 0) {
            // garder un paragraphe vide si besoin
            if (type === "p" || type === "paragraph") return { type: "p", children: [{ text: "" }] };
            return null;
        }

        // Lien
        if (type === "a" || type === "link") {
            const url = node.url ?? node.href;
            if (!isAllowedUrl(url)) {
                // on supprime l'enveloppe lien, on garde le contenu
                return { type: "p", children };
            }
            links++;
            return { type: "a", url, children };
        }

        // Listes/paragraphes
        if (type === "ul" || type === "ol") {
            return { type, children };
        }
        if (type === "li") {
            return { type: "li", children };
        }
        // paragraph
        return { type: "p", children };
    }

    if (!Array.isArray(input)) {
        // si pas un tableau, on force un paragraphe texte
        const text = typeof input === "string" ? input : "";
        plain.push(text);
        return {
            clean: [{ type: "p", children: [{ text }] } as unknown as Descendant],
            plainText: text,
            linkCount: 0,
        };
    }

    const cleaned: any[] = [];
    for (const n of input) {
        const c = cleanNode(n);
        if (!c) continue;
        if (c.type === "fragment") {
            cleaned.push(...(c.children ?? []));
        } else {
            cleaned.push(c);
        }
    }

    // S'assurer qu'on a au moins un paragraphe
    if (cleaned.length === 0) {
        cleaned.push({ type: "p", children: [{ text: "" }] });
    }

    const plainText = plain.join("");
    // Compter aussi les occurrences d'URL en texte brut (au cas où l'éditeur n'ait pas créé de lien)
    const regex = /(https?:\/\/|www\.)/gi;
    const textUrlCount = (plainText.match(regex) || []).length;

    return { clean: cleaned as Descendant[], plainText, linkCount: Math.max(links, textUrlCount) };
}

/** Récupère le user Sanity depuis la session (obligatoire si connecté). */
async function getSessionUserRef() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { session: null, userRef: null, isAdmin: false };

    const user = await sanity.fetch<{ _id: string; isAdmin?: boolean } | null>(`*[_type=="user" && email==$email][0]{ _id, isAdmin }`, { email: session.user.email });

    if (!user?._id) {
        // Ton choix : l’utilisateur connecté existe "forcément" en base
        throw new Error("Utilisateur introuvable dans la base.");
    }

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
    resourceType: ResourceType; // "post" | "user"
    resourceId: string; // _id Sanity du post ou du user
    body: Descendant[]; // Slate JSON
    guestName?: string; // requis si pas connecté
    guestEmail?: string; // facultatif (invité)
    parentId?: string | null; // null pour top-level, sinon _id du top-level
    honeypot?: string; // doit rester vide
};

export type ListCommentsInput = {
    resourceType: ResourceType;
    resourceId: string;
    page?: number; // 1-based
    pageSize?: number; // défaut 20 (top-level)
};

export type ToggleUpvoteInput = { commentId: string };
export type EditCommentInput = { commentId: string; newBody: Descendant[] };
export type HideCommentInput = { commentId: string };
export type CountCommentsInput = { resourceType: ResourceType; resourceId: string };

// -------------------- CREATE --------------------
export async function createComment(input: CreateCommentInput) {
    const { resourceType, resourceId, body, guestName, guestEmail, parentId = null, honeypot = "" } = input;

    // Honeypot anti-bot
    if (honeypot && honeypot.trim() !== "") throw new Error("Spam détecté.");

    // Rate limit basique (MVP)
    const ip = headers().get("x-forwarded-for") || headers().get("x-real-ip") || "unknown";
    if (!canPostRateLimited()) throw new Error("Vous avez posté trop rapidement. Réessayez bientôt.");

    // Validations générales
    if (!resourceId || (resourceType !== "post" && resourceType !== "user")) throw new Error("Ressource invalide.");
    // Sanitize/valide le doc Slate
    const { clean, plainText, linkCount } = sanitizeSlateDoc(body);
    if (!plainText.trim()) throw new Error("Message vide.");
    if (plainText.length > MAX_TEXT_LENGTH) throw new Error(`Message trop long (max ${MAX_TEXT_LENGTH} caractères).`);
    if (linkCount > MAX_LINKS) throw new Error(`Trop de liens (max ${MAX_LINKS}).`);

    // Contexte utilisateur
    const { session, userRef } = await getSessionUserRef().catch(() => ({ session: null, userRef: null, isAdmin: false }));

    // Cas Dashboard (= ressource "user") : il faut être connecté et cibler SON propre userId
    if (resourceType === "user") {
        if (!session || !userRef?._ref) throw new Error("Connexion requise pour ce fil.");
        if (userRef._ref !== resourceId) throw new Error("Accès refusé au fil de ce tableau de bord.");
    }

    // Vérifier existence ressource
    const exists = await sanity.fetch<number>(`count(*[_type==$t && _id==$rid])`, { t: resourceType === "post" ? "post" : "user", rid: resourceId });
    if (exists === 0) throw new Error("Ressource introuvable.");

    // 2 niveaux max : si parentId fourni, il doit référencer un top-level de la même ressource
    if (parentId) {
        const parent = await sanity.fetch<{
            _id: string;
            parentRef?: Reference;
            resourceRef: { _ref: string };
            resourceType: ResourceType;
        } | null>(`*[_type=="comment" && _id==$id][0]{ _id, parentRef, resourceRef, resourceType }`, { id: parentId });
        if (!parent) throw new Error("Message parent introuvable.");
        if (parent.parentRef) throw new Error("Réponse à une réponse interdite (2 niveaux max).");
        if (parent.resourceType !== resourceType || parent.resourceRef?._ref !== resourceId) {
            throw new Error("Parent et ressource ne correspondent pas.");
        }
    }

    // Créer le doc
    const _id = `comment.${randomUUID()}`;
    const doc: any = {
        _id,
        _type: "comment",
        resourceType,
        resourceRef: { _type: "reference", _ref: resourceId },
        parentRef: parentId ? { _type: "reference", _ref: parentId } : undefined,
        body: JSON.stringify(clean),
        voteCount: 0,
        status: "active",
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
    return { id: created._id, createdAt: created._createdAt };
}

// -------------------- LIST --------------------
/**
 * Renvoie les commentaires top-level paginés et leurs réponses.
 * - Posts (resourceType=post) : PUBLIC
 * - Dashboard (resourceType=user) : viewer doit être le user (ou admin)
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
    if (resourceType === "user") {
        if (!session || (!isAdmin && viewerId !== resourceId)) {
            return { totalTopLevel: 0, items: [], page, pageSize };
        }
    }

    // GROQ : pour posts => public ; pour dashboard => filtré
    const query = `
  {
    "total": count(
      *[_type=="comment" && status=="active" && resourceType==$rt && resourceRef._ref==$rid && !defined(parentRef)
        && (
          $rt == "post"
          || $isAdmin == true
          || (defined(createdBy._ref) && createdBy._ref==$viewer)
        )
      ]
    ),
    "items": *[_type=="comment" && status=="active" && resourceType==$rt && resourceRef._ref==$rid && !defined(parentRef)
      && (
        $rt == "post"
        || $isAdmin == true
        || (defined(createdBy._ref) && createdBy._ref==$viewer)
      )
    ] | order(_createdAt asc) [${start}...${end}]{
      _id, body, voteCount, _createdAt,
      "author": select(
        defined(createdBy) => createdBy->{"name": coalesce(name, email), "email": email},
        defined(guestName) => {"name": guestName, "email": guestEmail},
        {"name": "Invité", "email": null}
      ),
      "replies": *[_type=="comment" && status=="active" && parentRef._ref == ^._id
        && (
          $rt == "post"
          || $isAdmin == true
          || (defined(createdBy._ref) && createdBy._ref==$viewer)
        )
      ] | order(_createdAt asc){
        _id, body, voteCount, _createdAt,
        "author": select(
          defined(createdBy) => createdBy->{"name": coalesce(name, email), "email": email},
          defined(guestName) => {"name": guestName, "email": guestEmail},
          {"name": "Invité", "email": null}
        )
      }
    }
  }`;

    const data = await sanity.fetch<any>(query, {
        rt: resourceType,
        rid: resourceId,
        viewer: viewerId,
        isAdmin,
    });

    const items = parseBodies(data?.items || []);

    return {
        totalTopLevel: (data?.total as number) ?? 0,
        items,
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

    // Récupère juste les _ref pour simplifier
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
    const { commentId, newBody } = input;
    const { session, userRef } = await getServerSession(authOptions).then(async (s) => {
        if (!s?.user?.email) return { session: s, userRef: null as any };
        const u = await sanity.fetch<{ _id: string } | null>(`*[_type=="user" && email==$email][0]{_id}`, { email: s.user.email });
        return { session: s, userRef: u ? { _type: "reference", _ref: u._id } : null };
    });

    if (!session || !userRef?._ref) throw new Error("Connexion requise pour éditer.");

    const doc = await sanity.fetch<{
        _id: string;
        body: Descendant[];
        _createdAt: string;
        createdBy?: { _ref: string };
        status: string;
    } | null>(`*[_type=="comment" && _id==$id][0]{ _id, body, _createdAt, createdBy, status }`, { id: commentId });

    if (!doc || doc.status !== "active") throw new Error("Commentaire introuvable.");
    if (doc.createdBy?._ref !== userRef._ref) throw new Error("Vous ne pouvez pas éditer ce message.");

    const ageMin = minutesBetween(doc._createdAt, nowIso());
    if (ageMin > EDIT_WINDOW_MIN) throw new Error("La fenêtre d’édition est expirée.");

    // Sanitize/valide le nouveau doc Slate
    const { clean, plainText, linkCount } = sanitizeSlateDoc(newBody);
    if (!plainText.trim()) throw new Error("Message vide.");
    if (plainText.length > MAX_TEXT_LENGTH) throw new Error(`Message trop long (max ${MAX_TEXT_LENGTH} caractères).`);
    if (linkCount > MAX_LINKS) throw new Error(`Trop de liens (max ${MAX_LINKS}).`);

    await sanity.patch(commentId, { set: { body: JSON.stringify(clean) } }).commit();
    return { ok: true };
}

// -------------------- HIDE (admin via user.isAdmin) --------------------
export async function hideComment(input: HideCommentInput) {
    const { isAdmin } = await getSessionUserRef();
    if (!isAdmin) throw new Error("Réservé aux administrateurs.");
    await sanity.patch(input.commentId, { set: { status: "hidden" } }).commit();
    return { ok: true };
}

// -------------------- COUNT (public) --------------------
export async function countComments(input: CountCommentsInput) {
    const { resourceType, resourceId } = input;
    const count = await sanity.fetch<number>(`count(*[_type=="comment" && status=="active" && resourceType==$rt && resourceRef._ref==$rid])`, { rt: resourceType, rid: resourceId });
    return { count };
}
