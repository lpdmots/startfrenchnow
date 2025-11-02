// app/components/notifications/NotificationsMenuClient.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next-intl/link";
import { listNotificationsComment, clearNotifications, markNotificationsSeen } from "@/app/serverActions/notifications";
import type { UINotificationCommentGroup } from "@/app/serverActions/notifications";
import { LuClock } from "react-icons/lu";
import clsx from "clsx";
import { RelativeDate } from "../comments/CommentThread";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { MdChatBubbleOutline, MdNotifications, MdDoneAll } from "react-icons/md";
import { useRouter } from "next/navigation";

type Props = {
    locale?: "fr" | "en";
    className?: string;
    count: number;
};

export default function NotificationsMenuClient({ locale = "fr", className, count }: Props) {
    const router = useRouter();
    const [items, setItems] = useState<UINotificationCommentGroup[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isClearing, startClearing] = useTransition();
    const [isMarking, startMarking] = useTransition();

    useEffect(() => {
        startTransition(() => {
            listNotificationsComment(locale)
                .then((res) => {
                    console.log("[Notifications] items:", res.items);
                    setItems(res.items);
                })
                .catch((err) => {
                    console.error("[Notifications] fetch error:", err);
                    setItems([]);
                });
        });
    }, [locale]);

    const handleClearAll = () => {
        startClearing(() => {
            clearNotifications()
                .then(() => {
                    setItems([]);
                    router.refresh();
                })
                .catch((err) => console.error("[Notifications] clear error:", err));
        });
    };

    // Suppression non bloquante + retrait optimiste de l'item
    const handleVisitGroup = (item: UINotificationCommentGroup) => {
        const ids = Array.from(new Set(item.comments.map((c) => c.id)));
        if (ids.length > 0) {
            startMarking(() => {
                markNotificationsSeen(ids).catch((e) => console.error("[Notifications] markSeen error:", e));
            });
        }
        setItems((prev) => prev.filter((g) => g.link !== item.link));
        router.refresh();
    };

    return (
        <div className={clsx("w-[340px] sm:w-[380px] max-h-[70vh] overflow-y-auto", "card p-4 mt-2", className)}>
            <Header isPending={isPending && items.length === 0} count={count} hasItems={items.length > 0} isClearing={isClearing} onClearAll={handleClearAll} />
            {isPending && items.length === 0 ? (
                <SkeletonList />
            ) : items.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {items.map((g, idx) => (
                        <div key={`${g.link}-${idx}`} style={items.length - 1 === idx ? {} : { borderBottom: "solid 2px var(--neutral-300)" }} className="pb-2">
                            <GroupCard item={g} locale={locale} onVisitGroup={handleVisitGroup} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ====== UI SUB-COMPONENTS ====== */

function Header({ isPending, count, hasItems, isClearing, onClearAll }: { isPending: boolean; count: number; hasItems: boolean; isClearing: boolean; onClearAll: () => void }) {
    return (
        <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <MdNotifications className="text-neutral-700 h-4 w-4" />
                <span>Notifications</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-xs text-neutral-500">{isPending ? "Actualisation…" : count > 0 ? `${count} commentaire(s)` : "Aucune"}</div>

                {hasItems && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        disabled={isClearing}
                        className={clsx("btn small btn-primary inline-flex items-center gap-1 rounded-md border border-neutral-300 !px-2 !py-1 text-xs font-medium")}
                        aria-label="Tout marquer comme vu"
                        title="Tout marquer comme vu"
                    >
                        <MdDoneAll className="h-4 w-4" />
                        {isClearing ? "… " : "Vu"}
                    </button>
                )}
            </div>
        </div>
    );
}

function GroupCard({ item, locale, onVisitGroup }: { item: UINotificationCommentGroup; locale?: "fr" | "en"; onVisitGroup: (item: UINotificationCommentGroup) => void }) {
    const comments = item.comments.slice(0, 3);
    const moreCount = item.comments.length - comments.length;

    // Clique gauche standard uniquement → suppression non bloquante + navigation
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        if (
            e.button !== 0 || // only left click
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey
        ) {
            return; // on ne gère pas la suppression pour les ouvertures modifiées / nouvel onglet
        }
        onVisitGroup(item); // fire & forget + retrait optimiste
    };

    return (
        <Link href={item.link} onClick={handleClick} className={clsx("block rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 no-underline text-neutral-800", "transition-colors")}>
            <div className="flex flex-col w-full">
                <div className="flex w-full gap-2 items-center">
                    <div className="h-9 w-9 rounded-lg bg-neutral-200/70 flex items-center justify-center">
                        <Image
                            src={item.image ? urlFor(item.image).url() : "/images/instructeur-cours-prives.png"}
                            alt={item.title || "Image"}
                            width={36}
                            height={36}
                            className="h-9 rounded-lg object-contain"
                        />
                    </div>

                    <div className="min-w-0 flex-1 grow-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2">{item.title || "Mon suivi FIDE"}</h3>
                            <span className="shrink-0 ml-auto inline-flex items-center rounded-full bg-neutral-900 text-white px-2 py-0.5 text-xs">{item.comments.length}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-2 flex flex-col w-full gap-2">
                    {comments.map((c, i) => (
                        <div key={i} className="flex flex-col w-full">
                            <div className="w-full flex justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <MdChatBubbleOutline className="text-neutral-700 text-sm" />
                                    <span className="font-medium text-neutral-500 text-sm line-clamp-1">{c.name}</span>
                                </div>
                                <span className="inline-flex items-center gap-1 shrink-0">
                                    <LuClock className="w-3.5 h-3.5 text-neutral-500" />
                                    <RelativeDate iso={c.createdAt} locale={locale} small={true} />
                                </span>
                            </div>
                            <p className="text-sm text-neutral-700 line-clamp-2 italic mb-0">{c.truncatedText}</p>
                        </div>
                    ))}
                    {moreCount > 0 && <div className="pl-3 text-xs text-neutral-500">+ {moreCount} autre(s) réponse(s)</div>}
                </div>
            </div>
        </Link>
    );
}

function EmptyState() {
    return <div className="px-3 py-6 text-center text-sm text-neutral-600">Aucune notification pour le moment.</div>;
}

function SkeletonList() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 p-3">
                    <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-neutral-200 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-2/3 bg-neutral-200 rounded animate-pulse" />
                            <div className="h-3 w-5/6 bg-neutral-200 rounded animate-pulse" />
                            <div className="h-3 w-1/2 bg-neutral-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
