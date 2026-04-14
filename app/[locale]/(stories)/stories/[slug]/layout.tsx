import "@/app/styles/stories.css";
import { Locale } from "@/i18n";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;

    const {
        locale
    } = params;

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
