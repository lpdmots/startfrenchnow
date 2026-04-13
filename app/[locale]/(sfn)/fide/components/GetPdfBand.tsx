import { SlideFromLeft } from "@/app/components/animations/Slides";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { AskForPdf } from "./AskForPdf";

function GetPdfBand({ fullDarkBackground = false, insetDarkPanel = false }: { fullDarkBackground?: boolean; insetDarkPanel?: boolean }) {
    const t = useTranslations("Fide.WhatIsFide");
    const messages = getFormMessages(t);
    return (
        <div
            className={`footer-newsletter mb-[-1px] relative overflow-hidden py-6 ${insetDarkPanel ? "bg-neutral-200" : ""}`}
            style={{
                background: "none",
                backgroundImage: "none",
            }}
        >
            <div className="absolute inset-0 pointer-events-none">
                {insetDarkPanel ? (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60%]" style={{ backgroundColor: "var(--neutral-800)" }} />
                ) : fullDarkBackground ? (
                    <div className="h-full" style={{ backgroundColor: "var(--neutral-800)" }} />
                ) : (
                    <>
                        <div className="h-1/2" style={{ backgroundColor: "var(--neutral-800)" }} />
                        <div className="h-1/2" style={{ backgroundColor: "var(--neutral-200)" }} />
                    </>
                )}
            </div>
            <div className="container-default w-container relative z-[1]">
                <SlideFromLeft>
                    <div data-w-id="302ad83d-63c4-ff55-2757-b5c6518390b4" className="flex-horizontal space-between max-[767px]:flex-col max-[767px]:justify-center max-[767px]:items-center">
                        <div className="image-wrapper newsletter-image-wrapper position-relative">
                            <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="Newsletter Icon" className="image" />
                        </div>
                        <div className="newsletter-wrapper">
                            <div className="max-[767px]:text-center">
                                <p className="display-4 mb-0">{t.rich("AskForPdf.askTitelBand", intelRich())}</p>
                                <div className="flex items-center">
                                    <p className="mb-0 mr-2">{t("AskForPdf.askDescription")}</p>
                                </div>
                            </div>
                            <div className="flex w-full max-w-[470px] min-h-[72px] mb-0 flex-col justify-center max-[991px]:max-w-full max-[767px]:max-w-[470px] max-[767px]:min-h-[60px] max-[479px]:min-h-[138px] w-form">
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
