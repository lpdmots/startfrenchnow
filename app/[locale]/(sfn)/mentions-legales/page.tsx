import { Locale } from "@/i18n";
import { useTranslations } from "next-intl";

function MentionsLegales({ params }: { params: { locale: string } }) {
    const locale = params.locale as Locale;
    const t = useTranslations("MentionsLegales");

    return <div className="page-wrapper">À venir...</div>;
}

export default MentionsLegales;
