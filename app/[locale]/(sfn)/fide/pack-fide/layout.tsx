import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { locale } = params;

    const isFr = locale === "fr";
    const t = await getTranslations({ locale, namespace: "Metadata.FidePackFide" });
    const path = "/fide/pack-fide";
    const canonical = isFr ? `/fr${path}` : path;
    const localeTag = isFr ? "fr_CH" : "en_US";
    const title = t("title");
    const description = t("description");
    const socialImage = "/images/pack-fide-hero.png";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: {
                en: path,
                fr: `/fr${path}`,
                "x-default": path,
            },
        },
        openGraph: {
            title,
            description,
            url: canonical,
            type: "website",
            locale: localeTag,
            alternateLocale: isFr ? ["en_US"] : ["fr_CH"],
            images: [socialImage],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [socialImage],
        },
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
