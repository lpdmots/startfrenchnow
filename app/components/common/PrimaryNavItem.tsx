"use client";

import clsx from "clsx";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { Locale } from "@/i18n";
import { Link, usePathname } from "@/i18n/navigation";
import { SiteNavAccent, SiteNavItem, SiteNavLink, isSiteNavActive } from "./siteNavigation";
import DropdownMenu from "./DropdownMenu";

const getTriggerAccentClasses = (accent?: SiteNavAccent) => {
    if (accent === "fide") {
        return "nav-trigger-fide current-fide";
    }

    if (accent === "course") {
        return "nav-trigger-fr current-fr";
    }

    return "";
};

const getLinkAccentClasses = (accent?: SiteNavAccent) => {
    if (accent === "fide") {
        return "nav-link-fide current-fide";
    }

    if (accent === "course") {
        return "nav-link-fr current-fr";
    }

    return "";
};

const isLinkActive = (pathname: string, link: SiteNavLink) => isSiteNavActive(pathname, link);

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

export const PrimaryNavItem = ({ item, locale }: { item: SiteNavItem; locale: Locale }) => {
    const pathname = usePathname();
    const isActive = isSiteNavActive(pathname, item);
    const triggerClasses = clsx(
        "header-nav-trigger whitespace-nowrap px-3 py-3 text-[0.92rem] font-bold leading-none xl:px-4",
        getTriggerAccentClasses(item.accent),
        isActive && "current"
    );

    if (!item.items || item.items.length === 0) {
        return (
            <Link
                href={item.href}
                locale={locale}
                aria-current={isActive ? "page" : undefined}
                className={triggerClasses}
            >
                {item.label}
            </Link>
        );
    }

    return <PrimaryNavDropdown item={item} locale={locale} pathname={pathname} triggerClasses={triggerClasses} />;
};

const PrimaryNavDropdown = ({
    item,
    locale,
    pathname,
    triggerClasses,
}: {
    item: SiteNavItem;
    locale: Locale;
    pathname: string;
    triggerClasses: string;
}) => {
    const childItems = item.items ?? [];
    const groupedItems = groupDropdownLinks(childItems);
    const content = (
        <div className="card mt-4 p-5 pr-8">
            <div className="flex min-w-[300px] flex-col">
                {groupedItems.map((group, groupIndex) => (
                    <div key={`${group.title ?? "group"}-${groupIndex}`} className={clsx("flex flex-col", groupIndex > 0 && "mt-4 pt-4 border-t border-neutral-300")}>
                        {group.title && (
                            <div className="mx-6 mb-2 inline-block w-fit border-b border-neutral-700 pb-1 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-neutral-700">
                                {group.title}
                            </div>
                        )}
                        {group.links.map((child) => {
                            const childActive = isLinkActive(pathname, child);

                            return (
                                <Link
                                    key={child.key}
                                    href={child.href}
                                    locale={locale}
                                    className={clsx(
                                        "nav-link header-nav-link m-0 flex items-center gap-2 whitespace-nowrap p-1 pl-6 font-medium",
                                        getLinkAccentClasses(child.accent),
                                        childActive && "current"
                                    )}
                                    aria-current={childActive ? "page" : undefined}
                                >
                                    <FaCaretRight />
                                    {child.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <DropdownMenu content={content}>
            <div className={clsx(triggerClasses, "gap-2")}>
                <span>{item.label}</span>
                <FaCaretDown className="text-sm" />
            </div>
        </DropdownMenu>
    );
};
