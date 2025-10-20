import clsx from "clsx";
import Link from "next-intl/link";
import { MdOndemandVideo } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiFolderDownloadLine } from "react-icons/ri";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { BsInfinity, BsTrophy } from "react-icons/bs";
import { SlideFromBottom, SlideFromLeft, SlideFromRight, SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import { getFidePackSommaire } from "@/app/serverActions/productActions";
import { CoursesAccordionClient } from "./CoursesAccordionClient";
import { Locale } from "@/i18n";

export async function VideosSection({ locale, hasPack = false }: { locale: Locale; hasPack?: boolean }) {
    const fidePackSommaire = await getFidePackSommaire(locale);

    return (
        <section id="videosSection" className="max-w-7xl m-auto py-24 px-4 lg:px-8">
            <div className="mx-auto w-full flex flex-col items-center">
                {/* Header */}
                <header className="mb-6 text-center max-w-5xl">
                    <h2 className="display-2">
                        Un <span className="heading-span-secondary-4">programme</span> vidéo <span className="heading-span-secondary-4">complet</span> pour réussir le FIDE
                    </h2>
                    <p className="">60+ leçons claires, classées par niveaux A1 à B1, avec objectifs concrets et exemples réels.</p>
                </header>

                {/* <YouLearnVideos /> */}

                {/* Curriculum */}
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-6">
                    <div className="col-span-2 flex flex-col gap-4">
                        <CoursesAccordionClient fidePackSommaire={fidePackSommaire} hasPack={hasPack} expandAll={true} />
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
    return (
        <div data-w-id="58b3cf56-b90f-933e-2320-8780e9f6f100" className="card project-card p-4 sm:p-8">
            <h3 className="mg-bottom-32px underline">Vous obtenez :</h3>
            <p>
                <MdOndemandVideo className="text-2xl mr-2 sm:mr-4" />
                <span>Vidéo à la demande de 60 heures</span>
            </p>
            <p>
                <IoDocumentTextOutline className="text-2xl mr-2 sm:mr-4" />
                <span>30 Articles</span>
            </p>
            <p>
                <RiFolderDownloadLine className="text-2xl mr-2 sm:mr-4" />
                <span>Ressources téléchargeables</span>
            </p>
            <p>
                <HiOutlineDevicePhoneMobile className="text-2xl mr-2 sm:mr-4" />
                <span>Accès sur mobiles et TV</span>
            </p>
            <p>
                <BsInfinity className="text-2xl mr-2 sm:mr-4" />
                <span>Accès à vie, mises à jour incluses</span>
            </p>
            <p>
                <BsTrophy className="text-2xl mr-2 sm:mr-4" />
                <span>Validations des compétences</span>
            </p>
            {hasPack ? (
                <Link href="/fide/dashboard" className="btn-primary full-width project-btn w-inline-block">
                    <span className="line-rounded-icon link-icon-right">Reprendre les cours</span>
                </Link>
            ) : (
                <>
                    <Link href="#plans" className="btn-primary full-width project-btn w-inline-block">
                        <span className="line-rounded-icon link-icon-right">Obtenir le Pack FIDE</span>
                    </Link>
                    <p className="bs pt-2 text-neutral-600">*Satisfait ou remboursé si moins de 20% du contenu est consommé. Voir conditions.</p>
                </>
            )}
        </div>
    );
};
