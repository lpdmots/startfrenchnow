import { useTranslations } from "next-intl";
import { ContactFideForm } from "./ContactFideForm";
import { intelRich } from "@/app/lib/intelRich";

export const ContactForFideCourses = () => {
    const t = useTranslations("Fide.ContactForFideCourses");
    const messages = getMessages(t);

    return (
        <div className="flex flex-col items-center justify-center color-neutral-100">
            <h2 className="display-2 color-neutral-100 text-center">{t.rich("title", intelRich())}</h2>
            <p className="text-center mb-12">
                {t.rich("description1", intelRich())}
                <span className="text-xl">{t.rich("description2", intelRich())}</span>
                {t.rich("description3", intelRich())}
            </p>
            <ContactFideForm messages={messages} />
        </div>
    );
};

const getMessages = (t: any) => ({
    objectifPlaceholder: t("ContactFideForm.objectifPlaceholder"),
    objectifOptions: {
        preparationFide: t("ContactFideForm.objectifOptions.preparationFide"),
        naturalisation: t("ContactFideForm.objectifOptions.naturalisation"),
    },
    niveauActuelPlaceholder: t("ContactFideForm.niveauActuelPlaceholder"),
    niveauActuelOptions: {
        a0: t("ContactFideForm.niveauActuelOptions.a0"),
        a1: t("ContactFideForm.niveauActuelOptions.a1"),
        a2: t("ContactFideForm.niveauActuelOptions.a2"),
        b1: t("ContactFideForm.niveauActuelOptions.b1"),
        unknown: t("ContactFideForm.niveauActuelOptions.unknown"),
    },
    niveauSouhaitePlaceholder: t("ContactFideForm.niveauSouhaitePlaceholder"),
    niveauSouhaiteOptions: {
        a1: t("ContactFideForm.niveauSouhaiteOptions.a1"),
        a2: t("ContactFideForm.niveauSouhaiteOptions.a2"),
        b1: t("ContactFideForm.niveauSouhaiteOptions.b1"),
        unknown: t("ContactFideForm.niveauSouhaiteOptions.unknown"),
    },
    specificRequestPlaceholder: t("ContactFideForm.specificRequestPlaceholder"),
    emailPlaceholder: t("ContactFideForm.emailPlaceholder"),
    button: t("ContactFideForm.button"),
    additionalInfo1: t("ContactFideForm.additionalInfo1"),
    additionalInfo2: t.rich("ContactFideForm.additionalInfo2", intelRich()),
    additionalInfo3: t("ContactFideForm.additionalInfo3"),
    successMessage: t("ContactFideForm.successMessage"),
    errorMessage: t("ContactFideForm.errorMessage"),
});
