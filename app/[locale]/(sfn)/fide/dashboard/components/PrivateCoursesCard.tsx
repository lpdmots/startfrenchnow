import { HeroData } from "./dashboardUtils";
import Image from "next/image";
import Link from "next-intl/link";
import { formatRelative, formatToBadge } from "./VideoCard";
import { toHours } from "@/app/lib/utils";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

const PrivateCoursesCard = ({ hero, locale }: { hero: HeroData | undefined; locale: "fr" | "en" }) => {
    const t = useTranslations("Fide.dashboard.DashboardHero.PrivateCoursesCard");

    const isKind = ["coaching", "coaching-urgent"].includes(hero?.kind || "");
    const coaching = hero?.coaching;
    const nextEventDate = coaching?.nextEvent?.date ? new Date(coaching.nextEvent.date) : null;
    const completedMinutes = coaching?.completedMinutes ?? 0;
    const totalPurchasedMinutes = coaching?.totalPurchasedMinutes ?? 0;
    const lastPastEventDate = coaching?.lastPastEventDate ? coaching.lastPastEventDate : null;
    const lastActivity = lastPastEventDate ? formatRelative(lastPastEventDate) : "-";
    const hasNotPurchased = totalPurchasedMinutes === 0;

    return (
        <Link href={hasNotPurchased ? "/fide#priceSliderFide" : "#private-courses"} className="group relative no-underline w-full h-full text-neutral-800 flex flex-col gap-4 px-2 py-4">
            {isKind && (
                <div className="new-banner py-1 bg-secondary-5" style={{ border: "solid 1px black", boxShadow: "3px 3px 0px 0px var(--neutral-800)" }}>
                    {hero?.kind === "coaching-urgent" ? t("urgent") : t("book")}
                </div>
            )}
            <div className="flex gap-2">
                <div className="h-full flex items-center justify-end">
                    <Image width={65} height={65} src="/images/pack-fide-cours-prives.png" alt={t("altPrivate")} className="object-contain" />
                </div>
                <div className="flex flex-col w-full">
                    <p className="mb-0 text-3xl font-bold underline decoration-secondary-2">{t("heading")}</p>
                    <p className="text-lg font-bold mb-0">{t("manageHours")}</p>
                </div>
            </div>

            <div className="grow w-full">
                <div className="flex items-center gap-2 w-full">
                    <p className="mb-0 text-sm text-neutral-600">{t("nextLesson")}</p>
                    {formatToBadge(nextEventDate ? nextEventDate.toLocaleDateString(locale) : t("noBooking"), "bg-secondary-2")}
                </div>
            </div>

            <div className="overflow-hidden w-full rounded-xl flex justify-center bg-neutral-300">
                <Image
                    src={isKind ? "/images/pack-fide-cours-urgent.png" : "/images/instructeur-cours-prives.png"}
                    width={300}
                    height={200}
                    alt={t("altThumb")}
                    className="object-cover w-full h-full"
                    style={{ height: 203 }}
                />
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm text-neutral-600 mb-0">
                    <span className="font-bold">
                        {toHours(completedMinutes)}/{toHours(totalPurchasedMinutes)}
                    </span>{" "}
                    {totalPurchasedMinutes > 60 ? t("hours") : t("hour")}
                </p>
                {lastActivity && <p className="text-sm text-neutral-600 mb-0">{t("lastActivity", { time: lastActivity })}</p>}
            </div>

            {hasNotPurchased && (
                <div className="absolute inset-0 z-10 h-full w-full pointer-events-none [@media(hover:none)]:hidden">
                    <div className="absolute inset-0 bg-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Image src="/images/cadenas-ouvert.png" alt={t("lockedOverlayHeadline")} width={64} height={64} className="h-16 w-16 mb-4" />
                        <p className="text-base md:text-xl font-medium">{t.rich("lockedOverlayHeadlineRich", intelRich())}</p>
                        <button className="mt-4 btn btn-primary small pointer-events-auto transform transition-transform duration-200 hover:-translate-y-0.5">{t("ctaBuyPrivate")}</button>
                    </div>
                </div>
            )}
        </Link>
    );
};

export default PrivateCoursesCard;
