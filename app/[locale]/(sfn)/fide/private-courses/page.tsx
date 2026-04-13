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

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

type PrivateCoursesFaqItem = {
    question: string;
    answer: string;
    content?: ReactNode;
};

const PAGE_CONTENT = {
    fr: {
        faqTitle: "FAQ des cours privés FIDE",
        faqSubtitle: "Réponses rapides pour choisir la formule la plus adaptée à votre objectif.",
    },
    en: {
        faqTitle: "Private FIDE Coaching FAQ",
        faqSubtitle: "Quick answers to choose the right private coaching plan for your goal.",
    },
} as const;

const PRIVATE_COURSES_FAQ: Record<"fr" | "en", PrivateCoursesFaqItem[]> = {
    fr: [
        {
            question: "À qui s’adressent les cours privés FIDE ?",
            answer: "Ces cours s’adressent aux candidats qui préparent le test FIDE (A1-A2 ou A2-B1), que vous partiez de zéro ou que vous souhaitiez consolider votre niveau avant l’examen.",
        },
        {
            question: "Les cours privés sont-ils 100% en ligne ?",
            answer: "Oui. Les cours se déroulent en visioconférence, avec un accompagnement pas à pas et des horaires flexibles.",
        },
        {
            question: "Travaillez-vous les scénarios actuels du test FIDE ?",
            answer: "Oui. Nous travaillons les scénarios les plus récents du test, basés sur les retours de nos étudiants ayant passé l’examen, pour vous entraîner sur des situations réalistes.",
        },
        {
            question: "Combien d’heures faut-il prévoir ?",
            answer: "Le volume dépend de votre niveau actuel, de votre objectif et de votre délai. Si vous hésitez, nous vous aidons à définir gratuitement un plan personnalisé et réaliste.",
            content: (
                <>
                    <p>Le volume dépend de votre niveau actuel, de votre objectif et de votre délai.</p>
                    <p>Si vous hésitez, nous vous aidons à définir gratuitement un plan personnalisé et réaliste.</p>
                    <div className="flex justify-end">
                        <LinkArrow url="https://calendly.com/yohann-startfrenchnow/15min">Demander un plan gratuit</LinkArrow>
                    </div>
                </>
            ),
        },
        {
            question: "Puis-je réserver rapidement si mon examen est proche ?",
            answer: "Oui. Selon les disponibilités, vous pouvez démarrer rapidement, y compris en préparation intensive de dernière minute.",
        },
        {
            question: "Puis-je combiner ces cours avec le Pack FIDE ?",
            answer: "Oui. Les cours privés complètent parfaitement le Pack FIDE: vous progressez en autonomie entre les séances, puis vous corrigez vos points faibles avec un coach.",
            content: (
                <>
                    <p>Oui. Les cours privés complètent parfaitement le Pack FIDE: vous progressez en autonomie entre les séances, puis vous corrigez vos points faibles avec un coach.</p>
                    <div className="flex justify-end">
                        <LinkArrow url="/fide/pack-fide" target="_self">
                            Voir le Pack FIDE e-learning
                        </LinkArrow>
                    </div>
                </>
            ),
        },
        {
            question: "Que se passe-t-il après chaque cours ?",
            answer: "Après chaque séance, vous repartez avec des priorités claires, des corrections concrètes et des exercices ciblés pour progresser rapidement.",
        },
        {
            question: "Comment commencer ?",
            answer: "Réservez un premier entretien gratuit ou envoyez-nous votre objectif, votre niveau et votre date d’examen. Nous vous proposerons une formule adaptée.",
            content: (
                <>
                    <p>Réservez un premier entretien gratuit ou envoyez-nous votre objectif, votre niveau et votre date d’examen.</p>
                    <p>Nous vous proposerons une formule adaptée.</p>
                    <div className="flex justify-end">
                        <LinkArrow url="https://calendly.com/yohann-startfrenchnow/15min">Réserver un premier entretien</LinkArrow>
                    </div>
                    <div className="flex justify-end">
                        <LinkArrow url="#ContactForFIDECourses" target="_self">
                            Envoyer un message
                        </LinkArrow>
                    </div>
                </>
            ),
        },
    ],
    en: [
        {
            question: "Who are private FIDE courses for?",
            answer: "These lessons are for learners preparing the FIDE test (A1-A2 or A2-B1), whether you are starting from zero or want to secure your level before exam day.",
        },
        {
            question: "Are private lessons fully online?",
            answer: "Yes. All lessons are online, with step-by-step coaching and flexible scheduling.",
        },
        {
            question: "Do you train with current FIDE scenarios?",
            answer: "Yes. We train with the most up-to-date scenarios based on feedback from students who have recently taken the exam.",
        },
        {
            question: "How many hours do I need?",
            answer: "It depends on your current level, target, and timeline. If needed, we can help you define a clear and realistic study plan for free.",
            content: (
                <>
                    <p>It depends on your current level, target, and timeline.</p>
                    <p>If needed, we can help you define a clear and realistic study plan for free.</p>
                    <div className="flex justify-end">
                        <LinkArrow url="https://calendly.com/yohann-startfrenchnow/15min">Request a free study plan</LinkArrow>
                    </div>
                </>
            ),
        },
        {
            question: "Can I book quickly if my exam is soon?",
            answer: "Yes. Depending on availability, you can start quickly, including intensive last-minute preparation.",
        },
        {
            question: "Can I combine private lessons with the FIDE Pack?",
            answer: "Yes. Private coaching pairs very well with the FIDE Pack: self-study between lessons, then targeted coaching on your weak points.",
            content: (
                <>
                    <p>Yes. Private coaching pairs very well with the FIDE Pack: self-study between lessons, then targeted coaching on your weak points.</p>
                    <div className="flex justify-end">
                        <LinkArrow url="/fide/pack-fide" target="_self">
                            See the FIDE e-learning pack
                        </LinkArrow>
                    </div>
                </>
            ),
        },
        {
            question: "What do I get after each lesson?",
            answer: "After each lesson, you leave with clear priorities, concrete corrections, and focused exercises to keep improving.",
        },
        {
            question: "How do I get started?",
            answer: "Book a free first call or send us your goal, current level, and exam date. We will recommend the best option for you.",
            content: (
                <>
                    <p>Book a free first call or send us your goal, current level, and exam date.</p>
                    <p>We will recommend the best option for you.</p>
                    <div className="flex justify-end">
                        <LinkArrow url="https://calendly.com/yohann-startfrenchnow/15min">Book a first call</LinkArrow>
                    </div>
                    <div className="flex justify-end">
                        <LinkArrow url="#ContactForFIDECourses" target="_self">
                            Send a message
                        </LinkArrow>
                    </div>
                </>
            ),
        },
    ],
};

