import Navbar from "../components/common/NavBar";
import "../../styles/globals.css";
import Footer from "../components/common/Footer";
import { Poppins } from "next/font/google";
import GoogleAnalytics from "../components/common/Analytics/GoogleAnalytics";
import { AnalyticsWrapper } from "../components/common/Analytics/Analytics";
import type { Metadata } from "next";
import LazyM from "../components/animations/LazyM";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "300", "400", "700", "900"],
    variable: "--font-poppins",
});

export const metadata: Metadata = {
    title: "Learn French at Your Own Pace with Expert-led Video Lessons",
    description:
        "Improve your French language skills with our comprehensive video lessons. We propose a convenient, serious and fun way to learn French as a foreign language and achieve fluency. Start french now!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${poppins.variable} font-sans`}>
            <head />
            <body>
                <AnalyticsWrapper />
                <LazyM>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                </LazyM>

                <GoogleAnalytics />
            </body>
        </html>
    );
}
