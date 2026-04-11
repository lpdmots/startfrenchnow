import { SlideFromLeft } from "@/app/components/animations/Slides";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { BookFirstMeeting } from "./BookFirstMeeting";

export const ContactForFideBand = () => {
    const t = useTranslations("Fide.ContactForFide");
    const tbutton = useTranslations("Fide.HeroFide");

    return (
        <div
            className="footer-newsletter mb-[-1px]"
            style={{
                backgroundImage: "linear-gradient(180deg, var(--neutral-800) 0%, var(--neutral-800) 50%, var(--neutral-200) 50%, var(--neutral-200) 100%)",
            }}
        >
            <div className="container-default w-container">
                <SlideFromLeft>
                    <div className="flex-horizontal space-between max-[767px]:flex-col max-[767px]:justify-center max-[767px]:items-center">
                        <div className="image-wrapper newsletter-image-wrapper position-relative">
                            <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="Newsletter Icon" className="image" />
                        </div>
                        <div className="newsletter-wrapper">
                            <div className="max-[767px]:text-center">
                                <p className="display-4 color-neutral-800 mb-0 text-center md:text-left">{t("title")}</p>
                                <p className="color-neutral-700 mb-0 text-center md:text-left">{t("description")}</p>
                            </div>
                            <div className="flex w-full max-w-[470px] min-h-[72px] mb-0 flex-col justify-center max-[991px]:max-w-full max-[767px]:max-w-[470px] max-[767px]:min-h-[60px] max-[479px]:min-h-[138px] w-form">
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