export default async function FidePrivateCoursesPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);

    const isFr = locale === "fr";
    const pageContent = PAGE_CONTENT[isFr ? "fr" : "en"];
    const homePath = isFr ? "/fr" : "/";
    const fidePath = isFr ? "/fr/fide" : "/fide";
    const privateCoursesPath = isFr ? "/fr/fide/private-courses" : "/fide/private-courses";
    const offersTitleNode = (
        <>
            Choisissez votre rythme de <span className="heading-span-secondary-2">coaching privé</span>
        </>
    );
    const faqTitleNode = isFr ? (
        <>
            <span className="heading-span-secondary-2">FAQ</span> des cours privés FIDE
        </>
    ) : (
        <>
            <span className="heading-span-secondary-2">FAQ</span> for private FIDE coaching
        </>
    );

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
        description: isFr ? "Préparation personnalisée au test FIDE (A1-A2 / A2-B1) avec accompagnement individuel." : "Personalized one-to-one coaching for FIDE test preparation (A1-A2 / A2-B1).",
        provider: {
            "@type": "Organization",
            name: "Start French Now",
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

            <PrivateCoursesPricingSection locale={locale} site={SITE} title={offersTitleNode} subtitle="Choisissez une formule claire selon votre délai et votre niveau actuel." />

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
                        subtitle={pageContent.faqSubtitle}
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
