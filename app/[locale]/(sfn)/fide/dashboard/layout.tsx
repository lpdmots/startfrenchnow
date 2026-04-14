import { getTranslations } from "next-intl/server";
import { Locale } from "@/i18n";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;

    const {
        locale
    } = params;

    const t = await getTranslations({ locale: locale, namespace: "Metadata.FideDashboard" });

    return {
        title: t("title"),
        description: t("description"),
        robots: { index: false },
    };
}

export default async function RootLayout(props: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const params = await props.params;

    const {
        locale
    } = params;

    const {
        children
    } = props;

    return <>{children}</>;
}
