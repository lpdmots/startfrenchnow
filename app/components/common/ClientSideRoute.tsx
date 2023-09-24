"use client";
import { Locale } from "@/i18n";
import React from "react";
import { LinkBlog } from "../sfn/blog/LinkBlog";

function ClientSideRoute({ children, route, locale }: { children: React.ReactNode; route: string; locale: Locale }) {
    return (
        <LinkBlog href={route} className="no-underline" locale={locale}>
            {children}
        </LinkBlog>
    );
}

export default ClientSideRoute;
