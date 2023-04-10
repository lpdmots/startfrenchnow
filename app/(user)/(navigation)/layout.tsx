import Navbar from "../../components/common/NavBar";
import Footer from "../../components/common/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <div>{children}</div>
            <Footer />
        </div>
    );
}
