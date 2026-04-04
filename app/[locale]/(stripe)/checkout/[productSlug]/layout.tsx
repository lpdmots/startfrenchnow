import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import enMessages from "@/app/dictionaries/en.json";
import frMessages from "@/app/dictionaries/fr.json";

interface Props {
    children: ReactNode;
    params: { locale: string };
}
export const metadata = {
    robots: { index: false, follow: false },
};

export default async function CheckoutLayout({ children, params: { locale } }: Props) {
    const fullMessages = locale === "fr" ? frMessages : enMessages;
    const messages = fullMessages["Checkout"];

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
