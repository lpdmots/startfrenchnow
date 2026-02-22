import CommentComposer from "@/app/components/comments/CommentComposer";
import CommentList from "@/app/components/comments/CommentList";
import { intelRich } from "@/app/lib/intelRich";
import { Locale } from "@/i18n";
import { useTranslations } from "next-intl";
import React from "react";

export const DashboardComments = ({ locale, userId }: { locale: Locale; userId: string | "" }) => {
    const t = useTranslations("Fide.dashboard.Questions");

    return (
        <div className="w-full flex items-center flex-col m-auto max-w-7xl gap-6 lg:gap-12 mb-12 lg:my-12">
            <h2 className="mb-0 w-full display-2 font-medium">{t.rich("title", intelRich())}</h2>
            <CommentComposer resourceType="french_dashboard" resourceId={userId} />
            <CommentList resourceType="french_dashboard" resourceId={userId} locale={locale as Locale} />
        </div>
    );
};
