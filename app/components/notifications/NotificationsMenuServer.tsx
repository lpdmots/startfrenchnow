// app/components/notifications/NotificationsMenuServer.tsx
"use client";

import { useCallback, useState } from "react";
import NotificationsMenuClient from "./NotificationsMenuClient";
import NotificationBellClient from "./NotificationBellClient";
import DropdownMenu from "../common/DropdownMenu";
import { Locale } from "@/i18n";
import { useSession } from "next-auth/react";

export default function NotificationsMenuServer({ locale }: { locale?: Locale }) {
    const { data: session, status } = useSession();
    const sessionCount = Number((session as any)?.user?.notificationsLength ?? 0);
    const [liveCount, setLiveCount] = useState<number | null>(null);
    const handleCountChange = useCallback((nextCount: number) => {
        setLiveCount(nextCount);
    }, []);

    if (status === "loading") return null;

    const count = liveCount ?? sessionCount;
    if (!count) return null;

    return (
        <DropdownMenu content={<NotificationsMenuClient locale={locale} count={count} onCountChange={handleCountChange} />}>
            <button
                type="button"
                className="relative inline-flex items-center justify-center rounded-xl p-2 pb-0 hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                aria-label={`Notifications (${count})`}
            >
                <NotificationBellClient count={count} />
            </button>
        </DropdownMenu>
    );
}
