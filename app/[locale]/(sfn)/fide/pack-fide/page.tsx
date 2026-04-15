import { normalizeLocale } from "@/i18n";
import { client } from "@/app/lib/sanity.client";
import { getAmount } from "@/app/serverActions/stripeActions";
import { PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { groq } from "next-sanity";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import Marquee from "@/app/components/ui/marquee";
import { FideFaq } from "../components/FideFaq";
import { ContactForFideCourses } from "../components/ContactForFideCourses";
import MarqueePackFideContent from "../components/MarqueePackFideContent";
import { VideosSection } from "../components/VideosSection";
import { HeroPackFide } from "./components/HeroPackFide";
import { WhatIsPackFideSection } from "./components/WhatIsPackFideSection";
import { PackFideNextStepsSection } from "./components/PackFideNextStepsSection";
import { PackFidePricingSectionClient } from "./components/PackFidePricingSectionClient";
import { ContactForFide } from "../components/ContactForFide";
import { DeferredPackFideExamsSection } from "./components/DeferredPackFideExamsSection";
import { DeferredPackFideReviews } from "./components/DeferredPackFideReviews";
import { getTranslations } from "next-intl/server";
import { intelRich } from "@/app/lib/intelRich";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");
const queryProductBySlug = groq`*[_type=='product' && slug.current == $slug][0]`;

type FaqItem = {
    question: string;
    answer: string;
    content?: ReactNode;
};

export default async function PackFidePage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    const isFr = locale === "fr";
    const t = await getTranslations({ locale, namespace: "Fide.PackFidePage" });
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
    };

    const [autonomieProduct, accompagneProduct] = await Promise.all([
        client.fetch<ProductFetch>(queryProductBySlug, { slug: "pack-fide" }),
        client.fetch<ProductFetch>(queryProductBySlug, { slug: "pack-fide-accompagne" }),
    ]);

    let pricingAutonomie: PricingDetails | null = null;
    let pricingAccompagne: PricingDetails | null = null;

    if (autonomieProduct) {
        try {
            const { pricingDetails } = await getAmount(autonomieProduct, "1", "CHF", undefined);
            pricingAutonomie = pricingDetails;
        } catch (error) {
            console.error("Failed to load pricing for pack-fide:", error);
        }
    }

    if (accompagneProduct) {
        try {
            const { pricingDetails } = await getAmount(accompagneProduct, "1", "CHF", undefined);
            pricingAccompagne = pricingDetails;
        } catch (error) {
            console.error("Failed to load pricing for pack-fide-accompagne:", error);
        }
    }

    const homePath = isFr ? "/fr" : "/";
    const fidePath = isFr ? "/fr/fide" : "/fide";
    const packPath = isFr ? "/fr/fide/pack-fide" : "/fide/pack-fide";

    const faqItems: FaqItem[] = [
        {
            question: t("faq.items.included.title"),
            answer: t("faq.items.included.content"),
        },
        {
            question: t("faq.items.difference.title"),
            answer: t("faq.items.difference.content"),
        },
        {
            question: t("faq.items.fromZero.title"),
            answer: t("faq.items.fromZero.content"),
        },
        {
            question: t("faq.items.updates.title"),
            answer: t("faq.items.updates.content"),
        },
        {
            question: t("faq.items.combine.title"),
            answer: t("faq.items.combine.content"),
            content: (
                <p className="mb-0">
                    {t.rich("faq.items.combine.contentRich", {
                        ...rich,
                        link: (chunks: ReactNode) => (
                            <Link href="/fide/private-courses" className="font-semibold text-secondary-2 underline">
                                {chunks}
                            </Link>
                        ),
                    })}
                </p>
            ),
        },
        {
            question: t("faq.items.freeOption.title"),
            answer: t("faq.items.freeOption.content"),
            content: (
                <p className="mb-0">
                    {t.rich("faq.items.freeOption.contentRich", {
                        ...rich,
                        link: (chunks: ReactNode) => (
                            <Link href="/fide/videos" className="font-semibold text-secondary-6 underline">
                                {chunks}
                            </Link>
                        ),
                    })}
                </p>
            ),
        },
        {
            question: t("faq.items.speaking.title"),
            answer: t("faq.items.speaking.content"),
            content: (
                <p className="mb-0">
                    {t.rich("faq.items.speaking.contentRich", {
                        ...rich,
                        mock: (chunks: ReactNode) => (
                            <Link href="/fide/mock-exams" className="font-semibold text-secondary-5 underline">
                                {chunks}
                            </Link>
                        ),
                        private: (chunks: ReactNode) => (
                            <Link href="/fide/private-courses" className="font-semibold text-secondary-2 underline">
                                {chunks}
                            </Link>
                        ),
                    })}
                </p>
            ),
        },
        {
            question: t("faq.items.choose.title"),
            answer: t("faq.items.choose.content"),
            content: (
                <p className="mb-0">
                    {t.rich("faq.items.choose.contentRich", {
                        ...rich,
                        link: (chunks: ReactNode) => (
                            <Link href="/fide/pack-fide#ContactForFIDECourses" className="font-semibold text-secondary-6 underline">
                                {chunks}
                            </Link>
                        ),
                    })}
                </p>
            ),
        },
    ];

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

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: t("breadcrumbs.home"),
                item: `${SITE}${homePath}`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: t("breadcrumbs.fide"),
                item: `${SITE}${fidePath}`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: t("breadcrumbs.current"),
                item: `${SITE}${packPath}`,
            },
        ],
    };

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${SITE}${packPath}#fide-pack-product`,
        name: t("schema.productName"),
        description: t("schema.productDescription"),
        image: [`${SITE}/images/pack-fide-hero.png`],
        brand: {
            "@type": "Brand",
            name: t("schema.brand"),
        },
        offers: [
            {
                "@type": "Offer",
                url: `${SITE}${packPath}#pack-pricing`,
                priceCurrency: pricingAutonomie?.currency ?? "CHF",
                price: pricingAutonomie?.amount ?? 499,
                availability: "https://schema.org/InStock",
            },
            {
                "@type": "Offer",
                url: `${SITE}${packPath}#pack-pricing`,
                priceCurrency: pricingAccompagne?.currency ?? "CHF",
                price: pricingAccompagne?.amount ?? 875,
                availability: "https://schema.org/InStock",
            },
        ],
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

            <div className="page-wrapper flex flex-col max-w-7xl m-auto">
                <HeroPackFide />
            </div>

            <WhatIsPackFideSection />
            <PackFidePricingSectionClient locale={locale} pricingAutonomie={pricingAutonomie} pricingAccompagne={pricingAccompagne} />
            <ContactForFide />
            <VideosSection locale={locale} />
            <DeferredPackFideExamsSection />

            <div className="max-w-screen overflow-hidden h-48 lg:h-64">
                <div className="bg-neutral-800 py-4 lg:py-8 my-12 custom-rotate overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:60s]">
                        <MarqueePackFideContent />
                    </Marquee>
                </div>
            </div>

            <div className="max-w-7xl m-auto pt-24 pb-24 px-4 lg:px-8">
                <DeferredPackFideReviews />
            </div>
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
                </div>
            </div>

            <div id="pack-fide-faq" className="py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <FideFaq
                        variant="thin"
                        title={t.rich("faq.title", rich)}
                        subtitle={t("faq.subtitle")}
                        items={faqItems.map((item) => ({
                            title: item.question,
                            content: item.content ?? <p>{item.answer}</p>,
                        }))}
                    />
                </div>
            </div>

            <PackFideNextStepsSection locale={locale} />
        </div>
    );
}
