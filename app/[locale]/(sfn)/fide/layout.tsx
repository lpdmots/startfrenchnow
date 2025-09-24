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
    return <>{children}</>;
}
