import React from "react";
import { HeroData } from "./dashboardUtils";
import urlFor from "@/app/lib/urlFor";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import Link from "next-intl/link";
import { formatRelative, formatToBadge } from "./VideoCard";
import Image from "next/image";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";

interface Props {
    hero: HeroData | undefined;
    locale: "fr" | "en";
    hasPack: boolean;
}

/* 
last?: {
        examId: string;
        title: string;
        level: ExamLevel;
        image?: Image;
        competence: ExamCompetence;
        score?: number;
    };
*/

export const ExamCard = ({ hero, locale, hasPack }: Props) => {
    const t = useTranslations("Fide.dashboard.DashboardHero.ExamCard");

    const { last, stats } = hero?.exams || {};
    const isKind = hero?.kind === "exams";
    const lastActivity = stats?.lastActivityAt ? formatRelative(stats.lastActivityAt, locale) : null;
    const todoCountForLastLevel = stats?.todoCountForLastLevel ?? 0;
    const allexamsForLastLevel = stats?.allexamsForLastLevel ?? 0;
    const examsDone = allexamsForLastLevel - todoCountForLastLevel;

    return (
        <Link
            href={!hasPack ? "/fide/pack-fide#plans" : last ? `/fide/exams?level=${last?.levels[0]}` : `/fide/exams`}
            className="group relative no-underline w-full h-full text-neutral-800 flex flex-col gap-4 px-2 py-4"
        >
            {isKind && (
                <div className="new-banner py-1 bg-secondary-5" style={{ border: "solid 1px black", boxShadow: "3px 3px 0px 0px var(--neutral-800)" }}>
                    {t("resume")}
                </div>
            )}

            <div className="flex gap-2">
                <div className="h-full flex items-center justify-end">
                    <Image width={65} height={65} src={hasPack ? "/images/pack-fide-icon.png" : "/images/cadenas-ferme.png"} alt={last?.title || ""} className="object-contain" />
                </div>
                <div className="flex flex-col w-full">
                    <p className="mb-0 text-3xl font-bold underline decoration-secondary-5">{t("heading")}</p>
                    <p className="text-lg font-bold mb-0">{last?.title || t("fallbackTitle")}</p>
                </div>
            </div>

            <div className="grow w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex gap-2">{[t("badgeUnderstand"), ...(last?.levels ? last.levels : [])].map((lvl) => formatToBadge(lvl, "bg-secondary-5"))}</div>
                    <p className="mb-0 text-sm italic text-neutral-600">
                        {stats?.avgByLevel[(last?.levels[0] || "A1") as "A1" | "A2" | "B1"] ? <RenderStars stars={stats?.avgByLevel[(last?.levels[0] || "A1") as "A1" | "A2" | "B1"]} /> : ""}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden w-full rounded-xl flex justify-center bg-neutral-300">
                <Image
                    width={400}
                    height={300}
                    src={last?.image ? urlFor(last?.image).url() : "/images/fake-exam.png"}
                    alt={last?.title || ""}
                    className="w-auto h-full mx-auto rounded-lg object-cover object-top"
                    style={{ height: 203 }}
                />
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm text-neutral-600 mb-0">
                    <span className="font-bold">
                        {examsDone}/{allexamsForLastLevel}
                    </span>{" "}
                    {last?.levels[0]}
                </p>
                {lastActivity && <p className="text-sm text-neutral-600 mb-0">{t("lastActivity", { time: lastActivity })}</p>}
            </div>

            {!hasPack && (
                <div className="absolute inset-0 z-10 h-full w-full pointer-events-none [@media(hover:none)]:hidden">
                    <div className="absolute inset-0 bg-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Image src="/images/cadenas-ouvert.png" alt={t("lockedOverlayHeadline")} width={64} height={64} className="h-16 w-16 mb-4" />
                        <p className="text-base md:text-xl font-medium">{t.rich("lockedOverlayHeadlineRich", intelRich())}</p>
                        <button className="mt-4 btn btn-primary small pointer-events-auto transform transition-transform duration-200 hover:-translate-y-0.5">{t("ctaBuyPack")}</button>
                    </div>
                </div>
            )}
        </Link>
    );
};

export const RenderStars = ({ stars, areBig = false }: { stars: number | null; areBig?: boolean }) => {
    if (stars === undefined || stars === null) {
        return (
            <>
                <FaRegStar className={`${areBig ? "text-2xl" : "text-xl "} fill-neutral-400`} />
                <FaRegStar className={`${areBig ? "text-2xl" : "text-xl "} fill-neutral-400`} />
                <FaRegStar className={`${areBig ? "text-2xl" : "text-xl "} fill-neutral-400`} />
            </>
        );
    } else {
        return renderStars(stars, areBig, 3);
    }
};

const renderStars = (rating: number, areBig: boolean = false, maxStars: number = 5) => {
    let stars = [];
    for (let i = 1; i <= maxStars; i++) {
        if (i <= rating) {
            // Étoile pleine
            stars.push(<FaStar key={i.toString()} className={`${areBig ? "text-2xl" : "text-xl "} fill-secondary-1`} />);
        } else if (i - 0.5 <= rating) {
            // Étoile à moitié pleine
            stars.push(<FaStarHalfAlt key={i.toString()} className={`${areBig ? "text-2xl" : "text-xl"} fill-secondary-1`} />);
        } else {
            // Étoile vide
            stars.push(<FaRegStar key={i.toString()} className={`${areBig ? "text-2xl" : "text-xl"} fill-secondary-1`} />);
        }
    }
    return stars;
};
