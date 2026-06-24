import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FaListUl, FaTags } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

export function HeroPackFide() {
    const t = useTranslations("Fide.PackFideHero");
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
        <section id="hero-pack-fide" className="section hero v1 wf-section relative overflow-x-clip !pt-6 !pb-0">
            <div className="w-full px-4 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-12 sm:gap-5 pb-6 text-center lg:pb-10">
                        <h1 className="display-1 mb-0 leading-[1.03] mt-12 sm:mt-6">{t.rich("title", rich)}</h1>
                        <p className="mb-0 max-w-3xl text-base text-neutral-700 sm:text-lg">{t.rich("subtitle", rich)}</p>
                        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                            <Link href="#pack-pricing" aria-label={t("ctaOffers.aria")} className="btn btn-primary w-full text-center sm:w-auto inline-flex items-center justify-center gap-2">
                                <FaTags className="text-sm" />
                                {t("ctaOffers.label")}
                            </Link>
                            <Link
                                href="#videosSection"
                                aria-label={t("ctaSummary.aria")}
                                className="btn btn-secondary w-full text-center no-underline sm:w-auto inline-flex items-center justify-center gap-2"
                            >
                                <FaListUl className="text-sm" />
                                {t("ctaSummary.label")}
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center pt-0 pb-8 md:pb-10 lg:pb-14">
                        <div className="w-full max-w-5xl md:max-w-[860px] lg:max-w-[980px]">
                            <Image
                                src="/images/pack-fide-hero-5.png"
                                alt={t("images.desktopAlt")}
                                width={1400}
                                height={980}
                                className="h-auto w-full object-contain"
                                sizes="(min-width: 1280px) 980px, (min-width: 1024px) 78vw, (min-width: 768px) 86vw, 94vw"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
