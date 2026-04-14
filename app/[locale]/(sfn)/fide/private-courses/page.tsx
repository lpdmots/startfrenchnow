import { normalizeLocale } from "@/i18n";
import { Formateur } from "../components/Formateur";
import { ContactForFideBand } from "../components/ContactForFideBand";
import { ContactForFideCourses } from "../components/ContactForFideCourses";
import { FideFaq } from "../components/FideFaq";
import { HeroPrivateCourses } from "./components/HeroPrivateCourses";
import { PrivateCoursesPricingSection } from "./components/PrivateCoursesPricingSection";
import { PrivateCoursesNextStepsSection } from "./components/PrivateCoursesNextStepsSection";
import { DeferredPrivateCoursesHowClassLook } from "./components/DeferredPrivateCoursesHowClassLook";
import { DeferredPrivateCoursesReviews } from "./components/DeferredPrivateCoursesReviews";
import LinkArrow from "@/app/components/common/LinkArrow";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

type PrivateCoursesFaqItem = {
    question: string;
    answer: string;
    content?: ReactNode;
};

export default async function FidePrivateCoursesPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);

    const isFr = locale === "fr";
    const t = await getTranslations({ locale, namespace: "Fide.PrivateCoursesPage" });
    const faqT = await getTranslations({ locale, namespace: "Fide.PrivateCoursesFaq" });
    const homePath = isFr ? "/fr" : "/";
    const fidePath = isFr ? "/fr/fide" : "/fide";
    const privateCoursesPath = isFr ? "/fr/fide/private-courses" : "/fide/private-courses";
    const offersTitleNode = (
        <>
            {t("offersTitle.prefix")} <span className="heading-span-secondary-2">{t("offersTitle.highlight")}</span>
        </>
    );
    const faqTitleNode = (
        <>
            <span className="heading-span-secondary-2">FAQ</span> {t("faqTitleSuffix")}
        </>
    );

    const faqItems: PrivateCoursesFaqItem[] = [
        {
            question: faqT("items.audience.title"),
            answer: faqT("items.audience.content"),
        },
        {
            question: faqT("items.online.title"),
            answer: faqT("items.online.content"),
        },
        {
            question: faqT("items.scenarios.title"),
            answer: faqT("items.scenarios.content"),
        },
        {
            question: faqT("items.hours.title"),
            answer: faqT("items.hours.content"),
            content: (
                <>
                    <p>{faqT("items.hours.contentLine1")}</p>
                    <p>{faqT("items.hours.contentLine2")}</p>
                    <div className="flex justify-end">
                        <LinkArrow url="https://calendly.com/yohann-startfrenchnow/15min">{faqT("items.hours.cta")}</LinkArrow>
                    </div>
                </>
            ),
        },
        {
            question: faqT("items.quickBooking.title"),
            answer: faqT("items.quickBooking.content"),
        },
        {
            question: faqT("items.pack.title"),
            answer: faqT("items.pack.content"),
            content: (
                <>
                    <p>{faqT("items.pack.content")}</p>
                    <div className="flex justify-end">
                        <LinkArrow url="/fide/pack-fide" target="_self">
                            {faqT("items.pack.cta")}
                        </LinkArrow>
                    </div>
                </>
            ),
        },
        {
            question: faqT("items.afterLesson.title"),
            answer: faqT("items.afterLesson.content"),
        },
        {
            question: faqT("items.getStarted.title"),
            answer: faqT("items.getStarted.content"),
            content: (
                <>
                    <p>{faqT("items.getStarted.contentLine1")}</p>
                    <p>{faqT("items.getStarted.contentLine2")}</p>
                    <div className="flex justify-end">
                        <LinkArrow url="https://calendly.com/yohann-startfrenchnow/15min">{faqT("items.getStarted.ctaPrimary")}</LinkArrow>
                    </div>
                    <div className="flex justify-end">
                        <LinkArrow url="#ContactForFIDECourses" target="_self">
                            {faqT("items.getStarted.ctaSecondary")}
                        </LinkArrow>
                    </div>
                </>
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
                item: `${SITE}${privateCoursesPath}`,
            },
        ],
    };

    const serviceJsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${SITE}${privateCoursesPath}#private-fide-coaching`,
        serviceType: t("schema.serviceType"),
        name: t("schema.name"),
        description: t("schema.description"),
        provider: {
            "@type": "Organization",
            name: t("schema.brand"),
            url: SITE,
        },
        areaServed: "CH",
        availableLanguage: ["fr", "en"],
        url: `${SITE}${privateCoursesPath}`,
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

            <div className="page-wrapper flex flex-col max-w-7xl m-auto">
                <HeroPrivateCourses />
            </div>

            <div className="bg-neutral-800 color-neutral-100 flex justify-center overflow-hidden">
                <Formateur />
            </div>

            <ContactForFideBand />

            <PrivateCoursesPricingSection locale={locale} site={SITE} title={offersTitleNode} subtitle={t("offersSubtitle")} />

            <div className="bg-neutral-800 color-neutral-100 py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <DeferredPrivateCoursesHowClassLook />
                </div>
            </div>

            <div className="max-w-7xl m-auto pt-24 pb-24 px-4 lg:px-8">
                <DeferredPrivateCoursesReviews />
            </div>
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
                </div>
            </div>

            <div id="FidePrivateCoursesFAQ" className="py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <FideFaq
                        variant="thin"
                        title={faqTitleNode}
                        subtitle={t("faqSubtitle")}
                        items={faqItems.map((item) => ({
                            title: item.question,
                            content: item.content ?? <p>{item.answer}</p>,
                        }))}
                    />
                </div>
            </div>
            <PrivateCoursesNextStepsSection locale={locale} />
        </div>
    );
}
