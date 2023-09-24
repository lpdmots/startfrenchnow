import { Locale } from "@/i18n";
import { getTranslator } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.About");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
