"use client";
import { useTranslations } from "next-intl";
import DropdownMenu from "./DropdownMenu";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import { Locale } from "@/i18n";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";

export const FideButton = ({ locale }: { locale: Locale }) => {
    const t = useTranslations("Navigation.fideButton");

    const dropdownLearn = {
        content: (
            <div className="card p-4 pr-12 mt-4">
                <div className="flex flex-col" style={{ minWidth: 125 }}>
                    <LinkCurrentBlog href="/fide" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center" locale={locale as Locale}>
                        <FaCaretRight />
                        {t("fide")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/fide/pack-fide" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {t("packFide")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/fide/dashboard" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {t("dashboard")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/fide/videos" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {t("videos")}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/fide/exams" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {t("exams")}
                    </LinkCurrentBlog>
                </div>
            </div>
        ),
        button: (
            <div className="font-bold flex items-center p-5">
                {t("buttonLabel")}
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
