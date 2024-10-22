import { SlideFromLeft } from "@/app/components/animations/Slides";
import { getFormMessages } from "@/app/components/common/newsletter/NewsletterFooter";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ContactFideInput } from "./ContactFideInput";

export const ContactForFide = () => {
    const t = useTranslations("Fide.ContactForFide");
    const formMessages = getFormMessages(t);

    return (
        <SlideFromLeft>
            <div className="footer-newsletter newsletter-section mt-12">
                <div className="container-default w-container">
                    <div className="flex-horizontal space-between newsletter-section---main">
                        <div className="image-wrapper newsletter-image-wrapper newsletter-section">
                            <Image
                                src="/images/newsletter-image-paperfolio-webflow-template.svg"
                                height={189}
                                width={190}
                                loading="eager"
                                alt="Newsletter Icon - Paperfolio Webflow Template"
                                className="image"
                            />
                        </div>
                        <div className="newsletter-wrapper newsletter-section">
                            <div className="flex flex-col">
                                <p className="display-4 color-neutral-100 mb-0 text-center md:text-left">{t("title")}</p>
                                <p className="color-neutral-300 mb-0 text-center md:text-left">{t("description")}</p>
                            </div>
                            <div className="newsletter-form-block w-form">
                                <ContactFideInput formMessages={formMessages} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SlideFromLeft>
    );
};