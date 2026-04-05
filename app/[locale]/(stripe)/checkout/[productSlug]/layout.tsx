import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import enMessages from "@/app/dictionaries/en.json";
import frMessages from "@/app/dictionaries/fr.json";

interface Props {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}
export const metadata = {
    robots: { index: false, follow: false },
};

export default async function CheckoutLayout(props: Props) {
    const params = await props.params;

    const {
        locale
    } = params;

    const {
        children
    } = props;

    const fullMessages = locale === "fr" ? frMessages : enMessages;
    const messages = fullMessages["Checkout"];

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
