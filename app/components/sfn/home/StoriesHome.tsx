import Image from "next/image";
import React from "react";
import Link from "next-intl/link";
import { GiSpellBook } from "react-icons/gi";
import { SlideFromBottom, SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

export const StoriesHome = () => {
    const t = useTranslations("StoriesHome");
    return (
        <div className="section bg-neutral-800 wf-section">
            <div className="container-default w-container">
                <div className="inner-container center">
                    <div className="inner-container _500px---mbl center">
                        <div className="w-layout-grid grid-2-columns story-grid-v2">
                            <div id="w-node-_686f4507-61d8-cbed-f166-5192bfa063e2-c2543d52" data-w-id="686f4507-61d8-cbed-f166-5192bfa063e2" className="inner-container _584px _100---tablet">
                                <SlideFromBottom>
                                    <div className="inner-container _300px---mbp">
                                        <h2 className="display-2 color-neutral-100">{t.rich("title", intelRich())}</h2>
                                    </div>
                                </SlideFromBottom>
                                <SlideFromBottom>
                                    <p className="color-neutral-300 mg-bottom-24px">{t.rich("description", intelRich())}</p>
                                </SlideFromBottom>
                                <SlideInOneByOneParent>
                                    <div className="mg-bottom-40px">
                                        <SlideInOneByOneChild>
                                            <div className="mg-bottom-12px">
                                                <div className="flex-horizontal align-top---justify-left gap-16px">
                                                    <div className="bullet bg-secondary-3 white mg-top-5px"></div>
                                                    <p className="color-neutral-100 mg-bottom-0">{t.rich("bullet1", intelRich())}</p>
                                                </div>
                                            </div>
                                        </SlideInOneByOneChild>
                                        <SlideInOneByOneChild>
                                            <div className="mg-bottom-12px">
                                                <div className="flex-horizontal align-top---justify-left gap-16px">
                                                    <div className="bullet bg-secondary-2 white mg-top-5px"></div>
                                                    <p className="color-neutral-100 mg-bottom-0">{t.rich("bullet2", intelRich())}</p>
                                                </div>
                                            </div>
                                        </SlideInOneByOneChild>
                                        <SlideInOneByOneChild>
                                            <div>
                                                <div className="flex-horizontal align-top---justify-left gap-16px">
                                                    <div className="bullet bg-secondary-1 white mg-top-5px"></div>
                                                    <p className="color-neutral-100 mg-bottom-0">{t.rich("bullet3", intelRich())}</p>
                                                </div>
                                            </div>
                                        </SlideInOneByOneChild>
                                    </div>
                                </SlideInOneByOneParent>
                                <div className="flex justify-center">
                                    <Link href="/stories" className="btn-secondary variant w-button">
                                        <div className="flex items-center justify-center">
                                            <GiSpellBook className="mr-2" style={{ fontSize: 30 }} />
                                            {t("button")}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            <SlideFromBottom>
                                <div id="w-node-_686f4507-61d8-cbed-f166-5192bfa063e0-c2543d52" className="inner-container story-grid-v2---image card" style={{ overflow: "hidden" }}>
                                    <Image src="/images/story-home-2.png" alt="experience desiginig image" height={600} width={600} loading="eager" style={{ width: "100%", height: "auto" }} />
                                </div>
                            </SlideFromBottom>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
