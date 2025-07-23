import { getTranslator } from "next-intl/server";
import { Locale } from "@/i18n";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.exercises");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
