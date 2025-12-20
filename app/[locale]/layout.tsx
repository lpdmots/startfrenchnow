import "@/app/styles/globals.css";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "@/app/components/ui/toaster";
import { Metadata } from "next";
import { locales, type Locale } from "@/i18n";
import { cookies } from "next/headers";
import Script from "next/script";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-poppins",
});

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
    if (!locales.includes(locale)) notFound();

    const baseUrl = new URL((process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, ""));

    return {
        metadataBase: baseUrl,
        title: "Start French Now",
        robots: { index: true, follow: true },
        themeColor: [
            { media: "(prefers-color-scheme: light)", color: "#ffffff" },
            { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
        ],
        icons: { icon: "/favicon.ico" },
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
                <Script src="/tarteaucitron/tarteaucitron.min.js" strategy="beforeInteractive" />
                <Script id="tac-init" strategy="beforeInteractive">
                    {`
                        tarteaucitron.init({
                            bodyPosition: "top",
                            orientation: "bottom",         
                            DenyAllCta: true,
                            AcceptAllCta: true,
                            highPrivacy: true,
                            showIcon: false,
                            showAlertSmall: false,
                            cookieslist: true,
                            googleConsentMode: true,
                            iconPosition: "BottomLeft",
                            removeCredit: true,
                            moreInfoLink: false,
                        });
                        tarteaucitron.user.gtagUa = "G-PPY9RQ1KFB";
                        (tarteaucitron.job = tarteaucitron.job || []).push("gtag");
                    `}
                </Script>
            </head>
            <body>
                <main id="root">
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Providers>{children}</Providers>
                    </NextIntlClientProvider>
                    <Toaster />
                </main>
            </body>
        </html>
    );
}
