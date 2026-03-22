import { FideFaq } from "../../../components/FideFaq";
import { SlideFromLeft, SlideFromRight } from "@/app/components/animations/Slides";

const mockExamFaqItems = [
    {
        title: "L'examen blanc reprend-il réellement le format du test FIDE ?",
        content: (
            <p>
                Oui. L&apos;examen blanc est très fidèle au format du test FIDE, avec des consignes et un déroulé comparables. L&apos;objectif est de vous placer dans des conditions au plus proche du réel,
                afin de réduire le stress lié à l&apos;inconnu et de vous aider à comprendre précisément ce qui vous attend le jour du test FIDE.
            </p>
        ),
    },
    {
        title: "Quelles épreuves sont incluses ?",
        content: <p>Les trois épreuves sont proposées: Parler, Comprendre et Lire/Écrire. L&apos;ordre de passation est également respecté, afin de rester au plus proche des conditions réelles du test FIDE.</p>,
    },
    {
        title: "Quels parcours sont disponibles ?",
        content: (
            <p>
                Vous pouvez passer les parcours A1-A2 ou A2-B1, selon votre objectif. Ce test blanc vous permet de vous situer clairement et de fixer un objectif réaliste pour votre progression.
            </p>
        ),
    },
    {
        title: "Combien de temps faut-il prévoir ?",
        content: <p>Comptez environ 1 heure pour une passation complète. Prévoyez un moment calme, sans interruption, afin de maximiser votre concentration.</p>,
    },
    {
        title: "La passation se fait-elle entièrement en ligne ?",
        content: (
            <p>
                Oui. Toute la passation se fait en ligne, du début à la fin, afin de favoriser un guidage pas à pas et de garantir une expérience fluide avec un feedback immédiat à l&apos;issue de
                l&apos;examen blanc.
            </p>
        ),
    },
    {
        title: "Ai-je besoin d'un micro spécifique ?",
        content: (
            <p>
                Non. Le micro intégré de votre ordinateur est suffisant, à condition que le son soit clair. Assurez-vous simplement d&apos;être dans un environnement calme pour une meilleure qualité
                audio. Par ailleurs, une transcription écrite vous est toujours proposée afin de vérifier le bon fonctionnement.
            </p>
        ),
    },
    {
        title: "Puis-je passer le test sur mobile ?",
        content: (
            <p>
                Oui, mobile et ordinateur sont possibles. Tout le contenu Start French Now est multi-format. Pour la passation du test, nous recommandons toutefois l&apos;ordinateur, qui
                reste plus confortable.
            </p>
        ),
    },
    {
        title: "Que se passe-t-il si je dois arrêter avant la fin ?",
        content: (
            <p>
                Vos réponses sont enregistrées au fur et à mesure, étape par étape, ce qui limite fortement la perte de données. Vous pouvez donc interrompre la passation puis la reprendre à tout
                moment, en toute sérénité.
            </p>
        ),
    },
    {
        title: "Que contient le résultat final ?",
        content: (
            <p>
                Comme dans le test FIDE, vous recevez un pourcentage de réussite, un score et un niveau estimé (A1/A2/B1) pour chaque épreuve du test. Vous obtenez également des axes
                d&apos;amélioration concrets pour orienter votre travail.
            </p>
        ),
    },
    {
        title: "Les PDF et vidéos sont-ils inclus ?",
        content: <p>Oui. La partie orale est accompagnée en vidéo, la partie Lire/Écrire en PDF, le tout étant disponible immédiatement et en permanence.</p>,
    },
    {
        title: "Puis-je repasser le même examen blanc ?",
        content: <p>Oui, autant de fois que vous le souhaitez.</p>,
    },
    {
        title: "Quelle différence avec le Pack FIDE ?",
        content: (
            <p>
                La passation de l&apos;examen blanc s&apos;achète à l&apos;unité. Le Pack FIDE inclut automatiquement tout le contenu Start French Now FIDE, c&apos;est-à-dire: les scénarios actuels
                du test FIDE, régulièrement mis à jour, ainsi que des dizaines d&apos;entraînements, de cours de français et de cours spécifiques FIDE.
            </p>
        ),
    },
    {
        title: "Quels moyens de paiement sont acceptés ?",
        content: <p>Paiement sécurisé via Stripe: carte bancaire, Apple Pay, Google Pay, PayPal, Revolut et TWINT.</p>,
    },
    {
        title: "Comment poser une question après achat ?",
        content: (
            <p>
                Vous pouvez nous écrire via la messagerie du dashboard ou par email à{" "}
                <a className="underline decoration-neutral-500 underline-offset-2" href="mailto:yohann@startfrenchnow.com">
                    yohann@startfrenchnow.com
                </a>
                .
            </p>
        ),
    },
];

export function MockExamsFaqSection() {
    return (
        <section id="mock-exams-faq" className="pt-14 pb-6 lg:pt-24 lg:pb-10">
            <div className="mx-auto w-full max-w-7xl px-2 lg:px-8">
                <div className="rounded-3xl border border-neutral-300 bg-gradient-to-br from-neutral-100 to-secondaryShades-6 p-2 md:p-7 lg:p-10">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
                        <SlideFromLeft>
                            <div className="lg:sticky lg:top-24 lg:self-start">
                                <p className="mb-4 md:mb-8 inline-flex rounded-full bg-secondary-5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">FAQ mock-exams</p>
                                <h2 className="display-2 mb-3">
                                    Vos <span className="heading-span-secondary-5">questions</span>,
                                    <br />
                                    nos réponses
                                </h2>
                                <p className="mb-0 max-w-md text-base text-neutral-700 md:text-lg">Les points essentiels avant de démarrer votre premier examen blanc.</p>
                            </div>
                        </SlideFromLeft>

                        <SlideFromRight>
                            <div className="rounded-2xl border border-neutral-300 bg-neutral-100 p-2 md:p-3">
                                <FideFaq showHeader={false} variant="thin" maxWidthClassName="max-w-none" className="px-0" items={mockExamFaqItems} />
                            </div>
                        </SlideFromRight>
                    </div>
                </div>
            </div>
        </section>
    );
}
