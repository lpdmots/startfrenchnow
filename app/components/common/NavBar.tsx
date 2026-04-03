import { FaRegEnvelope } from "react-icons/fa";
import Burger from "./Burger";
import Link from "next-intl/link";
import DarkMode from "./DarkMode";
import Logo from "./logos/Logo";
import { ProfilButton } from "../auth/ProfilButton";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n";
import { CoursesButton } from "./CoursesButton";
import { ResourcesButton } from "./ResourcesButton";
import { FideButton } from "./FideButton";
import NotificationsMenuServer from "../notifications/NotificationsMenuServer";
import { NavMenuLink } from "./NavMenuLink";

function NavBar() {
    const t = useTranslations("Navigation");
    const locale = useLocale();

    const learnDict = {
        blog: t("learn.blog"),
        vocabulary: t("learn.vocabulary"),
        button: t("learn.button"),
        videos: t("learn.videos"),
        grammar: t("learn.grammar"),
        expressions: t("learn.expressions"),
        culture: t("learn.culture"),
        orthography: t("learn.orthography"),
        tips: t("learn.tips"),
        stories: t("learn.stories"),
    };

    const coursesDict = {
        dashboard: t("courses.dashboard"),
        coursesTitle: t("courses.coursesTitle"),
        button: t("courses.button"),
        beginners: t("courses.beginners"),
        intermediates: t("courses.intermediates"),
        dialogues: t("courses.dialogues"),
        pastTenses: t("courses.pastTenses"),
    };

    const resourcesDict = {
        resourcesTitle: t("resources.resourcesTitle"),
        button: t("resources.button"),
        videos: t("resources.videos"),
        blog: t("resources.blog"),
        exercises: t("resources.exercises"),
        stories: t("resources.stories"),
        testYourLevel: t("resources.testYourLevel"),
    };

    const links = (
        <>
            <li className="header-nav-list-item middle !px-0">
                <NavMenuLink href="/fide" activeMatch={["/fide"]} locale={locale as Locale}>
                    <FideButton locale={locale as Locale} />
                </NavMenuLink>
            </li>
            <li className="header-nav-list-item middle !px-0">
                <NavMenuLink href="/courses/beginners" activeMatch={["/courses"]} locale={locale as Locale}>
                    <CoursesButton locale={locale as Locale} dictionnary={coursesDict} />
                </NavMenuLink>
            </li>
            <li className="header-nav-list-item middle !px-0">
                <NavMenuLink
                    href="/blog"
                    activeMatch={["/blog", "/videos", "/exercises", "/stories", "/test-your-level"]}
                    locale={locale as Locale}
                >
                    <ResourcesButton locale={locale as Locale} dictionnary={resourcesDict} />
                </NavMenuLink>
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
                        <ul className="onNav z-[1] mb-0 hidden list-none items-center justify-end pl-0 lg:flex">{links}</ul>
                    </nav>
                    <div className="flex items-center gap-2">
                        <NotificationsMenuServer locale={locale as Locale} />
                        <LocaleSwitcher locale={locale as Locale} />
                        <DarkMode />
                        <ProfilButton profil={t("profil")} logout={t("logout")} />
                        <Link aria-label="Go to contact page" href="/contact" className="btn-primary small p-[13px] rounded-[12px] text-[24px] leading-[24px] font-normal max-[991px]:mr-[24px] max-[991px]:ml-0 max-[767px]:hidden max-[479px]:mr-[12px] flex items-center !p-2 !mr-2 lg:!mr-0">
                            <FaRegEnvelope style={{ fontSize: 22 }} />
                        </Link>
                        <Burger messages={{ home: t("home"), learnDict, coursesDict, about: t("about"), contact: t("contact"), resourcesDict, fide: t("fideLong") }} locale={locale as Locale} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
