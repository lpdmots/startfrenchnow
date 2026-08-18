import { Mail } from "lucide-react";
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
                    <PrimaryNavItem item={item} />
                </li>
            ))}
        </>
    );

    return (
        <div className="w-full bg-neutral-200 sm:py-6 md:py-7 lg:py-8">
            <div className="position-relative mx-auto w-full max-w-[1180px] px-3 sm:px-4 lg:px-6">
                <div className="nav shadow-1 w-full min-w-0 gap-2 lg:gap-3">
                    <Link aria-label={t("home")} href="/" className="flex shrink-0 items-center">
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
                            aria-label={t("contact_us")}
                            href="/contact"
                            className="btn-primary small inline-flex !size-11 !w-11 shrink-0 items-center justify-center rounded-xl !p-0 font-normal max-[991px]:mr-6 max-[479px]:mr-3 lg:!mr-0"
                        >
                            <Mail aria-hidden="true" className="size-[22px]" strokeWidth={2} />
                        </Link>
                        <Burger />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
