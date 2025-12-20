// app/components/notifications/NotificationsMenuServer.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dynamic from "next/dynamic";
import { MdNotifications } from "react-icons/md"; // ajuste si besoin
import NotificationsMenuClient from "./NotificationsMenuClient"; // ton content client existant
import DropdownMenu from "../common/DropdownMenu";
import { Locale } from "@/i18n";

// Chargement lazy du client component qui fait l'animation avec framer-motion
const NotificationBellClient = dynamic(() => import("./NotificationBellClient"), {
    ssr: false,
    loading: () => <MdNotifications className="text-2xl sm:text-3xl text-neutral-800" />,
});

export default async function NotificationsMenuServer({ locale }: { locale?: Locale }) {
    const session = await getServerSession(authOptions);
    const count = Number((session as any)?.user?.notificationsLength ?? 0);

    if (!count) return null;

    return (
        <DropdownMenu content={<NotificationsMenuClient locale={locale} count={count} />}>
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
