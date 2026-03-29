import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import type { SystemNotificationMessage } from "@/app/lib/authMailMessages";

export async function appendSystemNotification(userId: string, notification: SystemNotificationMessage): Promise<void> {
    if (!userId || !notification?.title || !notification?.body) return;

    const nowIso = new Date().toISOString();
    await client
        .patch(userId)
        .setIfMissing({ notifications: [] })
        .append("notifications", [
            {
                kind: "system",
                title: notification.title,
                body: notification.body,
                ...(notification.link ? { link: notification.link } : {}),
                createdAt: nowIso,
            },
        ])
        .commit({ autoGenerateArrayKeys: true });
}
