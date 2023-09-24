import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";

function CoreValuesMethod() {
    const t = useTranslations("CoreValuesMethod");

    const coreValuesData = [
        {
            image: "/images/hard-work-image-paperfolio-webflow-template.png",
            title: t("coreValues.serious.title"),
            content: t("coreValues.serious.content"),
        },
        {
            image: "/images/innovation-image-paperfolio-webflow-template.png",
            title: t("coreValues.smartLearning.title"),
            content: t("coreValues.smartLearning.content"),
        },
        {
            image: "/images/fun-image-paperfolio-webflow-template.png",
            title: t("coreValues.fun.title"),
            content: t("coreValues.fun.content"),
        },
        {
            image: "/images/growth-image-paperfolio-webflow-template.png",
            title: t("coreValues.fullMethod.title"),
            content: t("coreValues.fullMethod.content"),
        },
    ];

    return (
        <div className="container-default w-container">
            <SlideInOneByOneParent>
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <div className="mg-bottom-54px">
                            <div className="text-center---tablet">
                                <div className="w-layout-grid grid-2-columns title-and-paragraph">
                                    <div className="inner-container _525px">
                                        <div className="inner-container _400px---mbl center">
                                            <div className="inner-container _350px---mbp center">
                                                <h2 className="display-2 mg-bottom-0">{t.rich("title", intelRich())}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="inner-container _525px">
                                        <p className="mg-bottom-0 text-neutral-700">{t.rich("description", intelRich())}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-layout-grid grid-2-columns values-grid">
                            {coreValuesData.map(({ image, title, content }) => (
                                <div key={title}>
                                    <SlideInOneByOneChild>
                                        <div className="card image-left---text-rigth h-full">
                                            <div className="image-wrapper card-value-image-left-wrapper h-full">
                                                <Image src={image} loading="eager" alt={title} className="image fit-cover" height={400} width={400} />
                                            </div>
                                            <div className="card-value-conter-left">
                                                <h3>{title}</h3>
                                                <p className="mg-bottom-0">{content}</p>
                                            </div>
                                        </div>
                                    </SlideInOneByOneChild>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SlideInOneByOneParent>
        </div>
    );
}

export default CoreValuesMethod;
