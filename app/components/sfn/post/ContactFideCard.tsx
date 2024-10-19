import { ContactFideInput } from "@/app/[locale]/(sfn)/fide/components/ContactFideInput";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ContactFideBlogInput } from "./ContactFideBlogInput";

export function ContactFideCard() {
    const t = useTranslations("Fide.ContactForFide");

    const formMessages = {
        successMessage: t("successMessage"),
        errorMessage: t("errorMessage"),
        placeholder: t("placeholder"),
        button: t("button"),
    };

    return (
        <div data-w-id="32f4274f-5340-1bd4-838f-6737839a901b" className="newsletter-card">
            <div className="mg-bottom-24px">
                <Image src="/images/task.png" height={92} width={92} loading="eager" alt="get in touch image" />
            </div>
            <div className="text-center mg-bottom-24px">
                <div className="inner-container _400px---tablet center">
                    <div className="inner-container _350px---mbl center">
                        <h2 className="display-4 mg-bottom-8px">{t("title")}</h2>
                        <div className="flex items-center">
                            <span className="mb-0">{t("description")}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="nesletter-sidebar-form-block w-form">
                <ContactFideBlogInput formMessages={formMessages} />
            </div>
        </div>
    );
}
