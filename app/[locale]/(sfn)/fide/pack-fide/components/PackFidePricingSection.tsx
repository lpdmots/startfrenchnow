import type { PricingDetails } from "@/app/types/sfn/stripe";
import LinkArrow from "@/app/components/common/LinkArrow";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import clsx from "clsx";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type PackFidePricingSectionProps = {
    locale: string;
    hasPack?: boolean;
    pricingPack?: PricingDetails | null;
};

export function PackFidePricingSection({ locale, hasPack = false, pricingPack }: PackFidePricingSectionProps) {
    const isFr = locale === "fr";
    const t = useTranslations("Fide.PackFidePricing");
    const rich = intelRich();
    const callbackPath = isFr ? "/fr/fide/pack-fide#pack-pricing" : "/fide/pack-fide#pack-pricing";

    const formatAmount = (value: number) => {
        const normalized = Math.round(value * 100) / 100;
        const hasCents = Math.abs(normalized % 1) > 0;
        return new Intl.NumberFormat(isFr ? "fr-CH" : "en-US", {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
        }).format(normalized);
    };

    const formatPrice = (value: number, currency: PricingDetails["currency"]) => {
        const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "CHF";
        return `${formatAmount(value)} ${symbol}`;
    };

    const buildPriceContent = (pricingDetails?: PricingDetails | null) => {
        if (!pricingDetails) return undefined;
        const hasDiscount = pricingDetails.amount < pricingDetails.initialAmount;
        return (
            <div className="flex flex-col leading-none">
                <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-secondary-6 sm:text-5xl">{formatPrice(pricingDetails.amount, pricingDetails.currency)}</span>
                    {hasDiscount ? <span className="text-sm text-neutral-500 line-through sm:text-lg">{formatPrice(pricingDetails.initialAmount, pricingDetails.currency)}</span> : null}
                </div>
            </div>
        );
    };

    const packPrice = pricingPack ? formatPrice(pricingPack.amount, pricingPack.currency) : "99 CHF";
    const packPriceContent = buildPriceContent(pricingPack);
    const packFeatures = t.raw("cards.autonomy.features") as string[];
    const packExtras = t.raw("cards.autonomy.extras") as string[];
    const checkoutUrl = `/checkout/pack-fide?quantity=1&callbackUrl=${encodeURIComponent(callbackPath)}`;
    const packPreviewAlt = isFr ? "Aperçu du Pack Exam" : "Exam Pack preview";

    return (
        <section id="pack-pricing" className="bg-neutral-200 py-14 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="mx-auto mb-8 max-w-4xl text-center">
                    <h2 className="display-2 mb-3">{t.rich("title", rich)}</h2>
                    <p className="mb-0 text-base text-neutral-700 md:text-lg">{t("subtitle")}</p>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:mb-12 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-center">
                    <article className="relative overflow-hidden rounded-3xl border-2 border-secondary-6 bg-neutral-100 p-5 shadow-lg md:p-7">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-secondaryShades-6 opacity-35" />
                        <div className="pointer-events-none absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-secondaryShades-6 opacity-25" />

                        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                            <div>
                                <h3 className="mb-3 text-2xl font-bold text-neutral-800 lg:text-[32px] lg:leading-tight">{t("cards.autonomy.title")}</h3>
                                <p className="mb-0 max-w-3xl text-sm text-neutral-700 sm:text-base">{t.rich("cards.autonomy.description.text", rich)}</p>

                                <div className="mt-5 grid grid-cols-1 gap-2">
                                    {packFeatures.map((feature, index) => (
                                        <p key={index} className="mb-0 flex items-start gap-2 text-sm text-neutral-700">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-6" />
                                            <span>{feature}</span>
                                        </p>
                                    ))}
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {packExtras.map((extra, index) => (
                                        <span
                                            key={index}
                                            className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800"
                                            style={{ borderColor: "rgba(var(--secondary-6-rgb), 0.35)" }}
                                        >
                                            {extra}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="min-w-[240px] lg:border-l lg:border-neutral-300 lg:pl-8">
                                <div className="text-left lg:text-right">
                                    {packPriceContent ? (
                                        packPriceContent
                                    ) : (
                                        <p className="mb-0 text-5xl font-extrabold leading-none text-secondary-6 md:text-6xl">{packPrice}</p>
                                    )}
                                </div>
                                <div className="mt-5 flex justify-start lg:justify-end">
                                    <Link
                                        href={hasPack ? "#" : checkoutUrl}
                                        className={clsx(
                                            "btn btn-primary small inline-flex w-full items-center justify-center gap-2 text-center",
                                            "sm:w-auto",
                                            hasPack && "pointer-events-none cursor-not-allowed opacity-60",
                                        )}
                                        aria-disabled={hasPack}
                                    >
                                        {hasPack ? t("cards.autonomy.ownedCta") : t("cards.autonomy.cta")}
                                        {!hasPack ? <ArrowRight className="h-4 w-4" /> : null}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </article>

                    <div className="mx-auto w-full max-w-[420px] lg:max-w-none">
                        <Image
                            src="/images/pack-fide-hero.png"
                            alt={packPreviewAlt}
                            width={1200}
                            height={675}
                            sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 30vw, (min-width: 768px) 60vw, 100vw"
                            className="h-auto w-full object-contain"
                        />
                    </div>
                </div>

                <div className="w-full">
                    <div className="grid items-center gap-6 border-y border-neutral-300 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:py-9">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-2">{t("privateBadge")}</p>
                            <h3 className="mb-3 text-2xl font-bold lg:text-[32px] lg:leading-tight">{t("privateTitle")}</h3>
                            <p className="mb-4 max-w-2xl text-sm text-neutral-700">
                                {t("privateDescription")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                    {t("privateBullets.1")}
                                </span>
                                <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                    {t("privateBullets.2")}
                                </span>
                                <span className="rounded-full border px-3 py-1 text-sm font-semibold text-neutral-800" style={{ borderColor: "rgba(var(--secondary-2-rgb), 0.35)" }}>
                                    {t("privateBullets.3")}
                                </span>
                            </div>
                        </div>
                        <div className="flex min-w-[230px] flex-col items-start gap-3 border-neutral-300 lg:items-end lg:border-l lg:pl-8">
                            <LinkArrow url="/fide/private-courses" target="_self" className="text-lg font-bold text-secondary-2 hover:!text-secondary-2">
                                {t("privateCta")}
                            </LinkArrow>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
