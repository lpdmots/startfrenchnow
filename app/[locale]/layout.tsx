import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@/app/styles/globals.css";
import Providers from "./providers";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "@/app/components/ui/toaster";
import ClientBoot from "@/app/components/common/ClientBoot";
import { Metadata, Viewport } from "next";
import { locales, normalizeLocale } from "@/i18n";
import enMessages from "@/app/dictionaries/en.json";
import frMessages from "@/app/dictionaries/fr.json";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    if (!locales.includes(locale)) notFound();

    const baseUrl = new URL((process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, ""));

    return {
        metadataBase: baseUrl,
        title: "Start French Now",
        robots: { index: true, follow: true },
        icons: { icon: "/favicon.ico" },
    };
}

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
    ],
};

export const dynamicParams = false;

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    const { children } = props;

    if (!GTM_ID) {
        throw new Error("Missing NEXT_PUBLIC_GTM_ID in .env.local");
    }
    if (!locales.includes(locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = locale === "fr" ? frMessages : enMessages;

    return (
        <html lang={locale} dir="ltr" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning className="font-sans">
            <head>
                <meta name="color-scheme" content="light dark" />
            </head>
            <body>
                <ClientBoot gtmId={GTM_ID} clarityId={CLARITY_ID} />
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
