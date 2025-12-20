import { SlideFromLeft } from "@/app/components/animations/Slides";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { AskForPdf } from "./AskForPdf";

function GetPdfBand() {
    const t = useTranslations("Fide.WhatIsFide");
    const messages = getFormMessages(t);
    return (
        <div className="footer-newsletter footer-newsletter-inversed-colors">
            <div className="container-default w-container">
                <SlideFromLeft>
                    <div data-w-id="302ad83d-63c4-ff55-2757-b5c6518390b4" className="flex-horizontal space-between flex-vertical-tbl">
                        <div className="image-wrapper newsletter-image-wrapper position-relative">
                            <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="Newsletter Icon" className="image" />
                        </div>
                        <div className="newsletter-wrapper">
                            <div className="text-center-mbl">
                                <p className="display-4 mb-0">{t.rich("AskForPdf.askTitelBand", intelRich())}</p>
                                <div className="flex items-center">
                                    <p className="mb-0 mr-2">{t("AskForPdf.askDescription")}</p>
                                </div>
                            </div>
                            <div className="footer-form-block w-form">
                                <AskForPdf messages={messages} withLabel={false} />
                            </div>
                        </div>
                    </div>
                </SlideFromLeft>
            </div>
        </div>
    );
}

export default GetPdfBand;

export const getFormMessages = (t: any) => {
    return {
        ask: t("AskForPdf.askTitelBand"),
        description: t("AskForPdf.askDescription"),
        emailPlaceholder: t("AskForPdf.emailPlaceholder"),
        button: t("AskForPdf.button"),
        successMessage: t.rich("AskForPdf.successMessage", intelRich()),
        errorMessage: t("AskForPdf.errorMessage"),
    };
};
