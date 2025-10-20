"use client";
import React, { useState, useRef, useEffect } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import { usePathname } from "next-intl/client";
import Link from "next-intl/link";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import { FaCaretRight, FaLock } from "react-icons/fa";
import { Locale } from "@/i18n";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useSession } from "next-auth/react";

const Burger = ({ messages, locale }: { messages: any; locale: Locale }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLElement | null>(null);
    const pathname = usePathname();
    const t = useTranslations("Navigation.fideButton");

    const { data: session } = useSession();
    const [hasDashboardAccess, setHasDashboardAccess] = useState<boolean>(false);

    useEffect(() => {
        if (session) {
            const hasAccess = session.user?.permissions?.some((p) => p.referenceKey === "pack_fide") || session.user?.lessons?.some((l) => l.eventType === "Fide Preparation Class");
            setHasDashboardAccess(!!hasAccess);
        }
    }, [session]);

    useOutsideClick(ref, () => {
        setOpen(false);
    });

    return (
        <>
            <Animation open={open} onClick={() => setOpen(!open)} />

            <div
                ref={ref as React.RefObject<HTMLDivElement>}
                style={open ? { height: ref?.current?.scrollHeight + "px", zIndex: 1000, top: "90px" } : { height: "0px", zIndex: 1000, top: "90px" }}
                className="w-screen nav-width mx-auto px-6 absolute right-0 collapse-parent"
            >
                <div className="nav burgerCollapse w-full sm:w-none mb-0 flex flex-col items-start">
                    <ul className="flex-col !items-start list-none pl-0 sm:pl-2 w-full">
                        <li onClick={() => setOpen(false)} className="header-nav-list-item middle !mb-0">
                            <LinkCurrentBlog href="/fide" className={`nav-link header-nav-link !p-2 ${pathname === "/fide" && "current"}`} locale={locale}>
                                {t("buttonLabel")}
                            </LinkCurrentBlog>
                        </li>
                        <div className="grid grid-cols-2 w-full">
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/fide" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0" locale={locale as Locale}>
                                    <FaCaretRight />
                                    {t("fide")}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/fide/pack-fide" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0" locale={locale as Locale}>
                                    <FaCaretRight />
                                    {t("packFide")}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog
                                    href={hasDashboardAccess ? "/fide/dashboard" : "#"}
                                    className={clsx(
                                        "nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0",
                                        !hasDashboardAccess && "opacity-50 cursor-not-allowed hover:text-neutral-600"
                                    )}
                                    locale={locale as Locale}
                                >
                                    {hasDashboardAccess ? <FaCaretRight /> : <FaLock className="mr-2" />}
                                    {t("dashboard")}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog
                                    href="/fide/videos"
                                    withParams="fide-videos"
                                    className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 "
                                    locale={locale as Locale}
                                >
                                    <FaCaretRight />
                                    {t("videos")}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog
                                    href="/fide/exams"
                                    withParams="fide-exams"
                                    className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 "
                                    locale={locale as Locale}
                                >
                                    <FaCaretRight />
                                    {t("exams")}
                                </LinkCurrentBlog>
                            </div>
                        </div>
                        <div className="p-2 font-bold">{messages.coursesDict.coursesTitle}</div>
                        <div className="grid grid-cols-2 w-full">
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/courses/beginners" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0" locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.coursesDict.beginners}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/courses/intermediates" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center  pl-0" locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.coursesDict.intermediates}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/courses/dialogues" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 " locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.coursesDict.dialogues}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/courses/past-tenses" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 " locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.coursesDict.pastTenses}
                                </LinkCurrentBlog>
                            </div>
                        </div>
                        <li onClick={() => setOpen(false)} className="header-nav-list-item middle !mb-0">
                            <LinkCurrentBlog href="/blog" className={`nav-link header-nav-link !p-2 ${pathname === "/blog" && "current"}`} locale={locale}>
                                {messages.resourcesDict.resourcesTitle}
                            </LinkCurrentBlog>
                        </li>
                        <div className="flex flex-col w-full">
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/videos" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center  pl-0" locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.resourcesDict.videos}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/blog" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0" locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.resourcesDict.blog}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/exercises" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 " locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.resourcesDict.exercises}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/stories" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 " locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.resourcesDict.stories}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/test-your-level" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 " locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.resourcesDict.testYourLevel}
                                </LinkCurrentBlog>
                            </div>
                        </div>
                        <li className="header-nav-list-item middle !mb-0" onClick={() => setOpen(false)}>
                            <Link href="/about" className={`nav-link header-nav-link !p-2 ${pathname === "/about" && "current"}`} onClick={() => setOpen(false)}>
                                {messages.about}
                            </Link>
                        </li>
                        <li className="header-nav-list-item middle !mb-0" onClick={() => setOpen(false)}>
                            <Link href="/contact" className={`nav-link header-nav-link !p-2 ${pathname === "/contact" && "current"}`} onClick={() => setOpen(false)}>
                                {messages.contact}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Burger;

const Animation = ({ open, onClick }: { open: boolean; onClick: any }) => {
    return (
        <div
            className="flex lg:hidden"
            style={{
                width: "2.3rem",
                height: "2.3rem",
                cursor: "pointer",
                flexDirection: "column",
                justifyContent: "space-around",
            }}
            onClick={onClick}
        >
            <div
                style={{
                    width: "2.3rem",
                    height: "3px",
                    backgroundColor: "var(--neutral-800)",
                    borderRadius: "10px",
                    transformOrigin: "1px",
                    transition: "all 0.2s linear",
                    transform: open ? "rotate(45deg)" : "rotate(0)",
                }}
            />
            <div
                style={{
                    width: "2.3rem",
                    height: "3px",
                    backgroundColor: "var(--neutral-800)",
                    borderRadius: "10px",
                    transformOrigin: "1px",
                    transition: "all 0.2s linear",
                    opacity: open ? 0 : 1,
                }}
            />
            <div
                style={{
                    width: "2.3rem",
                    height: "3px",
                    backgroundColor: "var(--neutral-800)",
                    borderRadius: "10px",
                    transformOrigin: "1px",
                    transition: "all 0.2s linear",
                    transform: open ? "rotate(-45deg)" : "rotate(0)",
                }}
            />
        </div>
    );
};
