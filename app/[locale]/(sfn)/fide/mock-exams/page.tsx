import { HeroMockExams } from "./components/HeroMockExams";
import { MockExamsPageSections } from "./components/MockExamsPageSections";
import { Locale } from "@/i18n";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

const FAQ_BY_LOCALE = {
    fr: [
        {
            question: "L'examen blanc suit-il vraiment le format du test FIDE ?",
            answer: "Oui. L'examen blanc est très fidèle au format du test FIDE, avec des consignes et un déroulé comparables. L'objectif est de vous placer dans des conditions au plus proche du réel, afin de réduire le stress lié à l'inconnu et de vous aider à comprendre précisément ce qui vous attend le jour du test FIDE.",
        },
        {
            question: "Quelles épreuves sont incluses ?",
            answer: "Les trois épreuves sont proposées: Parler, Comprendre et Lire/Écrire. L'ordre de passation est également respecté, afin de rester au plus proche des conditions réelles du test FIDE.",
        },
        {
            question: "Quels parcours sont disponibles ?",
            answer: "Vous pouvez passer les parcours A1-A2 ou A2-B1, selon votre objectif. Ce test blanc vous permet de vous situer clairement et de fixer un objectif réaliste pour votre progression.",
        },
        {
            question: "Combien de temps faut-il prévoir ?",
            answer: "Comptez environ 1 heure pour une passation complète. Prévoyez un moment calme, sans interruption, afin de maximiser votre concentration.",
        },
        {
            question: "La passation se fait-elle entièrement en ligne ?",
            answer: "Oui. Toute la passation se fait en ligne, du début à la fin, afin de favoriser un guidage pas à pas et de garantir une expérience fluide avec un feedback immédiat à l'issue de l'examen blanc.",
        },
        {
            question: "Ai-je besoin d'un micro spécifique ?",
            answer: "Non. Le micro intégré de votre ordinateur est suffisant, à condition que le son soit clair. Assurez-vous simplement d'être dans un environnement calme pour une meilleure qualité audio. Par ailleurs, une transcription écrite vous est toujours proposée afin de vérifier le bon fonctionnement.",
        },
        {
            question: "Puis-je passer le test sur mobile ?",
            answer: "Oui, mobile et ordinateur sont possibles. Tout le contenu Start French Now est multi-format. Pour la passation du test, nous recommandons toutefois l'ordinateur, qui reste plus confortable.",
        },
        {
            question: "Que se passe-t-il si je dois arrêter avant la fin ?",
            answer: "Vos réponses sont enregistrées au fur et à mesure, étape par étape, ce qui limite fortement la perte de données. Vous pouvez donc interrompre la passation puis la reprendre à tout moment, en toute sérénité.",
        },
        {
            question: "Que contient le résultat final ?",
            answer: "Comme dans le test FIDE, vous recevez un pourcentage de réussite, un score et un niveau estimé (A1/A2/B1) pour chaque épreuve du test. Vous obtenez également des axes d'amélioration concrets pour orienter votre travail.",
        },
        {
            question: "Les PDF et vidéos sont-ils inclus ?",
            answer: "Oui. La partie orale est accompagnée en vidéo, la partie Lire/Écrire en PDF, le tout étant disponible immédiatement et en permanence.",
        },
        {
            question: "Puis-je repasser le même examen blanc ?",
            answer: "Oui, autant de fois que vous le souhaitez.",
        },
        {
            question: "Quelle différence avec le Pack FIDE ?",
            answer: "La passation de l'examen blanc s'achète à l'unité. Le Pack FIDE inclut automatiquement tout le contenu Start French Now FIDE, c'est-à-dire: les scénarios actuels du test FIDE, régulièrement mis à jour, ainsi que des dizaines d'entraînements, de cours de français et de cours spécifiques FIDE.",
        },
        {
            question: "Quels moyens de paiement sont acceptés ?",
            answer: "Paiement sécurisé via Stripe: carte bancaire, Apple Pay, Google Pay, PayPal, Revolut et TWINT.",
        },
        {
            question: "Comment poser une question après achat ?",
            answer: "Vous pouvez nous écrire via la messagerie du dashboard ou par email à yohann@startfrenchnow.com.",
        },
    ],
    en: [
        {
            question: "Does the mock exam follow the official FIDE test format?",
            answer: "Yes. The mock exam is very close to the official FIDE test format, with similar instructions and flow. The goal is to put you in near-real conditions, reduce uncertainty, and help you understand exactly what to expect on test day.",
        },
        {
            question: "Which parts are included?",
            answer: "All three parts are included: Speaking, Listening and Reading/Writing. The sequence is also respected to stay as close as possible to real FIDE test conditions.",
        },
        {
            question: "Which tracks are available?",
            answer: "You can choose A1-A2 or A2-B1 depending on your objective. This mock test helps you place your level clearly and set a realistic progression target.",
        },
        {
            question: "How much time should I plan?",
            answer: "Plan around 1 hour for a full session. Choose a calm moment without interruptions to get the most reliable result.",
        },
        {
            question: "Is the full process fully online?",
            answer: "Yes. The full process is online from start to finish, with step-by-step guidance and immediate feedback at the end of your mock exam.",
        },
        {
            question: "Do I need a specific microphone?",
            answer: "No. Your computer's built-in microphone is usually enough if the sound is clear. We still recommend a quiet environment. A written transcription is also provided so you can verify audio capture quality.",
        },
        {
            question: "Can I take the test on mobile?",
            answer: "Yes, both mobile and desktop are possible. All Start French Now content is multi-device. For the test itself, desktop is still recommended for comfort.",
        },
        {
            question: "What if I stop before finishing?",
            answer: "Your answers are saved progressively, step by step, which greatly limits data loss. You can stop and resume later without losing your work.",
        },
        {
            question: "What do I get at the end?",
            answer: "As with the FIDE test logic, you get a success rate, a score, and an estimated level (A1/A2/B1) for each part, plus concrete improvement priorities.",
        },
        {
            question: "Are PDFs and videos included?",
            answer: "Yes. The speaking part includes video support, and Reading/Writing includes PDF support, with immediate and permanent access.",
        },
        {
            question: "Can I retake the same mock exam?",
            answer: "Yes, as many times as you want.",
        },
        {
            question: "What is the difference with the FIDE Pack?",
            answer: "The mock exam is purchased as a standalone product. The FIDE Pack automatically includes broader Start French Now FIDE content: regularly updated current FIDE test scenarios, plus many trainings, French courses, and dedicated FIDE courses.",
        },
        {
            question: "Which payment methods are accepted?",
            answer: "Secure Stripe checkout: card, Apple Pay, Google Pay, PayPal, Revolut and TWINT.",
        },
        {
            question: "How can I ask a question after purchase?",
            answer: "You can contact us via the dashboard messaging or by email at yohann@startfrenchnow.com.",
        },
    ],
} as const;

