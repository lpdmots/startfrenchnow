import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    params: { locale: string };
}

export default async function CheckoutLayout({ children, params: { locale } }: Props) {
    let messages;

    try {
        const fullMessages = (await import(`@/app/dictionaries/${locale}.json`)).default;
        messages = fullMessages["Checkout"];
    } catch (error) {
        throw new Error(`Impossible de charger les messages "Checkout" pour la locale ${locale}`);
    }

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
