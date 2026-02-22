import { getTranslator } from "next-intl/server";
import { Locale } from "@/i18n";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.Courses.FrenchDashboard");

    return {
        title: t("title"),
        description: t("description"),
        robots: { index: false },
    };
}

export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: Locale } }) {
    return <>{children}</>;
}
