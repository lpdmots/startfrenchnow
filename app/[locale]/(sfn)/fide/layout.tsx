import { Locale } from "@/i18n";
import { getTranslator } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.Fide");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function FideLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
