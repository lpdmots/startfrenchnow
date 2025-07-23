import { Locale } from "@/i18n";
import { NextIntlClientProvider } from "next-intl";
import { getTranslator } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.Fide");

    return {
        title: t("title"),
        description: t("description"),
    };
}

interface Props {
    children: ReactNode;
    params: { locale: string };
}

export default async function FideLayout({ children, params: { locale } }: Props) {
    let messages;

    try {
        const fullMessages = (await import(`@/app/dictionaries/${locale}.json`)).default;
        messages = fullMessages["Fide"];
    } catch (error) {
        throw new Error(`Impossible de charger les messages pour la locale ${locale}`);
    }

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
