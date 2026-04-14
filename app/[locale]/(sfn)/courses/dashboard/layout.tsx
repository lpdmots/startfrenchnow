import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Locale } from "@/i18n";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;

    const {
        locale
    } = params;

    const t = await getTranslations({ locale: locale, namespace: "Metadata.Courses.FrenchDashboard" });

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
