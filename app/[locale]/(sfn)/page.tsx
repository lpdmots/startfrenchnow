import React from "react";
import BlogHome from "@/app/components/sfn/home/BlogHome";
import HomeReviews from "@/app/components/sfn/home/HomeReviews";
import CoreValuesMethod from "@/app/components/sfn/home/CoreValuesMethod";
import LessonCards from "@/app/components/sfn/home/LessonCards";
import UdemyBusiness from "@/app/components/sfn/home/UdemyBusiness";
import WhoIAm from "@/app/components/sfn/home/WhoIAm";
import MarqueeContent from "@/app/components/sfn/home/MarqueeContent";
import { HeroSfn } from "@/app/components/sfn/home/HeroSfn";
import { Locale, normalizeLocale } from "@/i18n";
import Marquee from "@/app/components/ui/marquee";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);

    
    const t = await getTranslations({ locale: locale, namespace: "Metadata.Home" });

    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: locale === "fr" ? "/fr" : "/",
            languages: {
                en: "/",
                fr: "/fr",
                "x-default": "/",
            },
        },
    };
}

async function Home(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);

    
    return (
        <div className="page-wrapper flex flex-col gap-8 md:gap-12">
            <HeroSfn />
            <HomeReviews />
            <LessonCards />

            <UdemyBusiness />

            <section className="section py-0 wf-section">
                <CoreValuesMethod />
            </section>

            <div className="max-w-screen overflow-hidden h-48 lg:h-64">
                <div className="bg-neutral-800 py-4 lg:py-8 my-12 custom-rotate overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:60s]">
                        <MarqueeContent />
                    </Marquee>
                </div>
            </div>

            <section className="section py-0 wf-section">
                <WhoIAm />
            </section>
            <BlogHome locale={locale} />
        </div>
    );
}

export default Home;
