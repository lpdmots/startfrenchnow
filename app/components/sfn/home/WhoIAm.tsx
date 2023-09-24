import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next-intl/link";
import React from "react";
import { AiOutlineUser } from "react-icons/ai";
import { SlideFromBottom } from "../../animations/Slides";

function WhoIAm() {
    const t = useTranslations("WhoIAm");

    return (
        <div className="container-default w-container">
            <div className="inner-container _600px---tablet center">
                <div className="inner-container _500px---mbl center">
                    <div id="whoami" className="w-layout-grid grid-2-columns text-left-short">
                        <div className="inner-container _620px">
                            <div className="image-wrapper bg-secondary-4 left-shadow-circle">
                                <SlideFromBottom delay={0.6}>
                                    <Image src="/images/about-me-image-paperfolio-webflow-template.svg" alt="experience image" priority={false} height={600} width={600} className="image" />
                                </SlideFromBottom>
                            </div>
                        </div>
                        <SlideFromBottom>
                            <div className="inner-container _535px">
                                <div className="text-center---tablet">
                                    <div className="inner-container _430px">
                                        <div className="inner-container _400px---tablet center">
                                            <div className="inner-container _300px---mbl center">
                                                <div className="inner-container _250px---mbp center">
                                                    <h2 className="display-2">
                                                        Bonjour, moi c'est <span className="heading-span-secondary-2">Yohann</span>
                                                    </h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mg-bottom-32px">{t("description")}</p>
                                    <div className="inner-container _500px---tablet center">
                                        <div className="inner-container _400px---mbl center _100---mbp">
                                            <div className="mg-bottom-40px">
                                                <div className="flex-horizontal align-top---justify-left gap-16px center---tablet">
                                                    <div className="bullet bg-secondary-1"></div>
                                                    <div>
                                                        <div className="mg-bottom-12px">
                                                            <div className="text-300 bold color-neutral-800">{t("bulletPoints.nativeCertified.title")}</div>
                                                        </div>
                                                        <p className="mg-bottom-0">{t("bulletPoints.nativeCertified.content")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mg-bottom-32px">
                                                <div className="flex-horizontal align-top---justify-left gap-16px center---tablet">
                                                    <div className="bullet bg-secondary-3"></div>
                                                    <div>
                                                        <div className="mg-bottom-12px">
                                                            <div className="text-300 bold color-neutral-800">{t("bulletPoints.experience.title")}</div>
                                                        </div>
                                                        <p className="mg-bottom-0">{t("bulletPoints.experience.content")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mg-bottom-40px">
                                                <div className="flex-horizontal align-top---justify-left gap-16px center---tablet">
                                                    <div className="bullet bg-secondary-4"></div>
                                                    <div>
                                                        <div className="mg-bottom-12px">
                                                            <div className="text-300 bold color-neutral-800">{t("bulletPoints.expertBeginners.title")}</div>
                                                        </div>
                                                        <p className="mg-bottom-0">{t("bulletPoints.expertBeginners.content")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="buttons-row center-tablet">
                                                <Link href="about" className="btn-primary w-button">
                                                    <div className="flex items-center justify-center">
                                                        <AiOutlineUser className="mr-2" />
                                                        {t("moreAboutMe")}
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SlideFromBottom>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WhoIAm;
