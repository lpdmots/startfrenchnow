import { FaRegEnvelope } from "react-icons/fa";
import Burger from "./Burger";
import { Link } from "@/i18n/navigation";
import DarkMode from "./DarkMode";
import { ProfilButton } from "../auth/ProfilButton";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n";
import NotificationsMenuServer from "../notifications/NotificationsMenuServer";
import Image from "next/image";
import { PrimaryNavItem } from "./PrimaryNavItem";
import { getPrimaryNavigation } from "./siteNavigation";

function NavBar() {
    const t = useTranslations("Navigation");
    const locale = useLocale();
    const navigationItems = getPrimaryNavigation(t);

    const links = (
        <>
            {navigationItems.map((item) => (
                <li key={item.key} className="header-nav-list-item middle !px-0">
                    <PrimaryNavItem item={item} locale={locale as Locale} />
                </li>
            ))}
        </>
    );

    return (
        <div className="w-full bg-neutral-200 sm:py-6 md:py-7 lg:py-8">
            <div className="position-relative mx-auto w-full max-w-[1180px] px-3 sm:px-4 lg:px-6">
                <div className="nav shadow-1 w-full min-w-0 gap-2 lg:gap-3">
                    <Link aria-label="Go to Homepage" href="/" className="flex shrink-0 items-center">
                        {/* <Logo className={"h-8 md:h-10"} /> */}
                        <Image src="/images/logo.png" alt="Start French Now logo" width={150} height={150} className="h-9 w-auto md:h-10 xl:h-12" />
                    </Link>
                    <nav className="min-w-0 flex-1">
                        <ul className="onNav z-[1] mb-0 hidden list-none items-center justify-center gap-0 pl-0 lg:flex xl:gap-1">{links}</ul>
                    </nav>
                    <div className="flex shrink-0 items-center gap-1 lg:gap-1.5">
                        <NotificationsMenuServer locale={locale as Locale} />
                        <LocaleSwitcher locale={locale as Locale} />
                        <DarkMode />
                        <ProfilButton logout={t("logout")} />
                        <Link
                            aria-label="Go to contact page"
                            href="/contact"
                            className="btn-primary small rounded-[12px] text-[24px] leading-[24px] font-normal max-[991px]:mr-[24px] max-[991px]:ml-0 max-[479px]:mr-[12px] flex items-center !p-2 !mr-1 lg:!mr-0"
                        >
                            <FaRegEnvelope style={{ fontSize: 22 }} />
                        </Link>
                        <Burger locale={locale as Locale} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
