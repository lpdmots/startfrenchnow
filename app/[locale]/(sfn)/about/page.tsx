import Hobbies from "@/app/components/sfn/about/Hobbies";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import Image from "next/image";
import Link from "next-intl/link";
import React from "react";
import { MdOutlineEmail } from "react-icons/md";
import { Fade } from "@/app/components/animations/Fades";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

function About() {
    const t = useTranslations("About");

    return (
        <div className="page-wrapper">
            <div className="section hero v2 overflow-hidden wf-section">
                <div className="container-default w-container">
                    <div
                        id="w-node-_34c59c1f-4be7-ed9c-ff5c-c122f878dc41-c2543d52"
                        className="grid [grid-auto-columns:1fr] gap-x-[32px] gap-y-[32px] [grid-template-columns:1fr_1fr_1fr] [grid-template-rows:auto] justify-between gap-x-[24px] [grid-template-columns:0.4fr_minmax(max-content\,_1.1fr)_0.4fr] max-[991px]:[grid-template-columns:1fr_1fr] max-[991px]:[grid-template-columns:1fr] max-[991px]:gap-x-[15px] max-[991px]:[grid-template-columns:0.25fr_minmax(auto\,_1.1fr)_0.25fr] max-[767px]:[grid-template-columns:1fr] max-[767px]:gap-x-[28px] max-[767px]:gap-y-[60px] max-[767px]:[grid-template-columns:1fr_1fr] max-[479px]:[grid-template-columns:1fr] max-[479px]:gap-x-[18px] justify-between gap-x-[24px] [grid-template-columns:0.4fr_minmax(max-content\,_1.1fr)_0.4fr] max-[991px]:gap-x-[15px] max-[991px]:[grid-template-columns:0.25fr_minmax(auto\,_1.1fr)_0.25fr] max-[767px]:gap-x-[28px] max-[767px]:gap-y-[60px] max-[767px]:[grid-template-columns:1fr_1fr] max-[479px]:gap-x-[18px]"
                    >
                        <div
                            id="w-node-_5c5dc0c4-b5e3-5f62-6d6f-8e34246cf7f8-c2543d52"
                            className="image-wrapper max-w-[270px] mr-[-71px] mb-[199px] ml-[-52px] max-[991px]:ml-[-71px] max-[767px]:max-w-[225px] max-[767px]:mr-0 max-[767px]:mb-0 max-[767px]:ml-0 left"
                        >
                            <Fade>
                                <Image src="/images/about-hero-left-image-paperfolio-webflow-template.png" width={270} height={273} alt="about teacher image" className="object-contain" />
                            </Fade>
                        </div>

                        <div id="w-node-dc0e7998-b9b3-c083-f58f-6cb9b7068f8e-c2543d52" className="inner-container max-w-[600px] max-[991px]:max-w-full">
                            <div className="inner-container max-[767px]:max-w-[550px]">
                                <div className="mt-[64px] max-[991px]:mt-[53px] max-[767px]:mt-[44px] max-[767px]:mt-0 max-[479px]:mt-0">
                                    <div className="mb-[35px] max-[767px]:mb-0 max-[479px]:mb-0">
                                        <div data-w-id="4fcb1f41-b872-2c44-81b4-9b4b37ac484d" className="text-center">
                                            <div className="inner-container max-[479px]:max-w-[400px] center">
                                                <div className="inner-container _400px---mbl center">
                                                    <h1 className="display-1 mb-4">
                                                        Enchanté, moi c'est <span className="heading-span-secondary-2">Yohann</span>
                                                    </h1>
                                                </div>
                                                <p className="mg-bottom-40px">{t.rich("introDescription", intelRich())}</p>
                                            </div>
                                            <Link href="/contact" className="btn-primary button-row w-button">
                                                <div className="flex items-center justify-center">
                                                    <MdOutlineEmail className="mr-2" />
                                                    {t("button")}
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            id="w-node-_9590e10b-34c1-a027-5169-2a6f2e246de6-c2543d52"
                            className="image-wrapper max-w-[270px] mr-[-71px] mb-[199px] ml-[-52px] max-[991px]:ml-[-71px] max-[767px]:max-w-[225px] max-[767px]:mr-0 max-[767px]:mb-0 max-[767px]:ml-0 mr-[-71px] mb-[199px] max-[767px]:max-w-[225px] max-[767px]:mr-0 max-[767px]:mb-0"
                        >
                            <Fade>
                                <Image src="/images/about-hero-rigth-image-paperfolio-webflow-template.png" width={270} height={273} alt="about pencil" className="object-contain" />
                            </Fade>
                        </div>
                    </div>
                </div>
            </div>
            <div id="My-Story" className="section pd-top-0 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center">
                            <div className="w-layout-grid grid-2-columns text-right-default gap-x-[40px] [grid-template-columns:0.95fr_1fr] max-[991px]:gap-y-[60px] max-[991px]:[grid-template-columns:1fr]">
                                <div id="w-node-c2929208-8d91-98cc-9b09-092b6fe57133-c2543d52" className="inner-container max-w-[583px] _100---tablet">
                                    <div className="mg-bottom-54px">
                                        <div className="text-center---tablet">
                                            <SlideFromBottom>
                                                <h2 data-w-id="94dd1cd1-5dda-c634-8877-ea0facb5345a" className="display-2 mg-bottom-0">
                                                    {t.rich("storyTitle", intelRich())}
                                                </h2>
                                            </SlideFromBottom>
                                        </div>
                                    </div>
                                    <div className="inner-container max-w-[553px] _100---tablet">
                                        <div className="image-wrapper">
                                            <Fade delay={0.6}>
                                                <Image src="/images/my-story-image-paperfolio-webflow-template.png" alt="my story image" height={500} width={500} className="image" loading="lazy" />
                                            </Fade>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    id="w-node-_8fce2975-a4c1-d75d-4e92-2f3e3dce47b0-c2543d52"
                                    data-w-id="8fce2975-a4c1-d75d-4e92-2f3e3dce47b0"
                                    className="inner-container max-w-[580px] _100---tablet"
                                >
                                    <SlideFromBottom delay={0.8}>
                                        <>
                                            <p className="mg-bottom-24px keep w-clearfix">
                                                <span className="mr-[4px] [float:left] [clear:right] text-[var(--neutral-800)] text-[56px] leading-[60px] font-bold">{t("capital")}</span>
                                                {t.rich("storyParagraph1", intelRich())}
                                            </p>
                                            <p className="mg-bottom-40px">{t.rich("storyParagraph2", intelRich())}</p>
                                            <p className="mg-bottom-40px">{t.rich("storyParagraph3", intelRich())}</p>
                                            <p className="mg-bottom-40px">{t.rich("storyParagraph4", intelRich())}</p>
                                        </>
                                    </SlideFromBottom>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Hobbies />
        </div>
    );
}

export default About;
