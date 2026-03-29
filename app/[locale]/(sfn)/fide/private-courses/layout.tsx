import { Locale } from "@/i18n";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const isFr = locale === "fr";
    const path = "/fide/private-courses";
    const canonical = isFr ? `/fr${path}` : path;
    const localeTag = isFr ? "fr_CH" : "en_US";
    const title = isFr ? "Cours privés FIDE en ligne (1:1) | Préparation test FIDE | Start French Now" : "Private FIDE Coaching Online (1:1) | FIDE Test Prep | Start French Now";
    const description = isFr
        ? "Préparez le test FIDE avec des cours privés personnalisés: scénarios actuels, plan ciblé, réservation flexible et suivi expert."
        : "Prepare for the FIDE test with private 1:1 coaching: current scenarios, targeted plan, flexible booking, and expert guidance.";

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
