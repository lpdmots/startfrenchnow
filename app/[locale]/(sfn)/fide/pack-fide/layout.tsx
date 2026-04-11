export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    const isFr = locale === "fr";
    const path = "/fide/pack-fide";
    const canonical = isFr ? `/fr${path}` : path;
    const localeTag = isFr ? "fr_CH" : "en_US";
    const title = isFr
        ? "Pack FIDE e-learning | Vidéos, examens blancs et accompagnement | Start French Now"
        : "FIDE e-learning Pack | Videos, mock exams, and guidance | Start French Now";
    const description = isFr
        ? "Préparez le FIDE avec une plateforme e-learning complète: programme vidéo, 100+ examens blancs et formules autonome ou accompagnée."
        : "Prepare for FIDE with a complete e-learning platform: video program, 100+ mock exams, and self-paced or guided plans.";

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
            images: ["/images/fide-presentation-thumbnail.png"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/images/fide-presentation-thumbnail.png"],
        },
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

