"use client";
import React, { useState, useRef } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import { usePathname } from "next-intl/client";
import Link from "next-intl/link";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import { FaCaretRight } from "react-icons/fa";
import { Locale } from "@/i18n";

const Burger = ({ messages, locale }: { messages: any; locale: Locale }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLElement | null>(null);
    const pathname = usePathname();

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
                        <div onClick={() => setOpen(false)} className="p-2 font-bold">
                            {messages.coursesTitle}
                        </div>
                        <div className="grid grid-cols-2 w-full">
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/courses/beginners" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0" locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.beginners}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/courses/intermediates" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center  pl-0" locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.intermediates}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/courses/dialogues" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 " locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.dialogues}
                                </LinkCurrentBlog>
                            </div>
                            <div onClick={() => setOpen(false)}>
                                <LinkCurrentBlog href="/courses/past-tenses" className="nav-link header-nav-link p-1 m-0 font-medium sm:pl-8 bs flex items-center pl-0 " locale={locale as Locale}>
                                    <FaCaretRight />
                                    {messages.pastTenses}
                                </LinkCurrentBlog>
                            </div>
                        </div>
                        <li className="header-nav-list-item middle !mb-0">
                            <LinkCurrentBlog href="/videos" className={`nav-link header-nav-link !p-2 ${pathname === "/stories" && "current"}`} locale={locale}>
                                {messages.videos}
                            </LinkCurrentBlog>
                        </li>
                        <div onClick={() => setOpen(false)}>
                            <LinkCurrentBlog href="/blog" className="nav-link header-nav-link p-2 m-0 flex items-center" locale={locale as Locale}>
                                {messages.learn}
                            </LinkCurrentBlog>
                        </div>
                        <li className="header-nav-list-item middle !mb-0">
                            <Link href="/stories" className={`nav-link header-nav-link !p-2 ${pathname === "/stories" && "current"}`} onClick={() => setOpen(false)}>
                                {messages.stories}
                            </Link>
                        </li>
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
