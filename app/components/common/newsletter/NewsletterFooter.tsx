import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { SlideFromLeft } from "../../animations/Slides";
import { NewsLetterForm } from "./NewsLetterForm";

function NewsletterFooter() {
    const t = useTranslations("Newsletter");
    const formMessages = getFormMessages(t);
    return (
        <div className="footer-newsletter">
            <div className="container-default w-container">
                <SlideFromLeft>
                    <div data-w-id="302ad83d-63c4-ff55-2757-b5c6518390b4" className="flex-horizontal space-between flex-vertical-tbl">
                        <div className="image-wrapper newsletter-image-wrapper position-relative">
                            <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="Newsletter Icon - Paperfolio Webflow Template" className="image" />
                        </div>
                        <div className="newsletter-wrapper">
                            <div className="text-center-mbl">
                                <p className="display-4 mb-0">{t.rich("title", intelRich())}</p>
                                <div className="flex items-center">
                                    <p className="mb-0 mr-2">{t("description")}</p>
                                </div>
                            </div>
                            <div className="footer-form-block w-form">
                                <NewsLetterForm formMessages={formMessages} />
                            </div>
                        </div>
                    </div>
                </SlideFromLeft>
            </div>
        </div>
    );
}

export default NewsletterFooter;

export const getFormMessages = (t: any) => {
    return {
        successMessage: t("successMessage"),
        errorMessage: t("errorMessage"),
        placeholder: t("placeholder"),
        button: t("button"),
    };
};
