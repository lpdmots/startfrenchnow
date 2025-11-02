// app/serverActions/notifications.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import { Image } from "../types/sfn/blog";
import { getSessionUserRef } from "./comments";

type Locale = "fr" | "en";

export type UINotificationCommentGroup = {
    link: string; // URL vers la ressource + ancre #comment-<idPlusRécent>
    image?: Image; // resourceRef.mainImage
    title: string; // FR/EN selon locale (fallback si manquant)
    comments: {
        id: string; // comment id
        name: string; // createdBy.name || guestName
        truncatedText: string; // body tronqué à 100
        createdAt: string; // _createdAt du commentaire
    }[];
    createdAt: string; // date de création de la notif la plus récente du groupe
};

function truncate100(s: string | undefined): string {
    const t = (s ?? "").trim();
    if (t.length <= 100) return t;
    // coupe proprement sur un espace si possible
    const cut = t.slice(0, 100);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

function buildResourceUrl(resourceType?: string, slug?: string): string {
    switch (resourceType) {
        case "blog":
            return slug ? `/blog/post/${slug}` : `/blog`;
        case "pack_fide":
            return slug ? `/fide/videos/${slug}` : `/fide/videos`;
        case "fide_dashboard":
            return `/fide/dashboard`;
        default:
            return `/`; // fallback minimal
    }
}

/**
 * listNotificationsComment
 * - lit les notifications "comment" de l'utilisateur connecté
 * - dé-référence les commentaires et leurs ressources (post/video/dashboard)
 * - regroupe par (resourceType, resourceRef._id)
 * - construit des groupes triés par createdAt (notif la plus récente du groupe)
 * - chaque groupe: link (vers ressource + ancre #comment-<id plus récent>), image, title FR/EN, liste de commentaires (triés récents → anciens)
 */
export async function listNotificationsComment(locale: Locale = "fr"): Promise<{ items: UINotificationCommentGroup[] }> {
    const { userRef: uidRef } = await getSessionUserRef();

    // NB: on filtre kind == "comment" dès le GROQ pour éviter du bruit inutile
    const data = await sanity.fetch<{
        notifications?: Array<{
            createdAt?: string; // createdAt de la notif (peut être absent, fallback sur _createdAt du comment)
            reference?: {
                _id: string; // comment id
                _createdAt: string; // création du commentaire
                body?: string;
                resourceType?: string; // "blog" | "pack_fide" | "fide_dashboard"
                createdBy?: { name?: string } | null;
                guestName?: string | null;
                resourceRef?: {
                    _id: string;
                    _type: string;
                    title?: string;
                    title_en?: string;
                    mainImage?: Image;
                    slug?: string; // alias de slug.current
                } | null;
            } | null;
        }>;
    }>(
        `*[_type=="user" && _id==$uid][0]{
      "notifications": notifications[ kind == "comment" ]{
        createdAt,
        reference->{
          _id,
          _createdAt,
          body,
          resourceType,
          createdBy->{ name },
          guestName,
          "resourceRef": resourceRef->{
            _id,
            _type,
            title,
            title_en,
            mainImage,
            "slug": slug.current
          }
        }
      }
    }`,
        { uid: uidRef?._ref || "" }
    );

    const groups = new Map<
        string,
        {
            resourceType?: string;
            resourceId?: string;
            slug?: string;
            image?: Image;
            titleFr?: string;
            titleEn?: string;
            comments: { name: string; truncatedText: string; createdAt: string; id: string }[];
            notifCreatedAts: string[]; // pour max() notif createdAt
        }
    >();

    for (const n of data?.notifications ?? []) {
        const ref = n.reference;
        if (!ref || !ref._id) continue;

        const r = ref.resourceRef;
        const resourceType = ref.resourceType;
        const resourceId = r?._id;
        if (!resourceType || !resourceId) continue; // sans ressource on ne peut pas grouper

        const key = `${resourceType}::${resourceId}`;
        if (!groups.has(key)) {
            groups.set(key, {
                resourceType,
                resourceId,
                slug: r?.slug,
                image: r?.mainImage,
                titleFr: r?.title,
                titleEn: r?.title_en,
                comments: [],
                notifCreatedAts: [],
            });
        }
        const g = groups.get(key)!;

        // Auteur
        const name = ref.createdBy?.name || ref.guestName || "Utilisateur";

        // Comment meta
        const truncatedText = truncate100(ref.body);
        const commentCreatedAt = ref._createdAt;
        g.comments.push({
            name,
            truncatedText,
            createdAt: commentCreatedAt,
            id: ref._id,
        });

        // Notif createdAt (fallback sur comment _createdAt si vide)
        g.notifCreatedAts.push(n.createdAt || commentCreatedAt);
    }

    // Assemblage final
    const items: UINotificationCommentGroup[] = Array.from(groups.values()).map((g) => {
        // tri des commentaires du groupe: récents → anciens
        g.comments.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
        const latestCommentId = g.comments[0]?.id;

        // titre selon locale (fallback)
        const title = locale === "en" ? g.titleEn || g.titleFr || "" : g.titleFr || g.titleEn || "";

        // createdAt du groupe = notif la plus récente (fallback inclus)
        const groupCreatedAt = g.notifCreatedAts.reduce((max, cur) => (cur > max ? cur : max), "");

        const baseUrl = buildResourceUrl(g.resourceType, g.slug);
        const link = latestCommentId ? `${baseUrl}#comment-${latestCommentId}` : baseUrl;

        return {
            link,
            image: g.image,
            title,
            comments: g.comments.map(({ name, truncatedText, createdAt, id }) => ({
                name,
                truncatedText,
                createdAt,
                id,
            })),
            createdAt: groupCreatedAt,
        };
    });

    // tri des groupes: plus récent (par createdAt groupe) en premier
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    console.log({ items });
    return { items };
}

/**
 * markNotificationsSeen
 * - Retire les notifs correspondant à un post donné (dédup ciblé)
 * - Idempotent: si elle n’existe pas, pas d’erreur
 */
export async function markNotificationsSeen(commentIds: string[]): Promise<void> {
    const ids = Array.from(new Set((commentIds || []).filter(Boolean)));
    if (ids.length === 0) return;

    const { userRef: uid, isAdmin } = await getSessionUserRef();
    if (!uid?._ref) return;

    // Sélecteurs pour retirer les notifs ciblées
    const selectors = ids.map((id) => `notifications[reference._ref=="${id}"]`);

    if (isAdmin) {
        // Patch "vu" sur les commentaires existants + unset notifs, en une seule transaction
        const existing = await sanity.fetch<string[]>(`*[_type=="comment" && _id in $ids][]._id`, { ids });

        const tx = sanity.transaction();

        for (const cid of existing) {
            tx.patch(cid, (p) => p.set({ isSeen: true }));
        }

        tx.patch(uid._ref, (p) => p.unset(selectors));

        await tx.commit({ autoGenerateArrayKeys: true });
    } else {
        // Non-admin : on ne modifie que les notifications
        await sanity.patch(uid._ref).unset(selectors).commit({ autoGenerateArrayKeys: true });
    }
}

/**
 * clearNotifications
 * - Vide la liste des notifications (tout marquer comme vu)
 */
export async function clearNotifications(): Promise<void> {
    const { userRef: uid, isAdmin } = await getSessionUserRef();
    if (!uid?._ref) return;

    if (isAdmin) {
        // Récupère tous les IDs de commentaires référencés dans les notifs "comment"
        let commentIds = await sanity.fetch<string[]>(`*[_type=="user" && _id==$id][0].notifications[kind=="comment" && defined(reference._ref)].reference._ref`, { id: uid._ref });
        commentIds = Array.from(new Set((commentIds || []).filter(Boolean)));

        // Marque les commentaires "vu" + vide les notifications en une transaction
        const existing = commentIds.length ? await sanity.fetch<string[]>(`*[_type=="comment" && _id in $ids][]._id`, { ids: commentIds }) : [];

        const tx = sanity.transaction();

        for (const cid of existing) {
            tx.patch(cid, (p) => p.set({ isSeen: true }));
        }

        tx.patch(uid._ref, (p) => p.set({ notifications: [] }));

        await tx.commit({ autoGenerateArrayKeys: true });
    } else {
        // Non-admin : on vide seulement les notifications
        await sanity.patch(uid._ref).set({ notifications: [] }).commit({ autoGenerateArrayKeys: true });
    }
}
