"use client";

import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";

const FIDE_SOURCE_CATEGORIES = new Set(["fide", "pack_fide"]);
const OFFICIAL_FIDE_DOCUMENT_URL = "https://fide-info.ch/fr/test/testfide";

export default function OfficialFideSourceNotice({ categories }: { categories?: string[] }) {
    const t = useTranslations("OfficialFideSourceNotice");
    const shouldRender = categories?.some((category) => FIDE_SOURCE_CATEGORIES.has(category)) ?? false;

    if (!shouldRender) return null;

    return (
        <aside className="mt-8 rounded-3xl border border-solid border-neutral-800 bg-neutral-100 p-5 sm:p-6">
            <p className="mb-2 inline-flex rounded-full bg-secondaryShades-6 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-6">{t("badge")}</p>
            <p className="mb-3 text-sm leading-7 text-neutral-700 sm:text-base">
                <span className="font-bold text-neutral-800">{t("sourceLabel")}</span> {t("sourceText")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="text-sm font-bold text-neutral-800 sm:text-base">{t("officialDocumentLabel")}</span>
                <LinkArrow url={OFFICIAL_FIDE_DOCUMENT_URL} target="_blank" rel="noopener noreferrer" category="fide" className="text-sm font-semibold sm:text-base">
                    {t("officialDocumentLink")}
                </LinkArrow>
            </div>
        </aside>
    );
}
