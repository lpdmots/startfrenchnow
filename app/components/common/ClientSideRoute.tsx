"use client";
import { Locale } from "@/i18n";
import React from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { getExplicitLinkLocale } from "@/app/lib/i18n/linkLocale.mjs";

function ClientSideRoute({ children, route, locale }: { children: React.ReactNode; route: string; locale: Locale }) {
    const currentLocale = useLocale() as Locale;

    return (
        <Link href={route} locale={getExplicitLinkLocale(currentLocale, locale)} className="no-underline">
            {children}
        </Link>
    );
}

export default ClientSideRoute;
