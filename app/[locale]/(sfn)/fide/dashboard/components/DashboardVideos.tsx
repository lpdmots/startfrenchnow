import React from "react";
import { HeroData, HeroVideoData } from "./dashboardUtils";
import { SlideFromBottom, SlideFromRight } from "@/app/components/animations/Slides";
import Image from "next/image";
import Link from "next-intl/link";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { CoursesAccordionClient } from "../../pack-fide/components/CoursesAccordionClient";
import { FidePackSommaire } from "@/app/serverActions/productActions";
import urlFor from "@/app/lib/urlFor";
import { formatRelative, formatToBadge } from "./VideoCard";
import { ProgressSlider } from "./ProgressSlider";
import { HiPlay } from "react-icons/hi";
import { LinkArrowToFideVideos } from "@/app/components/common/LinkToFideVideos";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { Locale } from "@/i18n";

interface DashboardVideosProps {
    hero: HeroData;
    locale: "fr" | "en";
    hasPack: boolean;
    fidePackSommaire: FidePackSommaire;
}

const DashboardVideos = ({ hero, locale, hasPack, fidePackSommaire }: DashboardVideosProps) => {
    const t = useTranslations("Fide.dashboard.DashboardVideos");
    const videos = hero.video;
    const pourcentageCompleted = Math.round(((videos?.stats?.watched || 0) / (videos?.stats?.total || 1)) * 100);
    const lastActivity = formatRelative(videos?.stats?.lastActivityAt, locale);

    return (
        <section className="page-wrapper flex flex-col max-w-7xl m-auto gap-6 lg:gap-12 w-full py-0">
            <h2 className="mb-0 w-full display-2">{t.rich("title", intelRich())}</h2>

            <h4 className="underline decoration-secondary-6  text-xl md:text-3xl">{t("selectedForYou")}</h4>

            <SlideFromBottom>
                <div className="grid grid-cols-4 gap-4 w-full">
                    {videos?.mini.map((video, idx) => (
                        <MiniVideoCard key={video.postId} video={video} hasPack={hasPack} locale={locale} />
                    ))}
                </div>
            </SlideFromBottom>

            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-6 w-full">
                <div className="col-span-2 flex flex-col gap-4 order-2 lg:order-1">
                    <h4 className="underline decoration-secondary-6 text-xl md:text-3xl">{t("summary")}</h4>
                    <CoursesAccordionClient fidePackSommaire={fidePackSommaire} hasPack={hasPack} expandAll={true} />
                </div>

                <div className="col-span-2 xl:col-span-1 px-0 sm:px-4 lg:px-0 order-1 lg:order-2">
                    <div id="w-node-_5477c579-dd4f-3f5a-c700-1cd0a30d540b-7a543d63" className="lg:sticky lg:top-11 col-span-2 lg:col-span-1 overflow-hidden">
                        <SlideFromRight>
                            <div className="flex flex-col items-center gap-2 lg:gap-8 lg:mt-8">
                                <Image
                                    src="/images/videos-section-dashboard.png"
                                    alt={t("altVideo")}
                                    width={400}
                                    height={400}
                                    className="px-8 object-contain w-full overflow-hidden max-w-52 md:max-w-80 xl:max-w-none h-auto"
                                />
                                {hasPack ? (
                                    <div className="w-full">
                                        <p className="font-bold w-full text-center underline decoration-secondary-6">{t("globalProgress")}</p>
                                        <div className="mt-16 lg:mt-20 mb-4 w-full max-w-xl mx-auto px-4">
                                            <ProgressSlider defaultValue={[0]} max={100} min={0} step={1} value={[pourcentageCompleted]} displayValue={true} color={`secondary-6`} />
                                        </div>
                                        <p className="mb-0 mt-6 lg:mt-12 text-center w-full ">{t.rich("lastActivityRich", { ...intelRich(), time: lastActivity || "-" })}</p>
                                    </div>
                                ) : (
                                    <Link href="/fide/pack-fide#plans" className="w-full no-underline mt-2 lg:mt-8 flex justify-center">
                                        <ShimmerButton className="w-full max-w-lg">{t("ctaBuyPack")}</ShimmerButton>
                                    </Link>
                                )}
                            </div>
                        </SlideFromRight>
                    </div>
                </div>
            </div>

            <div className="flex w-full justify-center">
                <LinkArrowToFideVideos className="text-lg md:text-xl font-bold text-neutral-700" category="grammar" target="_blank">
                    <span className="flex items-center">
                        <HiPlay className="text-4xl md:text-6xl mr-2 text-secondary-4" /> <span>{t("allVideos")}</span>
                    </span>
                </LinkArrowToFideVideos>
            </div>
        </section>
    );
};

export default DashboardVideos;

const BGDLOCALE = {
    Commencer: { en: "Start", fr: "Commencer" },
    Continuer: { en: "Continue", fr: "Continuer" },
    Revoir: { en: "Review", fr: "Revoir" },
};

const MiniVideoCard = ({ video, hasPack, locale }: { video: HeroVideoData["mini"][number]; hasPack?: boolean; locale: Locale }) => {
    const t = useTranslations("Fide.dashboard.DashboardVideos");
    const isLocked = !hasPack && !video.isPreview;

    return (
        <div className="group relative col-span-4 md:col-span-2 xl:col-span-1 p-2 border-2 border-solid border-neutral-600 rounded-lg h-full translate_on_hover overflow-hidden">
            <Link href={isLocked ? "/fide/pack-fide#plans" : `/fide/videos/${video.slug}`} className="no-underline w-full h-full text-neutral-800 flex gap-4 items-center">
                <div className="shrink-0">
                    <img width={400} height={300} src={urlFor(video.mainImage).url()} alt={video.title} className="mx-auto w-20 h-20 md:mx-0 rounded-lg object-cover object-top" />
                </div>
                <div className="grow h-full flex flex-col justify-between gap-2">
                    <h4 className="text-lg font-medium text-neutral-800 text-left line-clamp-3 mb-0">
                        {isLocked ? "🔒" : ""}
                        {video.title}
                    </h4>
                    <div className="flex gap-2 w-full justify-end">
                        {[video.badge].map((bdg, idx) => {
                            const bdgLocale = BGDLOCALE[bdg as keyof typeof BGDLOCALE]?.[locale] || bdg;
                            return <React.Fragment key={idx}>{formatToBadge(bdgLocale, "bg-secondary-6")}</React.Fragment>;
                        })}
                    </div>
                </div>

                {isLocked && (
                    <div className="absolute inset-0 z-10 h-full w-full pointer-events-none [@media(hover:none)]:hidden">
                        <div className="absolute inset-0 bg-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <Image src="/images/cadenas-ouvert.png" alt={t("lockedOverlayHeadline")} width={64} height={64} className="h-10 w-10 mb-2" />
                            <p className="text-sm font-medium mb-0">{t.rich("ctaBuyPackStrong", intelRich())}</p>
                        </div>
                    </div>
                )}
            </Link>
        </div>
    );
};
