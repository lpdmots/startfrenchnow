"use client";
import DropdownMenu from "./DropdownMenu";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import { Locale } from "@/i18n";
import { FaCaretDown, FaCaretRight, FaPenFancy } from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";

export const CoursesButton = ({ locale, dictionnary }: { locale: Locale; dictionnary: any }) => {
    const dropdownLearn = {
        content: (
            <div className="card p-4 pr-12 mt-4">
                <div className="flex flex-col" style={{ minWidth: 125 }}>
                    <LinkCurrentBlog href="/courses/beginners" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center" locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.beginners}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/courses/intermediates" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.intermediates}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/courses/dialogues" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.dialogues}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/courses/past-tenses" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.pastTenses}
                    </LinkCurrentBlog>
                </div>
            </div>
        ),
        button: (
            <div className="font-bold flex items-center p-5">
                {dictionnary.button}
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
