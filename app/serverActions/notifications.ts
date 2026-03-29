// app/serverActions/notifications.ts
"use server";

import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import { Image } from "../types/sfn/blog";
import { getSessionUserRef } from "./comments";

type Locale = "fr" | "en";

export type UINotificationCommentGroup = {
    kind: "comment";
    id: string;
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

export type UINotificationSystemItem = {
    kind: "system";
    key: string;
    title: string;
    body: string;
    link?: string;
    createdAt: string;
};

export type UINotificationItem = UINotificationCommentGroup | UINotificationSystemItem;

function escapePathFilterValue(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function truncate100(s: string | undefined): string {
    const t = (s ?? "").trim();
    if (t.length <= 100) return t;
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
        case "french_dashboard":
            return `/courses/dashboard`;
        default:
            return `/`;
    }
}

/**
 * listNotifications
 * - lit toutes les notifications de l'utilisateur connecté
 * - "comment": groupées par ressource (comportement existant)
 * - "system": rendues en items simples
 */
export async function listNotifications(locale: Locale = "fr"): Promise<{ items: UINotificationItem[] }> {
    const { userRef: uidRef } = await getSessionUserRef();

    const data = await sanity.fetch<{
        notifications?: Array<{
            _key?: string;
            kind?: string;
            title?: string;
            body?: string;
            link?: string;
            createdAt?: string;
            reference?: {
                _id: string;
                _createdAt: string;
                body?: string;
                resourceType?: string;
                createdBy?: { name?: string } | null;
                guestName?: string | null;
                resourceRef?: {
                    _id: string;
                    _type: string;
                    title?: string;
                    title_en?: string;
                    mainImage?: Image;
                    slug?: string;
                } | null;
            } | null;
        }>;
    }>(
        `*[_type=="user" && _id==$uid][0]{
          "notifications": notifications[]{
            _key,
            kind,
            title,
            body,
            link,
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
        { uid: uidRef?._ref || "" },
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
            notifCreatedAts: string[];
        }
    >();
    const systemItems: UINotificationSystemItem[] = [];

    for (const [idx, n] of (data?.notifications ?? []).entries()) {
        if (n.kind === "system") {
            const title = (n.title || "").trim() || (locale === "fr" ? "Notification" : "Notification");
            const body = (n.body || "").trim();
            const key = (n._key || `system-${idx}-${n.createdAt || ""}`).trim();
            if (!key) continue;
            systemItems.push({
                kind: "system",
                key,
                title,
                body,
                link: n.link || undefined,
                createdAt: n.createdAt || "",
            });
            continue;
        }

        if (n.kind !== "comment") continue;
        const ref = n.reference;
        if (!ref || !ref._id) continue;

        const r = ref.resourceRef;
        const resourceType = ref.resourceType;
        const resourceId = r?._id;
        if (!resourceType || !resourceId) continue;

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

        const name = ref.createdBy?.name || ref.guestName || "Utilisateur";
        const truncatedText = truncate100(ref.body);
        const commentCreatedAt = ref._createdAt;
        g.comments.push({
            name,
            truncatedText,
            createdAt: commentCreatedAt,
            id: ref._id,
        });

        g.notifCreatedAts.push(n.createdAt || commentCreatedAt);
    }

    const commentItems: UINotificationCommentGroup[] = Array.from(groups.entries()).map(([groupKey, g]) => {
        g.comments.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
        const latestCommentId = g.comments[0]?.id;
        const title = locale === "en" ? g.titleEn || g.titleFr || "" : g.titleFr || g.titleEn || "";
        const groupCreatedAt = g.notifCreatedAts.reduce((max, cur) => (cur > max ? cur : max), "");
        const baseUrl = buildResourceUrl(g.resourceType, g.slug);
        const link = latestCommentId ? `${baseUrl}#comment-${latestCommentId}` : baseUrl;

        return {
            kind: "comment",
            id: groupKey,
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

    const items: UINotificationItem[] = [...commentItems, ...systemItems];
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    return { items };
}

export async function listNotificationsComment(locale: Locale = "fr"): Promise<{ items: UINotificationCommentGroup[] }> {
    const { items } = await listNotifications(locale);
    return {
        items: items.filter((item): item is UINotificationCommentGroup => item.kind === "comment"),
    };
}

/**
 * markNotificationsSeen (comment)
 */
export async function markNotificationsSeen(commentIds: string[]): Promise<void> {
    const ids = Array.from(new Set((commentIds || []).filter(Boolean)));
    if (ids.length === 0) return;

    const { userRef: uid, isAdmin } = await getSessionUserRef();
    if (!uid?._ref) return;

    const selectors = ids.map((id) => `notifications[reference._ref=="${escapePathFilterValue(id)}"]`);

    if (isAdmin) {
        const existing = await sanity.fetch<string[]>(`*[_type=="comment" && _id in $ids][]._id`, { ids });
        const tx = sanity.transaction();
        for (const cid of existing) {
            tx.patch(cid, (p) => p.set({ isSeen: true }));
        }
        tx.patch(uid._ref, (p) => p.unset(selectors));
        await tx.commit({ autoGenerateArrayKeys: true });
    } else {
        await sanity.patch(uid._ref).unset(selectors).commit({ autoGenerateArrayKeys: true });
    }
}

/**
 * markSystemNotificationsSeen
 */
export async function markSystemNotificationsSeen(notificationKeys: string[]): Promise<void> {
    const keys = Array.from(new Set((notificationKeys || []).filter(Boolean)));
    if (keys.length === 0) return;

    const { userRef: uid } = await getSessionUserRef();
    if (!uid?._ref) return;

    const selectors = keys.map((key) => `notifications[_key=="${escapePathFilterValue(key)}"]`);
    await sanity.patch(uid._ref).unset(selectors).commit({ autoGenerateArrayKeys: true });
}

/**
 * clearNotifications
 * - vide toutes les notifications (comment + system)
 */
export async function clearNotifications(): Promise<void> {
    const { userRef: uid, isAdmin } = await getSessionUserRef();
    if (!uid?._ref) return;

    if (isAdmin) {
        let commentIds = await sanity.fetch<string[]>(`*[_type=="user" && _id==$id][0].notifications[kind=="comment" && defined(reference._ref)].reference._ref`, { id: uid._ref });
        commentIds = Array.from(new Set((commentIds || []).filter(Boolean)));
        const existing = commentIds.length ? await sanity.fetch<string[]>(`*[_type=="comment" && _id in $ids][]._id`, { ids: commentIds }) : [];

        const tx = sanity.transaction();
        for (const cid of existing) {
            tx.patch(cid, (p) => p.set({ isSeen: true }));
        }
        tx.patch(uid._ref, (p) => p.set({ notifications: [] }));
        await tx.commit({ autoGenerateArrayKeys: true });
    } else {
        await sanity.patch(uid._ref).set({ notifications: [] }).commit({ autoGenerateArrayKeys: true });
    }
}
