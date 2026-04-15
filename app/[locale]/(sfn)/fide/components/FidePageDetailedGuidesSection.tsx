import type { FlatFidePackSommaire } from "../videos/page";
import FideVideoList from "../videos/components/FideVideoList";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

type Props = {
    guides: FlatFidePackSommaire;
    locale: Locale;
};

export function FidePageDetailedGuidesSection({ guides, locale }: Props) {
    const t = useTranslations("Fide.FidePageDetailedGuides");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
    };

    return (
        <section className="py-16 lg:py-24 bg-neutral-200">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h2 className="display-2 mb-4">{t.rich("title", rich)}</h2>
                <p className="mb-8">{t("subtitle")}</p>

                {guides.length === 0 ? (
                    <p className="mb-0 text-neutral-700">{t("empty")}</p>
                ) : (
                    <FideVideoList filteredPackSommaire={guides} locale={locale} hasPack hidePackageBadge />
                )}
            </div>
        </section>
    );
}
