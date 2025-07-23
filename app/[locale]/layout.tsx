import "@/app/styles/globals.css";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import { useLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Locale } from "@/i18n";
import { getTranslator } from "next-intl/server";
import { Toaster } from "@/app/components/ui/toaster";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-poppins",
});

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.Home");

    return {
        title: t("title"),
        description: t("description"),
    };
}

/* export async function generateStaticParams() {
    return ["en", "de"].map((locale) => ({ locale }));
} */

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: Locale } }) {
    const locale = useLocale();

    // Show a 404 error if the user requests an unknown locale
    if (params.locale !== locale) {
        notFound();
    }
    return (
        <html lang={locale} className={`${poppins.variable} font-sans`}>
            <head />
            <body>
                <div id="root">
                    <Providers>{children}</Providers>
                    <Toaster />
                </div>
            </body>
        </html>
    );
}
