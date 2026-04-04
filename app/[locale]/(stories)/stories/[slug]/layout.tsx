import "@/app/styles/stories.css";
import { Locale } from "@/i18n";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslations({ locale: locale, namespace: "Metadata.StoriesApp" });

    return {
        title: t("title"),
        description: t("description"),
        robots: { index: false },
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
