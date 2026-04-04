import type { Metadata } from "next";
import { Locale } from "@/i18n";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: Locale; slug: string } }): Promise<Metadata> {
    const t = await getTranslations({ locale: params.locale, namespace: "Metadata.Category" });

    const path = `/blog/category/${params.slug}`;
    const canonical = params.locale === "fr" ? `/fr${path}` : path;

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
