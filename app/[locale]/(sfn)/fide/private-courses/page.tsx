import { Locale } from "@/i18n";
import { Formateur } from "../components/Formateur";
import { WhatIsFide } from "../components/WhatIsFide";
import HowClassLook from "../components/HowClassLook";
import { ReviewsFide } from "../components/ReviewsFide";
import { ContactForFide } from "../components/ContactForFide";
import PriceSliderFide from "../components/PriceSliderFide";
import { ContactForFideCourses } from "../components/ContactForFideCourses";
import { FideFaq } from "../components/FideFaq";
import { AdditionalCourses } from "../components/AdditionalCourses";
import Link from "next-intl/link";
import { HeroPrivateCourses } from "./components/HeroPrivateCourses";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

const PAGE_CONTENT = {
    fr: {
        offersTitle: "Choisissez votre rythme de coaching privé",
        offersSubtitle: "Un format court, régulier ou intensif selon votre délai avant l'examen FIDE.",
        offerCards: [
            {
                title: "Sprint avant examen",
                description: "1 à 2 heures ciblées pour sécuriser les scénarios clés et gagner en confiance à l'oral.",
                ctaLabel: "Je réserve mes heures",
                ctaHref: "#plans",
            },
            {
                title: "Progression encadrée",
                description: "Plan hebdomadaire personnalisé pour corriger vos points faibles et stabiliser votre niveau.",
                ctaLabel: "Construire mon plan",
                ctaHref: "#plans",
            },
            {
                title: "Préparation intensive",
                description: "Accompagnement renforcé si votre date d'examen est proche, avec priorités très concrètes.",
                ctaLabel: "Voir les formules",
                ctaHref: "#plans",
            },
        ],
        resourceTitle: "Complétez votre préparation",
        resourceLinks: [
            {
                title: "Passer un examen blanc FIDE",
                description: "Évaluez votre niveau actuel et identifiez vos axes d'amélioration avant les cours privés.",
                href: "/fide/mock-exams",
                ctaLabel: "Voir les examens blancs",
            },
            {
                title: "Découvrir la plateforme FIDE complète",
                description: "Ajoutez un entraînement autonome entre vos cours pour progresser plus vite.",
                href: "/fide",
                ctaLabel: "Voir la plateforme FIDE",
            },
        ],
        faqTitle: "FAQ des cours privés FIDE",
        faqSubtitle: "Réponses rapides pour choisir la formule la plus adaptée à votre objectif.",
    },
    en: {
        offersTitle: "Choose your private coaching pace",
        offersSubtitle: "Short, regular, or intensive format depending on your timeline before the FIDE exam.",
        offerCards: [
            {
                title: "Exam sprint",
                description: "1 to 2 focused hours to secure key scenarios and boost your speaking confidence.",
                ctaLabel: "Book my hours",
                ctaHref: "#plans",
            },
            {
                title: "Structured progression",
                description: "A personalized weekly plan to fix weak points and stabilize your level.",
                ctaLabel: "Build my plan",
                ctaHref: "#plans",
            },
            {
                title: "Intensive preparation",
                description: "Stronger support when your exam date is close, with highly concrete priorities.",
                ctaLabel: "See options",
                ctaHref: "#plans",
            },
        ],
        resourceTitle: "Complete your preparation",
        resourceLinks: [
            {
                title: "Take a FIDE mock exam",
                description: "Assess your current level and identify improvement priorities before private lessons.",
                href: "/fide/mock-exams",
                ctaLabel: "See mock exams",
            },
            {
                title: "Explore the full FIDE platform",
                description: "Add self-study between private lessons to improve faster.",
                href: "/fide",
                ctaLabel: "See FIDE platform",
            },
        ],
        faqTitle: "Private FIDE Coaching FAQ",
        faqSubtitle: "Quick answers to choose the right private coaching plan for your goal.",
    },
} as const;

