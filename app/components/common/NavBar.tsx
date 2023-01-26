import { HiAcademicCap } from "react-icons/hi";
import { FaRegEnvelope } from "react-icons/fa";
import Burger from "./Burger";
import Link from "next/link";

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
        <div className="w-full bg-neutral-200 py-[20px] sm:py-[24px] md:py-[28px] lg:py-[34px]">
            <div className="max-w-[600px] md:max-w-[778px] mx-auto px-6 position-relative">
                <div className="nav shadow-1">
                    <Link href="/" className="flex items-center">
                        <HiAcademicCap className="text-[44.72px] sm:text-[46.8px] md:text-[52px] text-neutral-800" />
                    </Link>
                    <nav>
                        <ul className="header-nav-menu-list onNav">{links}</ul>
                    </nav>

                    <div className="flex items-center">
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
