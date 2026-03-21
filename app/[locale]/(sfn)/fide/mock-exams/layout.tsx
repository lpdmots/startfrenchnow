import { Locale } from "@/i18n";
import { getTranslator } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.FideMockExams");

    const path = "/fide/mock-exams";
    const canonical = locale === "fr" ? `/fr${path}` : path;
    const localeTag = locale === "fr" ? "fr_CH" : "en_US";

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
        openGraph: {
            title: t("title"),
            description: t("description"),
            url: canonical,
            type: "website",
            locale: localeTag,
            alternateLocale: locale === "fr" ? ["en_US"] : ["fr_CH"],
        },
        twitter: {
            card: "summary_large_image",
            title: t("title"),
            description: t("description"),
        },
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