const PRIVATE_COURSES_FAQ = {
    fr: [
        {
            question: "À qui s’adressent les cours privés FIDE ?",
            answer: "Les cours s’adressent aux personnes qui préparent le test FIDE A1-A2 ou A2-B1, que vous partiez de zéro ou que vous vouliez sécuriser votre niveau avant l’examen.",
        },
        {
            question: "Les cours privés sont-ils 100% en ligne ?",
            answer: "Oui. Les cours se font en visioconférence avec un accompagnement pas à pas, pour vous entraîner dans des conditions simples et flexibles.",
        },
        {
            question: "Travaillez-vous les scénarios actuels du test FIDE ?",
            answer: "Oui. Les séances sont basées sur des scénarios pertinents pour le test, afin de renforcer votre aisance orale et votre compréhension des consignes.",
        },
        {
            question: "Combien d’heures faut-il prévoir ?",
            answer: "Le nombre d’heures dépend de votre niveau actuel et de votre objectif. Après une première séance, un plan personnalisé vous aide à choisir un volume réaliste.",
        },
        {
            question: "Puis-je réserver rapidement si mon examen est proche ?",
            answer: "Oui. Vous pouvez réserver des séances rapidement selon les créneaux disponibles, y compris pour une préparation intensive de dernière minute.",
        },
        {
            question: "Puis-je combiner ces cours avec le Pack FIDE ?",
            answer: "Oui. Les cours privés complètent très bien le Pack FIDE: vous avancez en autonomie entre les séances, puis vous consolidez les points difficiles avec un coach.",
        },
        {
            question: "Que se passe-t-il après chaque cours ?",
            answer: "Vous repartez avec des priorités claires, des axes de correction et des exercices ciblés pour progresser rapidement entre deux séances.",
        },
        {
            question: "Comment commencer ?",
            answer: "Vous pouvez réserver un premier rendez-vous ou envoyer un message avec votre objectif, votre niveau et votre date d’examen pour recevoir une recommandation adaptée.",
        },
    ],
    en: [
        {
            question: "Who are private FIDE courses for?",
            answer: "These courses are for learners preparing the FIDE test (A1-A2 or A2-B1), whether you are starting from scratch or aiming to secure your level before exam day.",
        },
        {
            question: "Are private lessons fully online?",
            answer: "Yes. Lessons are delivered online with step-by-step coaching so you can train in a flexible and practical format.",
        },
        {
            question: "Do you train with current FIDE scenarios?",
            answer: "Yes. Lessons focus on relevant FIDE-style scenarios to improve speaking confidence and understanding of test instructions.",
        },
        {
            question: "How many hours do I need?",
            answer: "It depends on your current level and your target. After a first session, you get a clear personalized plan with a realistic number of hours.",
        },
        {
            question: "Can I book quickly if my exam is soon?",
            answer: "Yes. Depending on availability, you can book quickly, including intensive short-term preparation before your exam.",
        },
        {
            question: "Can I combine private lessons with the FIDE Pack?",
            answer: "Yes. Private coaching works very well with the FIDE Pack: self-study between lessons, then targeted coaching on weak points.",
        },
        {
            question: "What do I get after each lesson?",
            answer: "You leave each session with clear priorities, corrections, and focused practice to keep progressing between lessons.",
        },
        {
            question: "How do I get started?",
            answer: "You can book a first meeting or send your objective, current level, and exam date to receive a tailored recommendation.",
        },
    ],
} as const;

