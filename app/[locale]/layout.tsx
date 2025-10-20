import "@/app/styles/globals.css";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslator } from "next-intl/server";
import { Toaster } from "@/app/components/ui/toaster";
import { Metadata } from "next";
import { locales, type Locale } from "@/i18n";
import { cookies } from "next/headers"; // ← Solution B: lecture du cookie côté serveur

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-poppins",
});

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
    if (!locales.includes(locale)) notFound();
    const t = await getTranslator(locale, "Metadata.Home");

    const baseUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL!);
    const languages: Record<string, string> = {
        en: `${baseUrl}/en`,
        fr: `${baseUrl}/fr`,
        "x-default": `${baseUrl}/en`,
    };

    return {
        metadataBase: baseUrl,
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: locale === "fr" ? "/fr" : "/en",
            languages,
        },
        /* openGraph: {
        type: "website",
        url: locale === "fr" ? "/fr" : "/en",
        title: t("title"),
        description: t("description"),
        siteName: "Start French Now",
        locale: locale === "fr" ? "fr_FR" : "en_US",
        alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
        images: [{ url: "/og/home.jpg" }],
      },
      twitter: {
        card: "summary_large_image",
        title: t("title"),
        description: t("description"),
        images: ["/og/home.jpg"],
        creator: "@startfrenchnow",
      }, */
        robots: { index: true, follow: true },
        viewport: "width=device-width, initial-scale=1",
        themeColor: [
            { media: "(prefers-color-scheme: light)", color: "#ffffff" },
            { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
        ],
        icons: { icon: "/favicon.ico" /* apple: "/apple-touch-icon.png" */ },
    };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: Locale } }) {
    const { locale } = params;

    // Show a 404 error if the user requests an unknown locale
    if (params.locale !== locale) {
        notFound();
    }

    // Applique le thème dès le rendu serveur
    const cookieTheme = cookies().get("sfn-theme")?.value;
    const ssrTheme = cookieTheme === "dark" ? "dark" : "light";

    let messages;
    try {
        messages = (await import(`@/app/dictionaries/${locale}.json`)).default;
    } catch {
        notFound();
    }

    return (
        <html lang={locale} dir="ltr" data-theme={ssrTheme} suppressHydrationWarning className={`${poppins.variable} font-sans`}>
            <head>
                <meta name="color-scheme" content="light dark" />
            </head>
            <body>
                <div id="root">
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Providers>{children}</Providers>
                    </NextIntlClientProvider>
                    <Toaster />
                </div>
            </body>
        </html>
    );
}
