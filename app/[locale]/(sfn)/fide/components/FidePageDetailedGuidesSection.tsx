import type { FlatFidePackSommaire } from "../videos/page";
import FideVideoList from "../videos/components/FideVideoList";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n";

type Props = {
    guides: FlatFidePackSommaire;
    locale: Locale;
};

export function FidePageDetailedGuidesSection({ guides, locale }: Props) {
    const t = useTranslations("Fide.FidePageDetailedGuides");

    return (
        <section className="py-16 lg:py-24 bg-neutral-200">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h2 className="display-2 mb-4">
                    <span className="heading-span-secondary-6">{t("titleHighlight")}</span> {t("titleSuffix")}
                </h2>
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
