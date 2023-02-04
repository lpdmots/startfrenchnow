import Navbar from "../components/common/NavBar";
import "../../styles/globals.css";
import Footer from "../components/common/Footer";
import { Poppins } from "@next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "300", "400", "700", "900"],
    variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${poppins.variable} font-sans`}>
            <head />
            <body>
                <Navbar />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}