export default function FidePrivateCoursesPage({ params: { locale } }: { params: { locale: Locale } }) {
    const isFr = locale === "fr";
    const pageContent = PAGE_CONTENT[isFr ? "fr" : "en"];
    const homePath = isFr ? "/fr" : "/";
    const fidePath = isFr ? "/fr/fide" : "/fide";
    const privateCoursesPath = isFr ? "/fr/fide/private-courses" : "/fide/private-courses";
    const callbackPath = `${privateCoursesPath}#plans`;

    const faqItems = PRIVATE_COURSES_FAQ[isFr ? "fr" : "en"];

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
                name: isFr ? "Accueil" : "Home",
                item: `${SITE}${homePath}`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "FIDE",
                item: `${SITE}${fidePath}`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: isFr ? "Cours privés FIDE" : "Private FIDE coaching",
                item: `${SITE}${privateCoursesPath}`,
            },
        ],
    };

    const serviceJsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${SITE}${privateCoursesPath}#private-fide-coaching`,
        serviceType: isFr ? "Cours privés de préparation au test FIDE" : "Private coaching for FIDE test preparation",
        name: isFr ? "Cours privés FIDE en ligne" : "Private FIDE coaching online",
        description: isFr
            ? "Préparation personnalisée au test FIDE (A1-A2 / A2-B1) avec accompagnement individuel."
            : "Personalized one-to-one coaching for FIDE test preparation (A1-A2 / A2-B1).",
        provider: {
            "@type": "Organization",
            name: "Start French Now",
            url: SITE,
        },
        areaServed: "CH",
        availableLanguage: ["fr", "en"],
        url: `${SITE}${privateCoursesPath}`,
    };

    const offersJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: pageContent.offersTitle,
        itemListElement: pageContent.offerCards.map((offer, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Service",
                name: offer.title,
                description: offer.description,
                provider: {
                    "@type": "Organization",
                    name: "Start French Now",
                    url: SITE,
                },
            },
        })),
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offersJsonLd) }} />

            <div className="page-wrapper flex flex-col max-w-7xl m-auto">
                <HeroPrivateCourses />
            </div>

            <div className="bg-neutral-800 color-neutral-100 flex justify-center overflow-hidden">
                <Formateur />
            </div>

            <div className="max-w-7xl m-auto py-24 px-4 lg:px-8">
                <WhatIsFide />
            </div>

            <div className="bg-neutral-800 color-neutral-100 py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <HowClassLook />
                </div>
            </div>

            <div className="max-w-7xl m-auto pt-24 pb-6 px-4 lg:px-8">
                <ReviewsFide />
            </div>

            <ContactForFide />

            <div className="py-20 px-4 lg:px-8">
                <div className="max-w-7xl m-auto flex flex-col gap-10">
                    <div className="text-center">
                        <h2 className="display-2 mb-4">{pageContent.offersTitle}</h2>
                        <p className="mb-0">{pageContent.offersSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pageContent.offerCards.map((offer) => (
                            <article key={offer.title} className="card link-card h-full p-6 flex flex-col gap-6">
                                <h3 className="text-2xl font-bold mb-0">{offer.title}</h3>
                                <p className="mb-0 grow">{offer.description}</p>
                                <Link href={offer.ctaHref} className="btn btn-secondary small w-full text-center">
                                    {offer.ctaLabel}
                                </Link>
                            </article>
                        ))}
                    </div>
                    <h3 className="text-2xl font-bold mb-0">{pageContent.resourceTitle}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pageContent.resourceLinks.map((resource) => (
                            <article key={resource.title} className="rounded-2xl border border-neutral-300 bg-neutral-100 p-6 flex flex-col gap-4">
                                <h3 className="text-xl font-bold mb-0">{resource.title}</h3>
                                <p className="mb-0 grow">{resource.description}</p>
                                <Link href={resource.href} className="btn btn-tertiary small w-full md:w-auto text-center">
                                    {resource.ctaLabel}
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </div>

            <div id="plans" className="py-24 px-4 lg:px-8">
                <PriceSliderFide locale={locale} callbackPath={callbackPath} />
            </div>

            <div className="py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <AdditionalCourses />
                </div>
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
                        title={pageContent.faqTitle}
                        subtitle={pageContent.faqSubtitle}
                        items={faqItems.map((item) => ({
                            title: item.question,
                            content: <p>{item.answer}</p>,
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}
