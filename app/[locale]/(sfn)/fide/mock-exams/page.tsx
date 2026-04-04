import { HeroMockExams } from "./components/HeroMockExams";
import { MockExamsPageSections } from "./components/MockExamsPageSections";
import { mockExamFaqItemKeys } from "./faqItemKeys";
import { authOptions } from "@/app/lib/authOptions";
import { getMockExamCheckoutEligibility } from "@/app/serverActions/mockExamActions";
import { Locale } from "@/i18n";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

export default async function FideMockExamsPage({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslations({ locale: locale, namespace: "Fide.MockExamsPage.Page" });
    const faqT = await getTranslations({ locale: locale, namespace: "Fide.MockExamsPage.Faq" });
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id;
    const checkoutEligibility = userId ? await getMockExamCheckoutEligibility(userId) : null;
    const checkoutDisabled = checkoutEligibility ? !checkoutEligibility.canCheckout : false;
    const checkoutDisabledReason = checkoutEligibility?.reason || null;
    const isFr = locale === "fr";
    const homePath = isFr ? "/fr" : "/";
    const fidePath = isFr ? "/fr/fide" : "/fide";
    const mockExamsPath = isFr ? "/fr/fide/mock-exams" : "/fide/mock-exams";
    const callbackPath = "/fide/mock-exams";
    const checkoutPath = `/checkout/mock_exam?quantity=1&callbackUrl=${encodeURIComponent(callbackPath)}`;
    const faqItems = mockExamFaqItemKeys.map((itemKey) => ({
        question: faqT(`items.${itemKey}.title` as never),
        answer: faqT(`items.${itemKey}.content` as never),
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

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: t("home"),
                item: `${SITE}${homePath}`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: t("fide"),
                item: `${SITE}${fidePath}`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: t("breadcrumbCurrent"),
                item: `${SITE}${mockExamsPath}`,
            },
        ],
    };

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${SITE}${mockExamsPath}#mock-exam-product`,
        name: t("productName"),
        description: t("productDescription"),
        image: [`${SITE}/images/mock-exam-hero.png`],
        brand: {
            "@type": "Brand",
            name: "Start French Now",
        },
        offers: {
            "@type": "Offer",
            url: `${SITE}${checkoutPath}`,
            priceCurrency: "CHF",
            price: "10.00",
            availability: "https://schema.org/InStock",
            seller: {
                "@type": "Organization",
                name: "Start French Now",
                url: SITE,
            },
            priceSpecification: [
                {
                    "@type": "UnitPriceSpecification",
                    priceCurrency: "CHF",
                    price: "10.00",
                    name: t("discoveryOfferPriceName"),
                },
                {
                    "@type": "UnitPriceSpecification",
                    priceCurrency: "CHF",
                    price: "50.00",
                    priceType: "https://schema.org/ListPrice",
                    name: t("regularPriceName"),
                },
            ],
        },
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
            <HeroMockExams checkoutDisabled={checkoutDisabled} checkoutDisabledReason={checkoutDisabledReason} />
            <MockExamsPageSections checkoutDisabled={checkoutDisabled} checkoutDisabledReason={checkoutDisabledReason} />
        </div>
    );
}
