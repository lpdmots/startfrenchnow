"use client";

import { Link } from "@/i18n/navigation";
import { MdOndemandVideo } from "react-icons/md";
import { RiFolderDownloadLine } from "react-icons/ri";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { BsInfinity } from "react-icons/bs";
import { SlideFromRight } from "@/app/components/animations/Slides";
import { CoursesAccordionClient } from "./CoursesAccordionClient";
import { Locale } from "@/i18n";
import { useTranslations } from "next-intl";
import { UdemyBeginnerAccordion } from "../dashboard/components/UdemyBeginnerAccordion";
import { PiGraduationCap } from "react-icons/pi";
import { useSession } from "next-auth/react";
import type { FidePackSommaire } from "@/app/serverActions/productActions";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

export function VideosSectionClient({
    fidePackSommaire,
    hasPack,
    locale,
    userId,
}: {
    fidePackSommaire: FidePackSommaire;
    hasPack?: boolean;
    locale: Locale;
    userId?: string;
}) {
    const { data: session } = useSession();
    const sessionHasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");
    const effectiveHasPack = hasPack ?? sessionHasPack;
    const effectiveUserId = userId ?? (session?.user?._id as string | undefined);
    const t = useTranslations("Fide.VideosSection");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
    };

    return (
        <section id="videosSection" className="max-w-7xl m-auto py-24 px-4 lg:px-8">
            <div className="mx-auto w-full flex flex-col items-center">
                <header className="mb-6 text-center max-w-5xl">
                    <h2 className="display-2">{t.rich("title", rich)}</h2>
                    <p className="">{t("subtitle")}</p>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-6">
                    <div className="col-span-2 flex flex-col gap-4">
                        <p className="mb-0 text-lg font-semibold sm:mx-4 text-neutral-800">{t("areYouBeginner")}</p>
                        <UdemyBeginnerAccordion locale={locale} userId={effectiveUserId} hasPack={effectiveHasPack} />
                        <CoursesAccordionClient fidePackSommaire={fidePackSommaire} hasPack={effectiveHasPack} expandAll={false} defaultModuleKeyIndex={2} />
                    </div>
                    <div className="col-span-2 xl:col-span-1 px-0 sm:px-4 lg:px-0">
                        <div id="w-node-_5477c579-dd4f-3f5a-c700-1cd0a30d540b-7a543d63" className="lg:sticky lg:top-11 col-span-2 lg:col-span-1 order-1 lg:order-2 overflow-hidden">
                            <SlideFromRight>
                                <InfosVideos hasPack={effectiveHasPack} />
                            </SlideFromRight>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const InfosVideos = ({ hasPack }: { hasPack: boolean }) => {
    const t = useTranslations("Fide.InfosVideos");

    return (
        <div data-w-id="58b3cf56-b90f-933e-2320-8780e9f6f100" className="card project-card p-4 sm:p-8">
            <h3 className="mg-bottom-32px underline">{t("title")}</h3>

            <p className="mb-3 flex items-center">
                <PiGraduationCap className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t("formationComplete")}</span>
            </p>
            <p className="mb-3 flex items-center">
                <MdOndemandVideo className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t("video")}</span>
            </p>
            <p className="mb-3 flex items-center">
                <RiFolderDownloadLine className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t("downloads")}</span>
            </p>
            <p className="mb-3 flex items-center">
                <HiOutlineDevicePhoneMobile className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t("access")}</span>
            </p>
            <p className="mb-4 flex items-center">
                <BsInfinity className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t("lifetime")}</span>
            </p>
            {hasPack ? (
                <Link href="/fide/dashboard" className="btn-primary full-width project-btn w-inline-block">
                    <span className="line-rounded-icon link-icon-right">{t("buttonHasPack")}</span>
                </Link>
            ) : (
                <Link href="#plans" className="btn-primary full-width project-btn w-inline-block">
                    <span className="line-rounded-icon link-icon-right">{t("buttonNoPack")}</span>
                </Link>
            )}
        </div>
    );
};
