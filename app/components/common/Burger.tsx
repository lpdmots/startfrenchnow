"use client";
import React, { useState, useRef } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { getPrimaryNavigation, isSiteNavActive, SiteNavItem, SiteNavLink } from "./siteNavigation";
import clsx from "clsx";

const getMobileAccentClasses = (item: SiteNavLink, isActive: boolean) =>
    clsx(item.accent === "fide" && "nav-link-fide current-fide", item.accent === "course" && "nav-link-fr current-fr", isActive && "current");

const Burger = () => {
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
            <Animation open={open} onClick={() => setOpen((current) => !current)} label={open ? t("closeMenu") : t("openMenu")} />

            <div
                ref={ref as React.RefObject<HTMLDivElement>}
                id="mobile-navigation"
                aria-hidden={!open}
                className={clsx(
                    "nav-width absolute right-0 top-[90px] z-[1000] grid w-screen px-6 transition-[grid-template-rows,opacity] duration-200 ease-out lg:hidden",
                    open ? "pointer-events-auto grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
                )}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="nav burgerCollapse mb-0 flex w-full flex-col items-start sm:w-none">
                        <div className="flex w-full flex-col gap-3 pl-0 sm:pl-2">
                            {open && navigationItems.map((item) => <BurgerNavItem key={item.key} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Burger;

const BurgerNavItem = ({
    item,
    pathname,
    onNavigate,
}: {
    item: SiteNavItem;
    pathname: string;
    onNavigate: () => void;
}) => {
    const isActive = isSiteNavActive(pathname, item);

    if (!item.items || item.items.length === 0) {
        return (
            <div className="w-full border-b border-neutral-300 pb-2">
                <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={clsx(
                        "nav-link header-nav-link flex min-h-11 w-full items-center rounded-xl !p-2 text-base font-semibold",
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
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                    "nav-link header-nav-link flex min-h-11 w-full items-center rounded-xl !p-2 text-base font-semibold",
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
                            aria-current={childActive ? "page" : undefined}
                            className={clsx("nav-link header-nav-link m-0 flex min-h-11 items-center gap-2 p-1 pl-0 font-medium", getMobileAccentClasses(child, childActive))}
                            onClick={onNavigate}
                        >
                            <ChevronRight aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
                            {child.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

const Animation = ({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) => {
    return (
        <button
            type="button"
            aria-label={label}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="relative flex size-11 items-center justify-center rounded-xl transition-transform duration-150 ease-out active:scale-[0.96] lg:hidden"
            onClick={onClick}
        >
            <span
                aria-hidden="true"
                className={clsx(
                    "absolute h-0.5 w-7 rounded-full bg-neutral-800 transition-transform duration-200 ease-out",
                    open ? "rotate-45" : "-translate-y-[7px]",
                )}
            />
            <span
                aria-hidden="true"
                className={clsx("absolute h-0.5 w-7 rounded-full bg-neutral-800 transition-opacity duration-150 ease-out", open ? "opacity-0" : "opacity-100")}
            />
            <span
                aria-hidden="true"
                className={clsx(
                    "absolute h-0.5 w-7 rounded-full bg-neutral-800 transition-transform duration-200 ease-out",
                    open ? "-rotate-45" : "translate-y-[7px]",
                )}
            />
        </button>
    );
};
