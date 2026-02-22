import React from "react";
import { FaPenFancy } from "react-icons/fa";
import Image from "next/image";
import { SlideFromBottom } from "../../animations/Slides";
import { useLocale, useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import Link from "next-intl/link";
import { Locale } from "@/i18n";

export const WhyStories = () => {
    const t = useTranslations("Stories.WhyStories");
    const locale = useLocale();

    const argumentsList = [
        {
            title: t("argumentsList.languageComprehension.title"),
            icon: { url: "/images/execution.png", alt: "Comprehension" },
            description: t("argumentsList.languageComprehension.description"),
        },
        {
            title: t("argumentsList.vocabularyAcquisition.title"),
            icon: { url: "/images/dictionary.png", alt: "Dictionary" },
            description: t("argumentsList.vocabularyAcquisition.description"),
        },
        {
            title: t("argumentsList.adaptedToYourNeeds.title"),
            icon: { url: "/images/adaptation.png", alt: "Adaptation" },
            description: t("argumentsList.adaptedToYourNeeds.description"),
        },
        {
            title: t("argumentsList.engagementAndEnjoyment.title"),
            icon: { url: "/images/smile.png", alt: "happy smiley" },
            description: t("argumentsList.engagementAndEnjoyment.description"),
        },
        {
            title: t("argumentsList.repetitionAndReinforcement.title"),
            icon: { url: "/images/rinse.png", alt: "Repetition" },
            description: t("argumentsList.repetitionAndReinforcement.description"),
        },
        {
            title: t("argumentsList.anywhereAnytime.title"),
            icon: { url: "/images/time-management.png", alt: "time-management" },
            description: t("argumentsList.anywhereAnytime.description"),
        },
    ];

    return (
        <div id="moreInfo" className="section bg-neutral-800 wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <div className="w-layout-grid grid-2-columns blog-left-sidebar gap-column-64px">
                            <div id="w-node-eb9abc4f-1a64-dc91-46de-47243848b65b-b9543dac" data-w-id="eb9abc4f-1a64-dc91-46de-47243848b65b" className="sticky-top _48px-top sticky-tbl">
                                <div className="inner-container _535px">
                                    <div className="text-center---tablet">
                                        <div className="inner-container _500px---tablet center">
                                            <SlideFromBottom>
                                                <div className="inner-container _300px---mbl center">
                                                    <h2 className="display-2 color-neutral-100">
                                                        <span className="z-index-1">{t.rich("title", intelRich())}</span>
                                                    </h2>
                                                </div>
                                            </SlideFromBottom>
                                        </div>
                                        <SlideFromBottom>
                                            <>
                                                <p className="color-neutral-300 mg-bottom-40px">{t("description")}</p>
                                                <Link href="/blog/post/decouvrez-les-bienfaits-des-histoires-interactives-pour-apprendre-le-francais" className="btn-secondary variant w-button">
                                                    <div className="flex items-center justify-center">
                                                        <FaPenFancy className="mr-2" />
                                                        {t("btnReadMore")}
                                                    </div>
                                                </Link>
                                            </>
                                        </SlideFromBottom>
                                    </div>
                                </div>
                            </div>
                            <div id="w-node-_20d05100-4494-e1df-c799-844a90f09c7c-b9543dac" className="grid-1-column gap-40px">
                                {argumentsList.map((argument) => (
                                    <Argument key={argument.title} {...argument} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ArgumentProps {
    title: string;
    description: string;
    icon: any;
}

const Argument = ({ title, description, icon }: ArgumentProps) => {
    return (
        <SlideFromBottom>
            <div id="w-node-_8d83adfe-2d0c-e555-1807-e37fe0b61b0d-b9543dac" className="card resume-card-v1">
                <div className="top-content-resume-card">
                    <div className="flex-horizontal space-between reverse-wrap">
                        <div className="resume-card-period">{title}</div>
                        <Image src={icon.url} height={60} width={60} alt={icon.alt} />
                    </div>
                </div>
                <div className="resume-card-divider"></div>
                <div className="bottom-content-resume-card">
                    <p className="mg-bottom-0">{description}</p>
                </div>
            </div>
        </SlideFromBottom>
    );
};
