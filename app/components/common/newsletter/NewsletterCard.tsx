import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { NewsletterCardForm } from "./NewsletterCardForm";
import { getFormMessages } from "./NewsletterFooter";

function NewsletterCard() {
    const t = useTranslations("Newsletter");
    const formMessages = getFormMessages(t);

    return (
        <div data-w-id="32f4274f-5340-1bd4-838f-6737839a901b" className="newsletter-card">
            <div className="mg-bottom-24px">
                <Image src="/images/get-in-touch-image-paperfolio-webflow-template.svg" height={92} width={92} loading="eager" alt="get in touch image" />
            </div>
            <div className="text-center mg-bottom-24px">
                <div className="inner-container _400px---tablet center">
                    <div className="inner-container _350px---mbl center">
                        <h2 className="display-4 mg-bottom-8px">{t.rich("title", intelRich())}</h2>
                        <div className="flex items-center">
                            <span className="mb-0">{t("description")}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="nesletter-sidebar-form-block w-form">
                <NewsletterCardForm formMessages={formMessages} />
            </div>
        </div>
    );
}

export default NewsletterCard;
