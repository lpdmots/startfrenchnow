import { FaRegEnvelope } from "react-icons/fa";
import Burger from "./Burger";
import Link from "next-intl/link";
import DarkMode from "./DarkMode";
import Logo from "./logos/Logo";
import { LinkCurrent } from "./LinkCurrent";
import { ProfilButton } from "../auth/ProfilButton";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n";
import { LinkCurrentBlog } from "./LinkCurrentBlog";

function NavBar() {
    const t = useTranslations("Navigation");
    const locale = useLocale();
    const links = (
        <>
            <li className="header-nav-list-item middle">
                <LinkCurrent href="/" className="nav-link header-nav-link">
                    {t("home")}
                </LinkCurrent>
            </li>
            <li className="header-nav-list-item middle">
                <LinkCurrent href="/stories" className="nav-link header-nav-link">
                    {t("stories")}
                </LinkCurrent>
            </li>
            <li className="header-nav-list-item middle">
                <LinkCurrentBlog href="/blog" className="nav-link header-nav-link" locale={locale as Locale}>
                    {t("blog")}
                </LinkCurrentBlog>
            </li>
            <li className="header-nav-list-item middle">
                <LinkCurrent href="/about" className="nav-link header-nav-link">
                    {t("about")}
                </LinkCurrent>
            </li>
        </>
    );

    return (
        <div className="w-full bg-neutral-200 sm:py-6 md:py-7 lg:py-8">
            <div className="mx-auto px-6 position-relative" style={{ maxWidth: 1000 }}>
                <div className="nav shadow-1">
                    <Link aria-label="Go to Homepage" href="/" className="flex items-center">
                        <Logo className={"h-8 md:h-10"} />
                    </Link>
                    <nav>
                        <ul className="header-nav-menu-list onNav">{links}</ul>
                    </nav>

                    <div className="flex items-center gap-2">
                        <LocaleSwitcher locale={locale as Locale} />
                        <DarkMode />
                        <ProfilButton contact={t("contact")} logout={t("logout")} />
                        <Link aria-label="Go to contact page" href="/contact" className="btn-primary small header-btn-hidde-on-mb flex items-center !p-2 !mr-2 lg:!mr-0">
                            <FaRegEnvelope style={{ fontSize: 22 }} />
                        </Link>
                        <Burger messages={{ home: t("home"), stories: t("stories"), blog: t("blog"), about: t("about"), contact: t("contact") }} locale={locale} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
