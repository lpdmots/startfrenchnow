import React from "react";
import BlogHome from "@/app/components/sfn/home/BlogHome";
import HomeReviews from "@/app/components/sfn/home/HomeReviews";
import CoreValuesMethod from "@/app/components/sfn/home/CoreValuesMethod";
import WhyFideHome from "@/app/components/sfn/home/WhyFideHome";
import WhoIAm from "@/app/components/sfn/home/WhoIAm";
import MarqueeContent from "@/app/components/sfn/home/MarqueeContent";
import { HeroSfn } from "@/app/components/sfn/home/HeroSfn";
import { HomeFaqSection } from "@/app/components/sfn/home/HomeFaqSection";
import { homeFaqItemKeys } from "@/app/components/sfn/home/homeFaqItemKeys";
import { HomePreparationOptionsSection } from "@/app/components/sfn/home/HomePreparationOptionsSection";
import { HomeRitaVideoSection } from "@/app/components/sfn/home/HomeRitaVideoSection";
import { HomeSocialProofBand } from "@/app/components/sfn/home/HomeSocialProofBand";
import { Locale, normalizeLocale } from "@/i18n";
import Marquee from "@/app/components/ui/marquee";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { Suspense } from "react";
import { ContactForFideCourses } from "./fide/components/ContactForFideCourses";
import { ContactForFide } from "./fide/components/ContactForFide";


export const dynamic = "force-static";
export const revalidate = 1800;

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
    setRequestLocale(locale);
    const faqT = await getTranslations({ locale: locale, namespace: "HomeFaq" });
    const faqTRich = faqT.rich as (key: string, values?: Record<string, (chunks: string) => string>) => string;
    const faqPlainRich = {
        linkMock: (chunks: string) => chunks,
        linkPack: (chunks: string) => chunks,
        linkPrivate: (chunks: string) => chunks,
        linkContact: (chunks: string) => chunks,
        linkScenarios: (chunks: string) => chunks,
    };
    const faqItems = homeFaqItemKeys.map((itemKey) => ({
        question: faqT(`items.${itemKey}.title` as never),
        answer: faqTRich(`items.${itemKey}.content`, faqPlainRich),
    }));

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };

    return (
        <div className="page-wrapper flex flex-col gap-8 md:gap-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <HeroSfn />
            <HomePreparationOptionsSection />
            <ContactForFide />
            <HomeRitaVideoSection />

            <WhyFideHome />

            <section className="section py-12 wf-section">
                <CoreValuesMethod />
            </section>

            <HomeSocialProofBand />

            <section className="section py-0 wf-section">
                <WhoIAm />
            </section>
            <HomeReviews />
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
                </div>
            </div>
            <Suspense fallback={<div className="container-default w-container my-12 lg:my-24 min-h-[420px]" />}>
                <BlogHome locale={locale} />
            </Suspense>
            <HomeFaqSection />
        </div>
    );
}

export default Home;
