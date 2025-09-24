"use client";
import { Locale } from "@/i18n";
import React from "react";
import Link from "next-intl/link";

function ClientSideRoute({ children, route, locale }: { children: React.ReactNode; route: string; locale: Locale }) {
    return (
        <Link href={route} className="no-underline" locale={locale}>
            {children}
        </Link>
    );
}

export default ClientSideRoute;
