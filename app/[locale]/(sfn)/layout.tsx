import Navbar from "@/app/components/common/NavBar";
import Footer from "@/app/components/common/Footer";
import ScrollToTopButton from "@/app/components/common/ScrollToTopButton";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="pt-2">
                <Navbar />
            </div>
            <div>{children}</div>
            <Footer />
            <ScrollToTopButton />
        </div>
    );
}
