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
                <div className="flex-horizontal space-between newsletter-section---main">
                    <div className="image-wrapper newsletter-image-wrapper newsletter-section">
                        <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="newsletter icon" className="image " />
                    </div>
                    <div className="newsletter-wrapper newsletter-section">
                        <div className="text-center-mbl color-neutral-100">
                            <p className="display-4 mb-0 color-neutral-100">
                                Subscribe to <span className="text-no-wrap">my newsletter</span>
                            </p>
                            <div className="flex items-center">
                                <p className="mb-0 mr-2">Stay informed and get a free video</p>
                            </div>
                        </div>
                        <div className="newsletter-form-block w-form">
                            <NewsletterBandForm formMessages={formMessages} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsletterBand;
