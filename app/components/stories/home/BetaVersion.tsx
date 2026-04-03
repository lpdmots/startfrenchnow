import React from "react";
import Link from "next-intl/link";
import { Fade } from "../../animations/Fades";
import Image from "next/image";
import { MdOutlineEmail } from "react-icons/md";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

export const BetaVersion = () => {
    const t = useTranslations("Stories.BetaVersion");

    return (
        <div className="section overflow-hidden wf-section">
            <div className="container-default w-container">
                <div id="w-node-_34c59c1f-4be7-ed9c-ff5c-c122f878dc41-c2543d52" className="grid [grid-auto-columns:1fr] gap-x-[32px] gap-y-[32px] [grid-template-columns:1fr_1fr_1fr] [grid-template-rows:auto] justify-between gap-x-[24px] [grid-template-columns:0.4fr_minmax(max-content\,_1.1fr)_0.4fr] max-[991px]:[grid-template-columns:1fr_1fr] max-[991px]:[grid-template-columns:1fr] max-[991px]:gap-x-[15px] max-[991px]:[grid-template-columns:0.25fr_minmax(auto\,_1.1fr)_0.25fr] max-[767px]:[grid-template-columns:1fr] max-[767px]:gap-x-[28px] max-[767px]:gap-y-[60px] max-[767px]:[grid-template-columns:1fr_1fr] max-[479px]:[grid-template-columns:1fr] max-[479px]:gap-x-[18px] justify-between gap-x-[24px] [grid-template-columns:0.4fr_minmax(max-content\,_1.1fr)_0.4fr] max-[991px]:gap-x-[15px] max-[991px]:[grid-template-columns:0.25fr_minmax(auto\,_1.1fr)_0.25fr] max-[767px]:gap-x-[28px] max-[767px]:gap-y-[60px] max-[767px]:[grid-template-columns:1fr_1fr] max-[479px]:gap-x-[18px]">
                    <div id="w-node-_5c5dc0c4-b5e3-5f62-6d6f-8e34246cf7f8-c2543d52" className="image-wrapper max-w-[270px] mr-[-71px] mb-[199px] ml-[-52px] max-[991px]:ml-[-71px] max-[767px]:max-w-[225px] max-[767px]:mr-0 max-[767px]:mb-0 max-[767px]:ml-0 left">
                        <Fade>
                            <Image src="/images/story-adventure.png" width={270} height={273} alt={t("image2Alt")} className="object-cover card" />
                        </Fade>
                    </div>

                    <div id="w-node-dc0e7998-b9b3-c083-f58f-6cb9b7068f8e-c2543d52" className="inner-container max-w-[600px] max-[991px]:max-w-full">
                        {/* <SlideFromBottom> */}
                        <div className="inner-container max-[767px]:max-w-[550px]">
                            <div className="mt-[64px] max-[991px]:mt-[53px] max-[767px]:mt-[44px] max-[767px]:mt-0 max-[479px]:mt-0">
                                <div className="mb-[35px] max-[767px]:mb-0 max-[479px]:mb-0">
                                    <div data-w-id="4fcb1f41-b872-2c44-81b4-9b4b37ac484d" className="text-center">
                                        <div className="inner-container max-[479px]:max-w-[400px] center">
                                            <div className="inner-container _400px---mbl center">
                                                <h2 className="display-2 mb-12">{t.rich("title", intelRich())}</h2>
                                            </div>
                                            <p className="mg-bottom-40px">{t.rich("subtitle", intelRich())}</p>
                                        </div>
                                        <Link href="/contact/nicolas" className="btn-primary button-row w-button">
                                            <div className="flex items-center justify-center">
                                                <MdOutlineEmail className="mr-2" />
                                                {t("btnFeedback")}
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="w-node-_9590e10b-34c1-a027-5169-2a6f2e246de6-c2543d52" className="image-wrapper max-w-[270px] mr-[-71px] mb-[199px] ml-[-52px] max-[991px]:ml-[-71px] max-[767px]:max-w-[225px] max-[767px]:mr-0 max-[767px]:mb-0 max-[767px]:ml-0 mr-[-71px] mb-[199px] max-[767px]:max-w-[225px] max-[767px]:mr-0 max-[767px]:mb-0">
                        <Fade>
                            <Image src="/images/story-paris.png" width={270} height={273} alt={t("image2Alt")} className="object-cover card" />
                        </Fade>
                    </div>
                </div>
            </div>
        </div>
    );
};
