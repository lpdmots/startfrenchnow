import { HeroMockExams } from "./components/HeroMockExams";
import { MockExamsPageSections } from "./components/MockExamsPageSections";
import { Locale } from "@/i18n";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

const FAQ_BY_LOCALE = {
    fr: [
        {
            question: "L'examen blanc suit-il vraiment le format FIDE ?",
            answer: "Oui, l'examen blanc est très fidèle au format FIDE, avec des consignes et un déroulé comparables.",
        },
        {
            question: "Quelles épreuves sont proposées ?",
            answer: "Les trois épreuves sont incluses: Parler, Comprendre et Lire/Écrire.",
        },
        {
            question: "Quels parcours sont disponibles ?",
            answer: "Les parcours A1-A2 et A2-B1 sont proposés selon votre objectif.",
        },
        {
            question: "Combien de temps faut-il prévoir ?",
            answer: "Comptez environ 1 heure pour une passation complète.",
        },
        {
            question: "La passation est-elle 100% en ligne ?",
            answer: "Oui. Toute la passation se fait en ligne, du début à la fin.",
        },
        {
            question: "Que contient le résultat final ?",
            answer: "Vous recevez un pourcentage de réussite, un score, un niveau estimé (A1/A2/B1) par épreuve et des axes d'amélioration concrets.",
        },
        {
            question: "Les PDF et vidéos sont-ils inclus ?",
            answer: "Oui. La partie orale est accompagnée en vidéo et la partie Lire/Écrire en PDF, avec un accès immédiat et permanent.",
        },
        {
            question: "Quels moyens de paiement sont acceptés ?",
            answer: "Paiement sécurisé via Stripe: carte bancaire, Apple Pay, Google Pay, PayPal, Revolut et TWINT.",
        },
    ],
    en: [
        {
            question: "Does the mock exam follow the official FIDE format?",
            answer: "Yes. The mock exam is very close to the official FIDE format, with comparable instructions and flow.",
        },
        {
            question: "Which parts are included?",
            answer: "All three parts are included: Speaking, Listening and Reading/Writing.",
        },
        {
            question: "Which tracks are available?",
            answer: "You can choose A1-A2 or A2-B1 depending on your objective.",
        },
        {
            question: "How much time should I plan?",
            answer: "Plan around 1 hour for a full session.",
        },
        {
            question: "Is the full exam process online?",
            answer: "Yes. The full process is online from start to finish.",
        },
        {
            question: "What do I get at the end?",
            answer: "You get a success rate, a score, an estimated level (A1/A2/B1) for each part, and clear improvement priorities.",
        },
        {
            question: "Are PDFs and videos included?",
            answer: "Yes. The speaking part is supported by video and the reading/writing part by PDF, with immediate and permanent access.",
        },
        {
            question: "Which payment methods are accepted?",
            answer: "Secure Stripe checkout: card, Apple Pay, Google Pay, PayPal, Revolut and TWINT.",
        },
    ],
} as const;

export default function FideMockExamsPage({ params: { locale } }: { params: { locale: Locale } }) {
    const isFr = locale === "fr";
    const homePath = isFr ? "/fr" : "/";
    const fidePath = isFr ? "/fr/fide" : "/fide";
    const mockExamsPath = isFr ? "/fr/fide/mock-exams" : "/fide/mock-exams";

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_BY_LOCALE[isFr ? "fr" : "en"].map((item) => ({
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
                name: isFr ? "Examens blancs FIDE" : "FIDE Mock Exams",
                item: `${SITE}${mockExamsPath}`,
            },
        ],
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <HeroMockExams />
            <MockExamsPageSections />
        </div>
    );
}
