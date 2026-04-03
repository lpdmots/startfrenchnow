import { Link } from "@/i18n/navigation";
import { MdOndemandVideo } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiFolderDownloadLine } from "react-icons/ri";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { BsConeStriped, BsInfinity, BsTrophy } from "react-icons/bs";
import { SlideFromBottom, SlideFromLeft, SlideFromRight, SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import { FidePackSommaire, getFidePackSommaire } from "@/app/serverActions/productActions";
import { CoursesAccordionClient } from "./CoursesAccordionClient";
import { Locale } from "@/i18n";
import { useTranslations } from "next-intl";
import { UdemyBeginnerAccordion } from "../dashboard/components/UdemyBeginnerAccordion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { intelRich } from "@/app/lib/intelRich";
import { PiGraduationCap } from "react-icons/pi";

export async function VideosSection({ locale, hasPack = false }: { locale: Locale; hasPack?: boolean }) {
    const fidePackSommaire = await getFidePackSommaire(locale);
    const session = await getServerSession(authOptions);
    return <VideosSectionNoAsync fidePackSommaire={fidePackSommaire} hasPack={hasPack} locale={locale} userId={session?.user?._id} />;
}

function VideosSectionNoAsync({ fidePackSommaire, hasPack = false, locale, userId }: { fidePackSommaire: FidePackSommaire; hasPack?: boolean; locale: Locale; userId?: string }) {
    const t = useTranslations("Fide.VideosSection");

    return (
        <section id="videosSection" className="max-w-7xl m-auto py-24 px-4 lg:px-8">
            <div className="mx-auto w-full flex flex-col items-center">
                {/* Header */}
                <header className="mb-6 text-center max-w-5xl">
                    <h2 className="display-2">
                        {t("titlePart1")} <span className="heading-span-secondary-4">{t("titleHighlight1")}</span> {t("titlePart2")}{" "}
                        <span className="heading-span-secondary-4">{t("titleHighlight2")}</span> {t("titlePart3")}
                    </h2>
                    <p className="">{t("subtitle")}</p>
                </header>

                {/* Curriculum */}
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-6">
                    <div className="col-span-2 flex flex-col gap-4">
                        <p className="mb-0 text-lg font-semibold sm:mx-4 text-neutral-800">{t("areYouBeginner")}</p>
                        <UdemyBeginnerAccordion locale={locale} userId={userId} hasPack={hasPack} />
                        <CoursesAccordionClient fidePackSommaire={fidePackSommaire} hasPack={hasPack} expandAll={false} defaultModuleKeyIndex={2} />
                    </div>
                    <div className="col-span-2 xl:col-span-1 px-0 sm:px-4 lg:px-0">
                        <div id="w-node-_5477c579-dd4f-3f5a-c700-1cd0a30d540b-7a543d63" className="lg:sticky lg:top-11 col-span-2 lg:col-span-1 order-1 lg:order-2 overflow-hidden">
                            <SlideFromRight>
                                <InfosVideos hasPack={hasPack} />
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
                <>
                    <Link href="#plans" className="btn-primary full-width project-btn w-inline-block">
                        <span className="line-rounded-icon link-icon-right">{t("buttonNoPack")}</span>
                    </Link>
                </>
            )}
        </div>
    );
};
