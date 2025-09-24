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
    let messages;

    try {
        const fullMessages = (await import(`@/app/dictionaries/${locale}.json`)).default;
        messages = fullMessages["Fide"];
    } catch (error) {
        throw new Error(`Impossible de charger les messages de "Fide" pour la locale ${locale}`);
    }

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
