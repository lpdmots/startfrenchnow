import Navbar from "../components/common/NavBar";
import "../../styles/globals.css";
import Footer from "../components/common/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head />
            <body>
                <Navbar />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}
