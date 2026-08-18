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
        <DropdownMenu content={<NotificationsMenuClient locale={locale} count={count} onCountChange={handleCountChange} />} ariaLabel={`Notifications (${count})`}>
            <span className="relative inline-flex size-11 items-center justify-center rounded-xl hover:bg-neutral-200">
                <NotificationBellClient count={count} />
            </span>
        </DropdownMenu>
    );
}
