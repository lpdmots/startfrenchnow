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
                <div id="w-node-_34c59c1f-4be7-ed9c-ff5c-c122f878dc41-c2543d52" className="grid-3-columns _3-col-hero">
                    <div id="w-node-_5c5dc0c4-b5e3-5f62-6d6f-8e34246cf7f8-c2543d52" className="image-wrapper max-width-270px left">
                        <Fade>
                            <Image src="/images/story-adventure.png" width={270} height={273} alt={t("image2Alt")} className="object-cover card" />
                        </Fade>
                    </div>

                    <div id="w-node-dc0e7998-b9b3-c083-f58f-6cb9b7068f8e-c2543d52" className="inner-container _600px">
                        {/* <SlideFromBottom> */}
                        <div className="inner-container _550px---mbl">
                            <div className="mg-top-64px mg-top-0px---mbl">
                                <div className="mg-borrom-35px mg-bottom-0px---mbl">
                                    <div data-w-id="4fcb1f41-b872-2c44-81b4-9b4b37ac484d" className="text-center">
                                        <div className="inner-container _400px---mbp center">
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

                    <div id="w-node-_9590e10b-34c1-a027-5169-2a6f2e246de6-c2543d52" className="image-wrapper max-width-270px rigth">
                        <Fade>
                            <Image src="/images/story-paris.png" width={270} height={273} alt={t("image2Alt")} className="object-cover card" />
                        </Fade>
                    </div>
                </div>
            </div>
        </div>
    );
};
