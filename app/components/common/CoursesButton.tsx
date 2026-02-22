"use client";
import { COURSES_PACKAGES_KEYS } from "@/app/lib/constantes";
import DropdownMenu from "./DropdownMenu";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import { Locale } from "@/i18n";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaCaretDown, FaCaretRight, FaLock } from "react-icons/fa";

export const CoursesButton = ({ locale, dictionnary }: { locale: Locale; dictionnary: any }) => {
    const { data: session } = useSession();
    const [hasDashboardFrAccess, setHasDashboardFrAccess] = useState<boolean>(false);

    useEffect(() => {
        if (session) {
            const hasAccess = session.user?.permissions?.some((p) => COURSES_PACKAGES_KEYS.includes(p.referenceKey as any));
            setHasDashboardFrAccess(!!hasAccess);
        }
    }, [session]);

    const dropdownLearn = {
        content: (
            <div className="card p-4 pr-12 mt-4">
                <div className="flex flex-col" style={{ minWidth: 125 }}>
                    <LinkCurrentBlog
                        href={hasDashboardFrAccess ? "/courses/dashboard" : "#"}
                        className={clsx("nav-link header-nav-link p-1 m-0 font-medium pl-8 flex items-center", !hasDashboardFrAccess && "opacity-50 cursor-not-allowed hover:text-neutral-600")}
                        locale={locale as Locale}
                    >
                        {hasDashboardFrAccess ? <FaCaretRight /> : <FaLock className="mr-2" />}
                        {dictionnary.dashboard}
                    </LinkCurrentBlog>
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
