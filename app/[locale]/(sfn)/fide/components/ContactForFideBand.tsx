import { SlideFromLeft } from "@/app/components/animations/Slides";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { BookFirstMeeting } from "./BookFirstMeeting";

export const ContactForFideBand = () => {
    const t = useTranslations("Fide.ContactForFide");
    const tbutton = useTranslations("Fide.HeroFide");

    return (
        <div className="footer-newsletter footer-newsletter-inversed-colors">
            <div className="container-default w-container">
                <SlideFromLeft>
                    <div className="flex-horizontal space-between flex-vertical-tbl">
                        <div className="image-wrapper newsletter-image-wrapper position-relative">
                            <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="Newsletter Icon" className="image" />
                        </div>
                        <div className="newsletter-wrapper">
                            <div className="text-center-mbl">
                                <p className="display-4 color-neutral-800 mb-0 text-center md:text-left">{t("title")}</p>
                                <p className="color-neutral-700 mb-0 text-center md:text-left">{t("description")}</p>
                            </div>
                            <div className="footer-form-block w-form">
                                <div className="flex w-full justify-center">
                                    <BookFirstMeeting label={tbutton("buttonPrimary")} variant="primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </SlideFromLeft>
            </div>
        </div>
    );
};
