import "@/app/styles/globals.css";
import { NextIntlClientProvider, useLocale } from "next-intl";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const locale = useLocale();
    return (
        <html>
            <head />
            <body>
                <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>
            </body>
        </html>
    );
}
