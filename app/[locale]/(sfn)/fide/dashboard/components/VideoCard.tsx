import { HeroData } from "./dashboardUtils";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import Link from "next-intl/link";
import clsx from "clsx";
import { useTranslations } from "next-intl";

// helpers locaux
export function formatToBadge(level?: string, classname?: string) {
    if (!level) return null;
    const upper = level.toUpperCase();
    return <span className={clsx("flex justify-center items-center rounded-lg border border-solid border-neutral-600 px-3 py-1 text-xs text-neutral-100", classname)}>{upper}</span>;
}

export function formatRelative(iso?: string, locale?: "en" | "fr") {
    if (!iso) return "—";
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const abs = Math.abs(diffMs);
    const minutes = Math.round(abs / (60 * 1000));
    const hours = Math.round(abs / (60 * 60 * 1000));
    const days = Math.round(abs / (24 * 60 * 60 * 1000));
    if (minutes < 60) return locale === "fr" ? `il y a ${minutes} min` : `${minutes} minutes ago`;
    if (hours < 24) return locale === "fr" ? `il y a ${hours} h` : `${hours} hours ago`;
    return locale === "fr" ? `il y a ${days} j` : `${days} days ago`;
}

type Props = {
    hero: HeroData | undefined;
    locale: "fr" | "en";
    hasPack: boolean;
};

export const VideoCard = ({ hero, locale, hasPack }: Props) => {
    const t = useTranslations("Fide.dashboard.DashboardHero.VideoCard");

    const { main, stats } = hero?.video || {};
    const title = main?.title || t("emptyTitle");
    const mainImage = (main?.mainImage || main?.mainVideo?.url) as any;
    const levels = (main?.levels as string[] | undefined) || []; // ex. ["a1","a2"]

    const statusKey = (main?.status as "watched" | "unwatched" | "in-progress" | undefined) || "unwatched";
    const statusLabel = statusKey ? t(`status.${statusKey}`) : undefined;

    const percentTime = main?.percentTime ?? 0;
    const watched = stats?.watched ?? 0;
    const total = stats?.total ?? 0;
    const lastActivity = stats?.lastActivityAt ? formatRelative(stats.lastActivityAt, locale) : null;
    const isKind = hero?.kind === "video";

    const badges = [
        ...(statusLabel ? [statusLabel] : []),
        ...levels, // A1/A2 restent tels quels
    ];

    const href = !hasPack ? "/fide/pack-fide#plans" : `/fide/videos/${main?.slug}`;

    return (
        <Link href={href} className="group relative no-underline w-full h-full text-neutral-800 flex flex-col gap-4 px-2 py-4">
            {isKind && (
                <div className="new-banner py-1 bg-secondary-6" style={{ border: "solid 1px black", boxShadow: "3px 3px 0px 0px var(--neutral-800)" }}>
                    {t("resume")}
                </div>
            )}

            <div className="flex gap-2">
                <div className="h-full flex items-center justify-end">
                    <Image width={65} height={65} src={hasPack ? "/images/pack-fide-video.png" : "/images/cadenas-ferme.png"} alt={title} className="object-contain" />
                </div>
                <div className="flex flex-col w-full">
                    <p className="mb-0 text-3xl font-bold underline decoration-secondary-6">{t("heading")}</p>
                    <p className="text-lg font-bold mb-0">{title}</p>
                </div>
            </div>

            <div className="grow w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex gap-2">{badges.map((lbl) => formatToBadge(lbl, "bg-secondary-6"))}</div>
                    <p className="mb-0 text-sm font-bold text-neutral-600">{t("percentWatched", { percent: percentTime })}</p>
                </div>
            </div>

            <div className="overflow-hidden w-full rounded-xl flex justify-center bg-neutral-200">
                <Image src={urlFor(mainImage)?.url() || "/images/placeholder.png"} width={300} height={200} alt={t("altVideoThumb")} className="object-cover w-full h-full" />
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm text-neutral-600 mb-0">
                    <span className="font-bold">
                        {watched}/{total}
                    </span>{" "}
                    {t("views")}
                </p>
                {lastActivity && <p className="text-sm text-neutral-600 mb-0">{t("lastActivity", { time: lastActivity })}</p>}
            </div>

            {!hasPack && (
                <div className="absolute inset-0 z-10 h-full w-full pointer-events-none [@media(hover:none)]:hidden">
                    <div className="absolute inset-0 bg-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Image src="/images/cadenas-ouvert.png" alt={t("lockedOverlayHeadline")} width={64} height={64} className="h-16 w-16 mb-4" />
                        <p className="text-base md:text-xl font-medium">
                            {t.rich("lockedOverlayHeadlineRich", {
                                strong: (chunks) => <strong>{chunks}</strong>,
                            })}
                        </p>
                        <button className="mt-4 btn btn-primary small pointer-events-auto transform transition-transform duration-200 hover:-translate-y-0.5">{t("ctaBuyPack")}</button>
                    </div>
                </div>
            )}
        </Link>
    );
};