export default function FideMockExamsPage({ params: { locale } }: { params: { locale: Locale } }) {
    const isFr = locale === "fr";
    const homePath = isFr ? "/fr" : "/";
    const fidePath = isFr ? "/fr/fide" : "/fide";
    const mockExamsPath = isFr ? "/fr/fide/mock-exams" : "/fide/mock-exams";
    const checkoutPath = "/checkout/mock_exam?quantity=1&callbackUrl=/fide/mock-exams";
    const productName = isFr ? "Examen blanc du test FIDE (A1-A2 / A2-B1)" : "FIDE Test Mock Exam (A1-A2 / A2-B1)";
    const productDescription = isFr
        ? "Examen blanc en ligne très fidèle au test FIDE: passation guidée, score immédiat, correction détaillée, PDF et vidéos."
        : "Online mock exam very close to the FIDE test format: guided flow, instant score, detailed correction, PDF and videos.";

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
                name: isFr ? "Examens blancs du test FIDE" : "FIDE Test Mock Exams",
                item: `${SITE}${mockExamsPath}`,
            },
        ],
    };

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${SITE}${mockExamsPath}#mock-exam-product`,
        name: productName,
        description: productDescription,
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
                    name: isFr ? "Prix offre découverte" : "Discovery offer price",
                },
                {
                    "@type": "UnitPriceSpecification",
                    priceCurrency: "CHF",
                    price: "50.00",
                    priceType: "https://schema.org/ListPrice",
                    name: isFr ? "Prix normal" : "Regular price",
                },
            ],
        },
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
            <HeroMockExams />
            <MockExamsPageSections />
        </div>
    );
}
