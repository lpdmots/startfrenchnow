import "@/app/styles/globals.css";
import { poppins } from "@/app/fonts";
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
import AcquisitionCapture from "@/app/components/common/AcquisitionCapture";
import { pickClientMessages } from "@/app/lib/i18n/clientMessages.mjs";
import { buildSiteEntityGraph, serializeJsonLd } from "@/app/lib/seo/entityGraph.mjs";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://startfrenchnow.ch").replace(/\/$/, "");

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    if (!locales.includes(locale)) notFound();

    const baseUrl = new URL((process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://startfrenchnow.ch").replace(/\/$/, ""));

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
    const clientMessages = pickClientMessages(messages);
    const siteEntityGraph = buildSiteEntityGraph({ locale, siteUrl: SITE });

    return (
        <html lang={locale} dir="ltr" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning className={`${poppins.variable} font-sans antialiased`}>
            <head>
                <meta name="color-scheme" content="light dark" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteEntityGraph) }} />
            </head>
            <body>
                <ClientBoot gtmId={GTM_ID} clarityId={CLARITY_ID} />
                <AcquisitionCapture />
                <main id="root">
                    <NextIntlClientProvider locale={locale} messages={clientMessages}>
                        <Providers>{children}</Providers>
                    </NextIntlClientProvider>
                    <Toaster />
                </main>
            </body>
        </html>
    );
}
