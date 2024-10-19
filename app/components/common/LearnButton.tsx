"use client";
import DropdownMenu from "./DropdownMenu";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import { Locale } from "@/i18n";
import { FaCaretDown, FaCaretRight, FaPenFancy } from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";
import { GiSpellBook } from "react-icons/gi";
import { CATEGORIES } from "@/app/lib/constantes";

export const LearnButton = ({ locale, dictionnary }: { locale: Locale; dictionnary: any }) => {
    const dropdownLearn = {
        content: (
            <div className="card p-4 pr-12 mt-4">
                <div className="flex flex-col" style={{ minWidth: 125 }}>
                    <LinkCurrentBlog href="/blog" className="nav-link header-nav-link p-2 m-0 flex items-center" locale={locale as Locale}>
                        <FaPenFancy className="mr-2" />
                        {dictionnary.blog}
                    </LinkCurrentBlog>
                    {CATEGORIES}
                    <LinkCurrentBlog href="/blog/category/tips" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center" locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.tips}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/blog/category/vocabulary" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.vocabulary}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/blog/category/grammar" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.grammar}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/blog/category/orthography" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.orthography}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/blog/category/culture" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.culture}
                    </LinkCurrentBlog>
                    <LinkCurrentBlog href="/blog/category/expressions" className="nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center " locale={locale as Locale}>
                        <FaCaretRight />
                        {dictionnary.expressions}
                    </LinkCurrentBlog>
                </div>
                <LinkCurrentBlog href="/videos" className="nav-link header-nav-link p-2 m-0 flex items-center" locale={locale as Locale}>
                    <MdVideoLibrary className="mr-2" />
                    {dictionnary.videos}
                </LinkCurrentBlog>
                <LinkCurrentBlog href="/stories" className="nav-link header-nav-link p-2 m-0 flex items-center" locale={locale as Locale}>
                    <GiSpellBook className="mr-2" />
                    {dictionnary.stories}
                </LinkCurrentBlog>
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
