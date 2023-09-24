"use client";
import React, { useState, useRef } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import { usePathname } from "next-intl/client";
import Link from "next-intl/link";
import { LinkBlog } from "../sfn/blog/LinkBlog";
import { Locale } from "next-intl";

const Burger = ({ messages, locale }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const pathname = usePathname();

    useOutsideClick(ref, () => {
        setOpen(false);
    });

    return (
        <>
            <Animation open={open} onClick={() => setOpen(!open)} />

            <div
                ref={ref}
                style={open ? { height: ref.current.scrollHeight + "px", zIndex: 1000 } : { height: "0px", zIndex: 1000 }}
                className="w-screen nav-width mx-auto px-6 absolute right-0 nav-collapse-top collapse-parent"
            >
                <div className="nav burgerCollapse w-full mb-0 flex flex-col items-start py-6">
                    <ul className="flex-col gap-5 !items-start list-none">
                        <li className="header-nav-list-item middle">
                            <Link href="/" className={`nav-link header-nav-link ${pathname === "/" && "current"}`} onClick={() => setOpen(false)}>
                                {messages.home}
                            </Link>
                        </li>
                        <li className="header-nav-list-item middle">
                            <Link href="/stories" className={`nav-link header-nav-link ${pathname === "/stories" && "current"}`} onClick={() => setOpen(false)}>
                                {messages.stories}
                            </Link>
                        </li>
                        <li className="header-nav-list-item middle" onClick={() => setOpen(false)}>
                            <LinkBlog href="/blog" className={`nav-link header-nav-link ${pathname === "/blog" && "current"}`} locale={locale}>
                                {messages.blog}
                            </LinkBlog>
                        </li>
                        <li className="header-nav-list-item middle">
                            <Link href="/about" className={`nav-link header-nav-link ${pathname === "/about" && "current"}`} onClick={() => setOpen(false)}>
                                {messages.about}
                            </Link>
                        </li>
                        <li className="header-nav-list-item middle">
                            <Link href="/contact" className={`nav-link header-nav-link ${pathname === "/contact" && "current"}`} onClick={() => setOpen(false)}>
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

const Animation = ({ open, onClick }) => {
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
