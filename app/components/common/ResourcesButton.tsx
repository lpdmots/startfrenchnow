"use client";
import { useTranslations } from "next-intl";
import DropdownMenu from "./DropdownMenu";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import { Locale } from "@/i18n";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";

export const ResourcesButton = ({ locale }: { locale: Locale }) => {
    const t = useTranslations("Navigation");

    const dropdownLearn = {
        content: (
            <div className="card p-4 pr-12 mt-4">
                <div className="flex flex-col" style={{ minWidth: 125 }}>
                    <LinkCurrentBlog href="/fide/videos" className="nav-link header-nav-link nav-link-fide current-fide p-1 m-0 font-medium pl-8 flex items-center" locale={locale as Locale}>
                        <FaCaretRight />
                        {t("fideMenu.videos")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/fide/exams" className="nav-link header-nav-link nav-link-fide current-fide p-1 m-0 font-medium pl-8 flex items-center" locale={locale as Locale}>
                        <FaCaretRight />
                        {t("fideMenu.scenarios")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/videos" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center" locale={locale as Locale}>
                        <FaCaretRight />
                        {t("coursesResourcesMenu.allVideos")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/blog" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {t("coursesResourcesMenu.blog")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/exercises" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {t("coursesResourcesMenu.exercises")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/stories" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {t("coursesResourcesMenu.interactiveStories")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/test-your-level" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {t("fideMenu.testYourLevel")}
                    </LinkCurrentBlog>
                </div>
            </div>
        ),
        button: (
            <div className="font-bold flex items-center p-5">
                {t("resources.button")}
                <FaCaretDown className="ml-1" />
            </div>
        ),
    };

    return (
        <DropdownMenu content={dropdownLearn.content}>
            <div>{dropdownLearn.button}</div>
        </DropdownMenu>
    );
};
