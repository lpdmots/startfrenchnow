import { Locale } from "@/i18n";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslations({ locale: locale, namespace: "Metadata.Courses.PastTenses" });

    const path = "/courses/past-tenses";
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
