import { Link } from "@/i18n/navigation";
import { Safari } from "@/app/components/ui/safari";
import { Iphone } from "@/app/components/ui/iphone";
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

                    <div className="relative mx-auto h-[270px] w-full max-w-6xl overflow-hidden sm:h-[240px] md:h-[290px] lg:h-[430px]">
                        <div className="absolute left-1/2 top-0 w-[94%] -translate-x-1/2 -rotate-[1.3deg] origin-bottom sm:w-[90%] sm:-rotate-[1.6deg] lg:left-[38%] lg:w-[70%] lg:-rotate-[2deg] mt-4">
                            <Safari
                                imageSrc="/images/hero-desktop-pack-fide.png"
                                alt={t("images.desktopAlt")}
                                url="startfrenchnow.com/fr/fide/pack-fide"
                                sizes="(min-width: 1280px) 1050px, (min-width: 1024px) 82vw, (min-width: 640px) 90vw, 94vw"
                                priority
                                imageClassName="object-top"
                            />
                        </div>
                        <div className="absolute right-[2%] top-[4%] hidden w-[34%] rotate-[8deg] sm:right-[4%] sm:top-[6%] sm:w-[26%] lg:right-[4%] lg:top-[8%] lg:block lg:w-[22%] border border-neutral-700 rounded-[2.8rem]">
                            <Iphone
                                src="/images/hero-pack-fide-mobile.png"
                                alt={t("images.mobileAlt")}
                                sizes="(min-width: 1280px) 250px, (min-width: 1024px) 22vw, (min-width: 640px) 26vw, 34vw"
                                className="w-full max-w-none !border-neutral-300 !bg-neutral-100"
                                notchClassName="!bg-neutral-300"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
