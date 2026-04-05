import { Locale } from "@/i18n";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";
import enMessages from "@/app/dictionaries/en.json";
import frMessages from "@/app/dictionaries/fr.json";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;

    const {
        locale
    } = params;

    const t = await getTranslations({ locale: locale, namespace: "Metadata.Fide" });

    const path = "/fide";
    const canonical = locale === "fr" ? `/fr${path}` : path;

    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical,
            languages: {
                en: path,
                fr: `/fr${path}`,
                "x-default": path,
            },
        },
    };
}

interface Props {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function FideLayout(props: Props) {
    const params = await props.params;

    const {
        locale
    } = params;

    const {
        children
    } = props;

    const fullMessages = locale === "fr" ? frMessages : enMessages;
    const messages = fullMessages["Fide"];

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
