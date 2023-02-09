import { HiAcademicCap } from "react-icons/hi";
import { FaRegEnvelope } from "react-icons/fa";
import Burger from "./Burger";
import Link from "next/link";
import DarkMode from "./DarkMode";
import Image from "next/image";
import Logo from "./Logo";

function NavBar() {
    const links = (
        <>
            <li className="header-nav-list-item middle">
                <Link href="/" className="nav-link header-nav-link">
                    Home
                </Link>
            </li>
            <li className="header-nav-list-item middle">
                <Link href="/blog" className="nav-link header-nav-link">
                    Blog
                </Link>
            </li>
            <li className="header-nav-list-item middle">
                <Link href="/about" className="nav-link header-nav-link">
                    About
                </Link>
            </li>
        </>
    );

    return (
        <div className="w-full bg-neutral-200 py-5 sm:py-6 md:py-7 lg:py-8">
            <div className="nav-width mx-auto px-6 position-relative">
                <div className="nav shadow-1">
                    <Link href="/" className="flex items-center">
                        <Logo height={45} width={70} />
                    </Link>
                    <nav>
                        <ul className="header-nav-menu-list onNav">{links}</ul>
                    </nav>

                    <div className="flex items-center">
                        <DarkMode />
                        <Link href="/contact" className="btn-primary small header-btn-hidde-on-mb flex items-center">
                            <FaRegEnvelope style={{ fontSize: 22 }} />
                        </Link>

                        <Burger />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
