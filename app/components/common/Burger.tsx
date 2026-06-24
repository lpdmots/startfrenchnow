"use client";
import React, { useState, useRef } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { FaCaretRight } from "react-icons/fa";
import { Locale } from "@/i18n";
import { useTranslations } from "next-intl";
import { getPrimaryNavigation, isSiteNavActive, SiteNavItem, SiteNavLink } from "./siteNavigation";
import clsx from "clsx";

const getMobileAccentClasses = (item: SiteNavLink, isActive: boolean) =>
    clsx(item.accent === "fide" && "nav-link-fide current-fide", item.accent === "course" && "nav-link-fr current-fr", isActive && "current");

const Burger = ({ locale }: { locale: Locale }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLElement | null>(null);
    const pathname = usePathname();
    const t = useTranslations("Navigation");
    const navigationItems = getPrimaryNavigation(t);

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
                    <div className="flex w-full flex-col gap-3 pl-0 sm:pl-2">
                        {navigationItems.map((item) => (
                            <BurgerNavItem key={item.key} item={item} locale={locale} pathname={pathname} onNavigate={() => setOpen(false)} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Burger;

const BurgerNavItem = ({
    item,
    locale,
    pathname,
    onNavigate,
}: {
    item: SiteNavItem;
    locale: Locale;
    pathname: string;
    onNavigate: () => void;
}) => {
    const isActive = isSiteNavActive(pathname, item);

    if (!item.items || item.items.length === 0) {
        return (
            <div className="w-full border-b border-neutral-300 pb-2">
                <Link
                    href={item.href}
                    locale={locale}
                    className={clsx(
                        "nav-link header-nav-link block w-full rounded-xl !p-2 text-base font-semibold",
                        item.priority === "primary-offer" && "font-bold",
                        getMobileAccentClasses(item, isActive),
                        item.emphasize && "bg-neutral-100 shadow-sm"
                    )}
                    onClick={onNavigate}
                >
                    {item.label}
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full border-b border-neutral-300 pb-3">
            <Link
                href={item.href}
                locale={locale}
                className={clsx(
                    "nav-link header-nav-link block w-full rounded-xl !p-2 text-base font-semibold",
                    item.priority === "primary-offer" && "font-bold",
                    item.accent === "fide" && "nav-link-fide current-fide",
                    item.accent === "course" && "nav-link-fr current-fr",
                    isActive && "current"
                )}
                onClick={onNavigate}
            >
                {item.label}
            </Link>
            <div className="mt-1 flex flex-col gap-1 border-l border-neutral-300 pl-4">
                {item.items.map((child) => {
                    const childActive = isSiteNavActive(pathname, child);

                    return (
                        <Link
                            key={child.key}
                            href={child.href}
                            locale={locale}
                            className={clsx("nav-link header-nav-link m-0 flex items-center gap-2 p-1 pl-0 font-medium", getMobileAccentClasses(child, childActive))}
                            onClick={onNavigate}
                        >
                            <FaCaretRight />
                            {child.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

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
