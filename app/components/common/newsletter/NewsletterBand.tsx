import { useTranslations } from "next-intl";
import Image from "next/image";
import { NewsletterBandForm } from "./NewsletterBandForm";
import { getFormMessages } from "./NewsletterFooter";

function NewsletterBand() {
    const t = useTranslations("Newsletter");
    const formMessages = getFormMessages(t);

    return (
        <div className="footer-newsletter newsletter-section">
            <div className="container-default w-container">
                <div className="flex-horizontal space-between max-[991px]:max-w-[600px] max-[991px]:mr-auto max-[991px]:ml-auto max-[991px]:justify-center max-[767px]:max-w-[500px] max-[767px]:flex-col max-[767px]:justify-center max-[767px]:items-center">
                    <div className="image-wrapper newsletter-image-wrapper newsletter-section">
                        <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="newsletter icon" className="image " />
                    </div>
                    <div className="newsletter-wrapper newsletter-section">
                        <div className="max-[767px]:text-center color-neutral-100">
                            <p className="display-4 mb-0 color-neutral-100">
                                Subscribe to <span className="text-no-wrap">my newsletter</span>
                            </p>
                            <div className="flex items-center">
                                <p className="mb-0 mr-2">Stay informed and get a free video</p>
                            </div>
                        </div>
                        <div className="flex w-full max-w-[470px] min-h-[68px] mb-0 flex-col justify-center max-[991px]:max-w-full max-[767px]:min-h-[58px] max-[479px]:min-h-[136px] w-form">
                            <NewsletterBandForm formMessages={formMessages} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsletterBand;
