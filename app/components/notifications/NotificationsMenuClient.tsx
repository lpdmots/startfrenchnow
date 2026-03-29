// app/components/notifications/NotificationsMenuClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next-intl/link";
import { clearNotifications, listNotifications, markNotificationsSeen, markSystemNotificationsSeen } from "@/app/serverActions/notifications";
import type { UINotificationCommentGroup, UINotificationItem, UINotificationSystemItem } from "@/app/serverActions/notifications";
import { LuClock } from "react-icons/lu";
import clsx from "clsx";
import { RelativeDate } from "../comments/CommentThread";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { MdChatBubbleOutline, MdNotifications, MdDoneAll, MdInfoOutline } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ModalFromBottomWithPortal } from "../animations/ModalFromBottomWithPortal";

type Props = {
    locale?: "fr" | "en";
    className?: string;
    count: number;
};

export default function NotificationsMenuClient({ locale = "fr", className, count }: Props) {
    const router = useRouter();
    const [items, setItems] = useState<UINotificationItem[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isClearing, startClearing] = useTransition();
    const [isMarking, startMarking] = useTransition();
    const [activeSystemItem, setActiveSystemItem] = useState<UINotificationSystemItem | null>(null);

    useEffect(() => {
        startTransition(() => {
            listNotifications(locale)
                .then((res) => {
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

    const handleVisitGroup = (item: UINotificationCommentGroup) => {
        const ids = Array.from(new Set(item.comments.map((c) => c.id)));
        if (ids.length > 0) {
            startMarking(() => {
                markNotificationsSeen(ids).catch((e) => console.error("[Notifications] markSeen(comment) error:", e));
            });
        }
        setItems((prev) => prev.filter((g) => !(g.kind === "comment" && g.id === item.id)));
        router.refresh();
    };

    const handleSystemItemConfirmed = useCallback(async (item: UINotificationSystemItem) => {
        try {
            await markSystemNotificationsSeen([item.key]);
        } catch (e) {
            console.error("[Notifications] markSeen(system) error:", e);
        }
        setItems((prev) => prev.filter((g) => !(g.kind === "system" && g.key === item.key)));
        setActiveSystemItem(null);
        router.refresh();
    }, [router]);

    const handleOpenSystemItem = (item: UINotificationSystemItem) => {
        setActiveSystemItem(item);
    };

    const modalData = useMemo(() => {
        if (!activeSystemItem) return null;
        const closeLabel = locale === "fr" ? "Vu" : "Seen";
        const openLabel = locale === "fr" ? "Réserver un entretien" : "Book a study call";
        return {
            setOpen: (value: boolean) => {
                if (!value) setActiveSystemItem(null);
            },
            title: activeSystemItem.title,
            message: (
                <div>
                    <p className="mb-0 text-neutral-700 whitespace-pre-line">{activeSystemItem.body}</p>
                    {activeSystemItem.link ? (
                        <p className="mb-0 mt-2 text-xs text-neutral-500 break-all">
                            {activeSystemItem.link}
                        </p>
                    ) : null}
                </div>
            ),
            clickOutside: true,
            oneButtonOnly: !activeSystemItem.link,
            buttonOkStr: activeSystemItem.link ? openLabel : closeLabel,
            buttonAnnulerStr: closeLabel,
            functionOk: activeSystemItem.link
                ? async () => {
                      const link = activeSystemItem.link as string;
                      window.open(link, "_blank", "noopener,noreferrer");
                      await handleSystemItemConfirmed(activeSystemItem);
                  }
                : async () => {
                      await handleSystemItemConfirmed(activeSystemItem);
                  },
            functionCancel: async () => {
                await handleSystemItemConfirmed(activeSystemItem);
            },
        };
    }, [activeSystemItem, handleSystemItemConfirmed, locale, router]);

    return (
        <>
            <div className={clsx("w-[340px] sm:w-[380px] max-h-[70vh] overflow-y-auto", "card p-4 mt-2", className)}>
                <Header isPending={isPending && items.length === 0} count={count} hasItems={items.length > 0} isClearing={isClearing} onClearAll={handleClearAll} />
                {isPending && items.length === 0 ? (
                    <SkeletonList />
                ) : items.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">
                        {items.map((item, idx) => (
                            <div
                                key={item.kind === "comment" ? `comment-${item.id}` : `system-${item.key}`}
                                style={items.length - 1 === idx ? {} : { borderBottom: "solid 2px var(--neutral-300)" }}
                                className="pb-2"
                            >
                                {item.kind === "comment" ? (
                                    <CommentGroupCard item={item} locale={locale} onVisitGroup={handleVisitGroup} />
                                ) : (
                                    <SystemCard item={item} locale={locale} onOpen={handleOpenSystemItem} disabled={isMarking} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {modalData && <ModalFromBottomWithPortal open={Boolean(activeSystemItem)} data={modalData} />}
        </>
    );
}

function Header({ isPending, count, hasItems, isClearing, onClearAll }: { isPending: boolean; count: number; hasItems: boolean; isClearing: boolean; onClearAll: () => void }) {
    const t = useTranslations("NotificationsMenu");

    return (
        <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <MdNotifications className="text-neutral-700 h-4 w-4" />
                <span>{t("title")}</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-xs text-neutral-500">{isPending ? t("refreshing") : count > 0 ? t("statusCount", { count }) : t("statusNone")}</div>

                {hasItems && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        disabled={isClearing}
                        className={clsx("btn small btn-primary inline-flex items-center gap-1 rounded-md border border-neutral-300 !px-2 !py-1 text-xs font-medium")}
                        aria-label={t("markAllSeenLabel")}
                        title={t("markAllSeenLabel")}
                    >
                        <MdDoneAll className="h-4 w-4" />
                        {isClearing ? t("markAllSeenBusy") : t("markAllSeenShort")}
                    </button>
                )}
            </div>
        </div>
    );
}

function CommentGroupCard({ item, locale, onVisitGroup }: { item: UINotificationCommentGroup; locale?: "fr" | "en"; onVisitGroup: (item: UINotificationCommentGroup) => void }) {
    const t = useTranslations("NotificationsMenu");
    const comments = item.comments.slice(0, 3);
    const moreCount = item.comments.length - comments.length;

    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            return;
        }
        onVisitGroup(item);
    };

    return (
        <Link href={item.link} onClick={handleClick} className={clsx("block rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 no-underline text-neutral-800", "transition-colors")}>
            <div className="flex flex-col w-full">
                <div className="flex w-full gap-2 items-center">
                    <div className="h-9 w-9 rounded-lg bg-neutral-200/70 flex items-center justify-center">
                        <Image
                            src={item.image ? urlFor(item.image).url() : "/images/instructeur-cours-prives.png"}
                            alt={item.title || t("imageAlt")}
                            width={36}
                            height={36}
                            className="h-9 rounded-lg object-contain"
                        />
                    </div>

                    <div className="min-w-0 flex-1 grow-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2">{item.title || t("defaultTitle")}</h3>
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
                    {moreCount > 0 && <div className="pl-3 text-xs text-neutral-500">{t("moreReplies", { count: moreCount })}</div>}
                </div>
            </div>
        </Link>
    );
}

function SystemCard({ item, locale, onOpen, disabled }: { item: UINotificationSystemItem; locale: "fr" | "en"; onOpen: (item: UINotificationSystemItem) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpen(item);
            }}
            disabled={disabled}
            className={clsx("w-full text-left block rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 no-underline text-neutral-800", "transition-colors p-3 disabled:opacity-70")}
        >
            <div className="flex items-start gap-2">
                <div className="h-9 w-9 rounded-lg bg-neutral-200/70 flex items-center justify-center shrink-0">
                    <MdInfoOutline className="h-5 w-5 text-neutral-700" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2">{item.title}</h3>
                        <span className="inline-flex items-center gap-1 shrink-0">
                            <LuClock className="w-3.5 h-3.5 text-neutral-500" />
                            <RelativeDate iso={item.createdAt} locale={locale} small={true} />
                        </span>
                    </div>
                    <p className="text-sm text-neutral-700 line-clamp-2 mb-0 mt-1">{item.body}</p>
                </div>
            </div>
        </button>
    );
}

function EmptyState() {
    const t = useTranslations("NotificationsMenu");
    return <div className="px-3 py-6 text-center text-sm text-neutral-600">{t("empty")}</div>;
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
