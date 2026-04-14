import { Locale } from "@/i18n";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;

    const {
        locale
    } = params;

    const t = await getTranslations({ locale: locale, namespace: "Metadata.FideMockExams" });

    const path = "/fide/mock-exams";
    const canonical = locale === "fr" ? `/fr${path}` : path;
    const localeTag = locale === "fr" ? "fr_CH" : "en_US";
    const socialImage = "/images/mock-exam-hero2.png";

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
            images: [socialImage],
        },
        twitter: {
            card: "summary_large_image",
            title: t("title"),
            description: t("description"),
            images: [socialImage],
        },
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
