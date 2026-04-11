import { HeroFide } from "./components/HeroFide";
import { Formateur } from "./components/Formateur";
import { ReviewsFide } from "./components/ReviewsFide";
import HowClassLook from "./components/HowClassLook";
import { FideFaq } from "./components/FideFaq";
import { ContactForFide } from "./components/ContactForFide";
import { ContactForFideCourses } from "./components/ContactForFideCourses";
import { Locale, normalizeLocale } from "@/i18n";
import { VideosSection } from "./components/VideosSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import Marquee from "@/app/components/ui/marquee";
import MarqueePackFideContent from "./components/MarqueePackFideContent";
import ExamsSection from "./components/ExamsSection";
import { PricingPlans } from "./components/PricingPlans";
import { WhatIsFide } from "./components/WhatIsFide";
import GetPdfBand from "./components/GetPdfBand";
import { client } from "@/app/lib/sanity.client";
import { getAmount } from "@/app/serverActions/stripeActions";
import { PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { groq } from "next-sanity";
import { getTranslations } from "next-intl/server";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

async function ExamsPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);

    
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");
    const hasReservation = !!session?.user?.lessons?.some((lesson) => lesson.eventType === "Fide Preparation Class" && lesson.totalPurchasedMinutes > 0);
    const tFaq = await getTranslations({ locale: locale, namespace: "Fide.FideFAQ" });
    const queryProduct = groq`
        *[_type=='product' && slug.current == $slug][0]
    `;

    const [autonomieProduct, accompagneProduct] = await Promise.all([
        client.fetch<ProductFetch>(queryProduct, { slug: "pack-fide" }),
        client.fetch<ProductFetch>(queryProduct, { slug: "pack-fide-accompagne" }),
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

    const stripTags = (value: string) => value.replace(/<[^>]*>/g, "").trim();
    const faqText = <K extends Parameters<typeof tFaq.raw>[0]>(key: K) => {
        const value = tFaq.raw(key);
        return stripTags(typeof value === "string" ? value : String(value ?? ""));
    };
    const canonicalPath = locale === "fr" ? "/fr/fide" : "/fide";
    const homePath = locale === "fr" ? "/fr" : "/";
    const canonicalUrl = `${SITE}${canonicalPath}`;

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: faqText("qu_est_ce_que_fide.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqText("qu_est_ce_que_fide.content"),
                },
            },
            {
                "@type": "Question",
                name: faqText("de_quel_niveau_besoin.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: [
                        faqText("de_quel_niveau_besoin.content.part1"),
                        faqText("de_quel_niveau_besoin.content.list.item1"),
                        faqText("de_quel_niveau_besoin.content.list.item2"),
                        faqText("de_quel_niveau_besoin.content.list.item3"),
                        faqText("de_quel_niveau_besoin.content.list.item4"),
                        faqText("de_quel_niveau_besoin.content.part2"),
                    ].join(" "),
                },
            },
            {
                "@type": "Question",
                name: faqText("ou_et_quand_passer_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqText("ou_et_quand_passer_examen.content.part1"),
                },
            },
            {
                "@type": "Question",
                name: faqText("parties_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: [faqText("parties_examen.content.part1"), faqText("parties_examen.content.list.item1"), faqText("parties_examen.content.list.item2")].join(" "),
                },
            },
            {
                "@type": "Question",
                name: faqText("combien_coute_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqText("combien_coute_examen.content"),
                },
            },
            {
                "@type": "Question",
                name: faqText("resultats_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqText("resultats_examen.content"),
                },
            },
            {
                "@type": "Question",
                name: faqText("validite_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqText("validite_examen.content"),
                },
            },
            {
                "@type": "Question",
                name: faqText("difficulte_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqText("difficulte_examen.content"),
                },
            },
        ],
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: locale === "fr" ? "Accueil" : "Home",
                item: `${SITE}${homePath}`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "FIDE",
                item: canonicalUrl,
            },
        ],
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="page-wrapper flex flex-col max-w-7xl m-auto">
                <HeroFide />
            </div>
            <div className="bg-neutral-800 color-neutral-100 flex justify-center overflow-hidden">
                <Formateur />
            </div>
            <GetPdfBand />
            <div className="max-w-7xl m-auto pt-24 pb-6 px-4 lg:px-8">
                <ReviewsFide />
            </div>
            <ContactForFide />
            <VideosSection hasPack={hasPack} locale={locale} userId={session?.user?._id} />
            <div className="max-w-screen overflow-hidden h-48 lg:h-64">
                <div className="bg-neutral-800 py-4 lg:py-8 my-12 custom-rotate overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:60s]">
                        <MarqueePackFideContent />
                    </Marquee>
                </div>
            </div>
            <ExamsSection hasPack={hasPack} />
            <div className="bg-neutral-800 color-neutral-100 py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <HowClassLook />
                </div>
            </div>
            <PricingPlans hasPack={hasPack} hasReservation={hasReservation} locale={locale} pricingAutonomie={pricingAutonomie} pricingAccompagne={pricingAccompagne} />
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
                </div>
            </div>
            <div className="max-w-7xl m-auto pt-24 pb-12 px-4 lg:px-8 text-neutral-800">
                <WhatIsFide />
            </div>
            <ContactForFide />
            <div id="FideFAQ" className="py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <FideFaq />
                </div>
            </div>
        </div>
    );
}

export default ExamsPage;
