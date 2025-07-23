import { Locale } from "@/i18n";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    params: { locale: Locale };
}

export default async function PrivateLessonsLayout({ children, params: { locale } }: Props) {
    let messages;

    try {
        const fullMessages = (await import(`@/app/dictionaries/${locale}.json`)).default;
        messages = fullMessages["PrivateLessons"];
    } catch (error) {
        throw new Error(`Impossible de charger les messages de "PrivateLessons" pour la locale ${locale}`);
    }

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
