import type { ReactNode } from "react";
import type { Locale } from "@/i18n";
import LinkArrow from "@/app/components/common/LinkArrow";
import { getTranslations } from "next-intl/server";
import PriceSliderFide from "../../components/PriceSliderFide";

export async function PrivateCoursesPricingSection({ locale, title, subtitle }: { locale: Locale; title: ReactNode; subtitle: string }) {
    const isFr = locale === "fr";
    const t = await getTranslations({ locale, namespace: "Fide.PrivateCoursesPricing" });

    return (
        <div id="plans" className="py-20 px-4 lg:px-8">
            <div className="max-w-7xl m-auto flex flex-col">
                <div className="text-center">
                    <h2 className="display-2 mb-4">{title}</h2>
                    <p className="mb-0">{subtitle}</p>
                </div>
                {/* Previous card-based pricing layout kept aside for rollback if needed.
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 m-auto">...</div>
                <CustomHoursModalTrigger locale={locale} callbackPath={isFr ? "/fr/fide/private-courses#plans" : "/fide/private-courses#plans"} />
                */}
                <div className="w-full">
                    <PriceSliderFide locale={locale} callbackPath={isFr ? "/fr/fide/private-courses#plans" : "/fide/private-courses#plans"} />
                </div>
                <div className="mx-auto mt-2 mb-10 max-w-3xl text-center">
                    <p className="mb-0 text-sm text-neutral-700">
                        {t("contactHint.text")}{" "}
                        <LinkArrow url="#ContactForFIDECourses" target="_self" className="inline-block font-bold text-secondary-6 hover:!text-secondary-6">
                            {t("contactHint.cta")}
                        </LinkArrow>
                    </p>
                </div>
                <div className="w-full">
                    <div className="grid items-center gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:py-9 border-y border-neutral-300">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-6">{t("mix.badge")}</p>
                            <h3 className="text-2xl lg:text-[32px] lg:leading-tight font-bold mb-3">{t("mix.title")}</h3>
                            <p className="mb-4 text-sm text-neutral-700 max-w-2xl">{t("mix.description")}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {t("mix.bullets.1")}
                                </span>
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {t("mix.bullets.2")}
                                </span>
                                <span className="rounded-full border px-3 py-1 text-sm font-bold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}>
                                    {t("mix.bullets.3")}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-3 border-neutral-300 lg:items-end lg:border-l lg:pl-8 min-w-[230px]">
                            <LinkArrow url="/fide/pack-fide" target="_self" className="text-lg font-bold text-secondary-6 hover:!text-secondary-6">
                                {t("mix.cta")}
                            </LinkArrow>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
