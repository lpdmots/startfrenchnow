import Navbar from "@/app/components/common/NavBar";
import Footer from "@/app/components/common/Footer";
import { normalizeLocale } from "@/i18n";
import { setRequestLocale } from "next-intl/server";

export default async function RootLayout(props: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    setRequestLocale(locale);

    const { children } = props;
    return (
        <div>
            <div className="pt-2">
                <Navbar />
            </div>
            <div>{children}</div>
            <Footer />
        </div>
    );
}
