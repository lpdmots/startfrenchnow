"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { MouseEvent, ReactNode } from "react";

type FreshMockExamCardLinkProps = {
    href: string;
    className?: string;
    children: ReactNode;
};

export default function FreshMockExamCardLink({ href, className, children }: FreshMockExamCardLinkProps) {
    const router = useRouter();
    const locale = useLocale();

    const localizedHref = locale === "fr" && !href.startsWith("/fr/") ? `/fr${href}` : href;

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;

        event.preventDefault();
        const separator = localizedHref.includes("?") ? "&" : "?";
        router.push(`${localizedHref}${separator}_r=${Date.now()}`);
    };

    return (
        <a href={localizedHref} onClick={handleClick} className={className}>
            {children}
        </a>
    );
}

