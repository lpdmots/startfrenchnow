"use client";

import { useSfnStore } from "@/app/stores/sfnStore";
import { Locale } from "@/i18n";
import Link from "next-intl/link";

interface Props {
    children: React.ReactNode;
    className?: string;
    href: string;
    locale?: Locale;
}

export const LinkBlog = ({ children, className, href, locale }: Props) => {
    const { postLang: postLangStored } = useSfnStore();
    const postLang = postLangStored ? postLangStored : ["fr", "en"].includes(locale || "") ? locale : "en";

    return (
        <Link href={`${href}?postLang=${postLang}`} className={className}>
            {children}
        </Link>
    );
};
