"use client";
import React, { useState, useRef } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { FaCaretRight } from "react-icons/fa";
import { Locale } from "@/i18n";
import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { getPrimaryNavigation, isSiteNavActive, SiteNavItem, SiteNavLink } from "./siteNavigation";
import clsx from "clsx";

const getMobileAccentClasses = (item: SiteNavLink, isActive: boolean) =>
    clsx(item.accent === "fide" && "nav-link-fide current-fide", item.accent === "course" && "nav-link-fr current-fr", isActive && "current");

const groupDropdownLinks = (links: SiteNavLink[]) => {
    const groups: { title?: string; links: SiteNavLink[] }[] = [];

    links.forEach((link) => {
        if (link.sectionTitle || groups.length === 0) {
            groups.push({
                title: link.sectionTitle,
                links: [link],
            });
            return;
        }

        groups[groups.length - 1].links.push(link);
    });

    return groups;
};

const Burger = ({ locale }: { locale: Locale }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLElement | null>(null);
    const pathname = usePathname();
    const t = useTranslations("Navigation");
    const navigationItems = getPrimaryNavigation(t);
    const defaultOpenSections = navigationItems.filter((item) => item.items && isSiteNavActive(pathname, item)).map((item) => item.key);

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
                        <Accordion type="multiple" defaultValue={defaultOpenSections} className="w-full border-b-0">
                            {navigationItems.map((item) => (
                                <BurgerNavItem key={item.key} item={item} locale={locale} pathname={pathname} onNavigate={() => setOpen(false)} />
                            ))}
                        </Accordion>
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
    const groupedItems = groupDropdownLinks(item.items ?? []);

    if (!item.items || item.items.length === 0) {
        return (
            <div className="w-full">
                <Link
                    href={item.href}
                    locale={locale}
                    className={clsx("nav-link header-nav-link block w-full rounded-xl !p-2", getMobileAccentClasses(item, isActive), item.emphasize && "bg-neutral-100 shadow-sm")}
                    onClick={onNavigate}
                >
                    {item.label}
                </Link>
            </div>
        );
    }

    return (
        <AccordionItem value={item.key} className="w-full border-b border-neutral-300">
            <AccordionTrigger className={clsx("py-3 text-left text-base no-underline hover:no-underline", item.accent === "fide" && "text-[var(--secondary-6)]", item.accent === "course" && "text-[var(--secondary-2)]")}>
                <span className={clsx("font-semibold", isActive && "underline underline-offset-4")}>{item.label}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
                <div className="flex flex-col gap-1 border-l border-neutral-300 pl-4">
                    {groupedItems.map((group, groupIndex) => (
                        <div key={`${group.title ?? "group"}-${groupIndex}`} className={clsx("flex flex-col", groupIndex > 0 && "mt-3 pt-3 border-t border-neutral-300")}>
                            {group.title && <div className="mb-2 border-b border-neutral-400 pb-1 text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-neutral-600">{group.title}</div>}
                            {group.links.map((child) => {
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
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
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
