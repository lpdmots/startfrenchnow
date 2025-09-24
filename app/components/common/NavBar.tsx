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
import { ResourcesButton } from "./ResourcesButton";
import { FideButton } from "./FideButton";

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
                <CoursesButton locale={locale as Locale} dictionnary={coursesDict} />
            </li>
            <Link href="/fide" className="!no-underline !text-neutral-700">
                <li className="header-nav-list-item middle !px-0">
                    <FideButton locale={locale as Locale} />
                </li>
            </Link>
            <Link href="/blog" className="!no-underline !text-neutral-700">
                <li className="header-nav-list-item middle !px-0">
                    <ResourcesButton locale={locale as Locale} dictionnary={resourcesDict} />
                </li>
            </Link>
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
                        <ProfilButton profil={t("profil")} logout={t("logout")} />
                        <Link aria-label="Go to contact page" href="/contact" className="btn-primary small header-btn-hidde-on-mb flex items-center !p-2 !mr-2 lg:!mr-0">
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
