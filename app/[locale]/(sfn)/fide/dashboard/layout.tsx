import { getTranslator } from "next-intl/server";
import { Locale } from "@/i18n";
import { NextIntlClientProvider } from "next-intl";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.Home");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: Locale } }) {
    return <>{children}</>;
}
