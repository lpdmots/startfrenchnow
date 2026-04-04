import type { Metadata } from "next";
import { Locale } from "@/i18n";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
    const t = await getTranslations({ locale: locale, namespace: "Metadata.Courses.Beginners" });

    const path = "/courses/beginners";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
