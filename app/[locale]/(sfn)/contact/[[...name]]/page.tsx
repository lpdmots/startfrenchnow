import { ContactClient } from "@/app/components/sfn/contact/ContactClient";
import { useTranslations } from "next-intl";

function Contact({ params: { name: nameList } }: { params: { name: string } }) {
    const t = useTranslations("Contact");
    const contactMessages = getContactMessages(t);
    return (
        <div className="page-wrapper">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center">
                            <div className="mg-bottom-60px">
                                <div className="text-center---tablet">
                                    <div className="w-layout-grid grid-2-columns title-and-paragraph v2">
                                        <div className="flex-horizontal start flex-wrap center---tablet">
                                            <h1 className="display-1 color-neutral-800 mg-bottom-0 heading-span-secondary-2 ml-4">{t("title")}</h1>
                                        </div>
                                        <div className="inner-container _560px">
                                            <p className="text-center md:text-right mg-bottom-0">{t("description")}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-layout-grid grid-2-columns blog-left-sidebar">
                                <ContactClient nameList={nameList} messages={contactMessages} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;

const getContactMessages = (t: any) => {
    return {
        contactPrompt: t("ContactClient.contactPrompt"),
        yohann: t("ContactClient.yohann"),
        nicolas: t("ContactClient.nicolas"),
        ContactForm: {
            emailTo: t("ContactClient.ContactForm.emailTo"),
            nameLabel: t("ContactClient.ContactForm.nameLabel"),
            emailLabel: t("ContactClient.ContactForm.emailLabel"),
            emailPlaceholder: t("ContactClient.ContactForm.emailPlaceholder"),
            subjectLabel: t("ContactClient.ContactForm.subjectLabel"),
            subjectPlaceholder: t("ContactClient.ContactForm.subjectPlaceholder"),
            messageLabel: t("ContactClient.ContactForm.messageLabel"),
            messagePlaceholder: t("ContactClient.ContactForm.messagePlaceholder"),
            subscribeNewsletter: t("ContactClient.ContactForm.subscribeNewsletter"),
            sendButton: t("ContactClient.ContactForm.sendButton"),
            loading: t("ContactClient.ContactForm.loading"),
            error: t("ContactClient.ContactForm.error"),
            successTitle: t("ContactClient.ContactForm.successTitle"),
            successMessage: t("ContactClient.ContactForm.successMessage"),
            successNewsletter: t("ContactClient.ContactForm.successNewsletter"),
            successFooter: t("ContactClient.ContactForm.successFooter"),
        },
    };
};
