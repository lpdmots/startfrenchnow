import { FaRegEnvelope } from "react-icons/fa";
import Burger from "./Burger";
import Link from "next-intl/link";
import DarkMode from "./DarkMode";
import Logo from "./logos/Logo";
import { LinkCurrent } from "./LinkCurrent";
import { ProfilButton } from "../auth/ProfilButton";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n"; /* 
import { LearnButton } from "./LearnButton"; */
import { CoursesButton } from "./CoursesButton";

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
        coursesTitle: t("courses.coursesTitle"),
        button: t("courses.button"),
        beginners: t("courses.beginners"),
        intermediates: t("courses.intermediates"),
        dialogues: t("courses.dialogues"),
        pastTenses: t("courses.pastTenses"),
    };

    const links = (
        <>
            {/* <li className="header-nav-list-item middle !px-0">
                <LinkCurrent href="/" className="nav-link header-nav-link">
                    {t("home")}
                </LinkCurrent>
            </li> */}
            <li className="header-nav-list-item middle !px-0">
                <CoursesButton locale={locale as Locale} dictionnary={coursesDict} />
            </li>

            <li className="header-nav-list-item middle !px-0">
                <LinkCurrent href="/videos" className="nav-link header-nav-link">
                    {t("videos")}
                </LinkCurrent>
            </li>
            <li className="header-nav-list-item middle !px-0">
                <LinkCurrent href="/blog" className="nav-link header-nav-link">
                    {t("learn.button")}
                </LinkCurrent>
                {/* <LearnButton locale={locale as Locale} dictionnary={learnDict} /> */}
            </li>
            <li className="header-nav-list-item middle !px-0">
                <LinkCurrent href="/stories" className="nav-link header-nav-link">
                    {t("stories")}
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
                        <Burger
                            messages={{ home: t("home"), ...learnDict, ...coursesDict, about: t("about"), contact: t("contact"), stories: t("stories"), learn: t("learn.button") }}
                            locale={locale as Locale}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
