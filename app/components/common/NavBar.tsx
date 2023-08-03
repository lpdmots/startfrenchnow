import { FaRegEnvelope } from "react-icons/fa";
import Burger from "./Burger";
import Link from "next/link";
import DarkMode from "./DarkMode";
import Logo from "./logos/Logo";
import { LinkCurrent } from "./LinkCurrent";
import { ProfilButton } from "./ProfilButton";

function NavBar() {
    const links = (
        <>
            <li className="header-nav-list-item middle">
                <LinkCurrent href="/" className="nav-link header-nav-link">
                    Home
                </LinkCurrent>
            </li>
            <li className="header-nav-list-item middle">
                <LinkCurrent href="/stories" className="nav-link header-nav-link">
                    Stories
                </LinkCurrent>
            </li>
            <li className="header-nav-list-item middle">
                <LinkCurrent href="/blog" className="nav-link header-nav-link">
                    Blog
                </LinkCurrent>
            </li>
            <li className="header-nav-list-item middle">
                <LinkCurrent href="/about" className="nav-link header-nav-link">
                    About
                </LinkCurrent>
            </li>
        </>
    );

    return (
        <div className="w-full bg-neutral-200 py-5 sm:py-6 md:py-7 lg:py-8">
            <div className="nav-width mx-auto px-6 position-relative">
                <div className="nav shadow-1">
                    <Link aria-label="Go to Homepage" href="/" className="flex items-center">
                        <Logo className={"h-8 md:h-10"} />
                    </Link>
                    <nav>
                        <ul className="header-nav-menu-list onNav">{links}</ul>
                    </nav>

                    <div className="flex items-center gap-2">
                        <DarkMode />
                        <ProfilButton />
                        <Link aria-label="Go to contact page" href="/contact" className="btn-primary small header-btn-hidde-on-mb flex items-center !p-2 !mr-2 lg:!mr-0">
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
