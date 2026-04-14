import Image from "next/image";
import { useTranslations } from "next-intl";

export function FidePageHeroSection() {
    const t = useTranslations("Fide.FidePageHero");

    return (
        <div id="HeroFide" className="page-wrapper pt-12 pb-12 lg:pb-24 lg:min-h-[calc(100svh-150px)] lg:flex lg:items-center">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h1 className="display-1 mb-6 lg:mb-10">
                    {t("titlePrefix")} <span className="heading-span-secondary-6">{t("titleHighlight")}</span>
                </h1>

                <div className="grid lg:grid-cols-[1fr_1fr] gap-2 items-center">
                    <div>
                        <p className="bl mb-6 text-justify">{t("subtitle")}</p>
                        <div className="flex flex-col gap-4 lg:gap-8 mb-6 lg:mb-8">
                            <div className="flex gap-3 lg:gap-4 items-start">
                                <div className="bullet bg-secondary-6 mt-[1px] md:mt-1"></div>
                                <p className="mb-0 text-base lg:text-2xl leading-tight">
                                    <b className="underline decoration-secondary-6">{t("bullets.understand.bold")}</b> {t("bullets.understand.rest")}
                                </p>
                            </div>
                            <div className="flex gap-3 lg:gap-4 items-start">
                                <div className="bullet bg-secondary-5 mt-[1px] md:mt-1"></div>
                                <p className="mb-0 text-base lg:text-2xl leading-tight">
                                    {t("bullets.discover.prefix")} <b className="underline decoration-2 decoration-secondary-5">{t("bullets.discover.bold")}</b>
                                    {t("bullets.discover.suffix")}
                                </p>
                            </div>
                            <div className="flex gap-3 lg:gap-4 items-start">
                                <div className="bullet bg-secondary-2 mt-[1px] md:mt-1"></div>
                                <p className="mb-0 text-base lg:text-2xl leading-tight">
                                    {t("bullets.apply.prefix")} <b className="underline decoration-secondary-2">{t("bullets.apply.bold")}</b> {t("bullets.apply.suffix")}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a href="#fide-overview" className="btn btn-primary no-underline !px-4 min-w-[253px]">
                                {t("cta.primary")}
                            </a>
                            <a href="#fide-hub" className="btn btn-secondary no-underline !px-4 min-w-[253px]">
                                {t("cta.secondary")}
                            </a>
                        </div>
                        <div className="mt-6 pt-4 border-t border-neutral-300 text-sm lg:text-base font-semibold text-neutral-700 flex flex-wrap items-center gap-2">
                            <span className="text-neutral-500">{t("examsLabel")}</span>
                            <a href="#fide-oral-speaking" className="hover:text-secondary-6 no-underline">
                                {t("exams.speaking")}
                            </a>
                            <span className="text-neutral-400">›</span>
                            <a href="#fide-oral-listening" className="hover:text-secondary-6 no-underline">
                                {t("exams.listening")}
                            </a>
                            <span className="text-neutral-400">›</span>
                            <a href="#fide-read-write" className="hover:text-secondary-6 no-underline">
                                {t("exams.readWrite")}
                            </a>
                        </div>
                    </div>
                    <div className="">
                        <Image src="/images/hero-fide4.png" alt={t("imageAlt")} width={600} height={380} className="w-full !h-auto m-auto max-w-[500px] lg:max-w-[600px]" priority />
                    </div>
                </div>
            </div>
        </div>
    );
}
