import { FideLiteYoutubeEmbed } from "./FideLiteYoutubeEmbed";
import { FideStickyScrollReveal } from "./FideStickyScrollReveal";
import LinkArrow from "@/app/components/common/LinkArrow";

export function FidePageStickyExamsSection() {
    const stickyItems = [
        {
            id: "fide-oral-speaking",
            content: (
                <>
                    <h3 className="text-2xl md:text-4xl font-bold leading-tight mb-4">Partie Orale : Parler</h3>
                    <div className="space-y-4">
                        <p className="mb-0 text-neutral-700 text-justify">
                            La partie <strong>« Parler »</strong> est l'épreuve orale la plus importante et la plus exigeante du test FIDE. Elle dure environ <strong>15 à 20 minutes</strong> avec
                            <strong> deux examinateurs</strong>: l'un pose les questions, l'autre observe et évalue. L'épreuve commence toujours au <strong>niveau A2</strong>, puis vous êtes orienté
                            vers
                            <strong> A1</strong> ou <strong>B1</strong> selon votre performance.
                        </p>

                        <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 shadow-sm">
                            <p className="mb-2 font-bold text-neutral-800">Les 3 tâches du niveau A2</p>
                            <ul className="mb-0 list-none pl-0 space-y-2">
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>Description d'image</strong>: personnes, lieu, actions et problème éventuel.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>Jeu de rôle</strong>: souvent une conversation téléphonique (annuler, déplacer un rendez-vous, etc.).
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>Questions générales</strong> sur un thème pour parler de vos habitudes, préférences et expériences.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <p className="mb-0 text-neutral-700 text-justify">
                            Si le niveau A2 est bien réussi, vous accédez au <strong>niveau B1</strong>. À ce stade, vous choisissez entre deux thèmes et répondez à des questions plus développées:
                            raconter une expérience passée, présenter des avantages et inconvénients, et répondre à des questions hypothétiques (souvent avec le conditionnel).
                        </p>

                        <p className="mb-0 text-neutral-700 text-justify">
                            Les compétences clés à maîtriser sont: <strong>décrire clairement une situation</strong>, interagir dans un contexte courant, parler de soi, raconter un événement passé et
                            développer une réponse nuancée au niveau B1. Cette partie représente une part majeure de l'évaluation orale, donc la préparation est stratégique.
                        </p>

                        <p className="mb-0 text-neutral-700 text-justify">
                            Le conseil principal: s'entraîner avec un professeur, surtout pour sécuriser les tâches A2 qui conditionnent à la fois la note globale et l'accès au niveau B1.
                        </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-neutral-600">
                            Besoin d'un entraînement guidé ?{" "}
                            <LinkArrow url="/fide/private-courses" target="_self" className="text-sm font-semibold !text-secondary-2 hover:!text-secondary-2 inline-flex">
                                Coaching privé
                            </LinkArrow>
                        </span>
                        <LinkArrow url="/blog/post/2-le-test-fide-la-partie-orale-parler" target="_self" className="text-lg font-semibold text-secondary-2 hover:!text-secondary-2">
                            Lire le guide complet
                        </LinkArrow>
                    </div>
                </>
            ),
            media: <FideLiteYoutubeEmbed id="HJ0gjYlbmAw" title="Le test FIDE : La Partie Orale - Parler" />,
        },
        {
            id: "fide-oral-listening",
            content: (
                <>
                    <h3 className="text-2xl md:text-4xl font-bold leading-tight mb-4">Partie Orale : Comprendre</h3>
                    <div className="space-y-4">
                        <p className="mb-0 text-neutral-700 text-justify">
                            La partie <strong>« Comprendre »</strong> évalue la compréhension orale sur trois niveaux possibles: <strong>A1</strong>, <strong>A2</strong> et <strong>B1</strong>. Le
                            niveau proposé dépend de votre performance à l'épreuve orale précédente. L'objectif est de vérifier votre capacité à comprendre des situations concrètes de la vie
                            quotidienne.
                        </p>

                        <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 shadow-sm">
                            <p className="mb-2 font-bold text-neutral-800">Format selon le niveau</p>
                            <ul className="mb-0 list-none pl-0 space-y-2">
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>A1</strong>: courts enregistrements liés à des scènes illustrées, 3 questions par situation, réponse en choisissant l'image correcte. Audio écoutable
                                        deux fois.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>A2</strong>: format proche du A1, mais avec des situations plus complexes, des enregistrements plus longs et des distracteurs.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>B1</strong>: audios plus naturels et plus longs, réponse orale en phrase complète à partir des informations entendues.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <p className="mb-0 text-neutral-700 text-justify">
                            Stratégies recommandées: demander une deuxième écoute si nécessaire, observer précisément les illustrations, faire confiance à sa première impression, et réviser les
                            <strong> nombres</strong>, <strong>heures</strong> et <strong>dates</strong>, très fréquents dans l'épreuve.
                        </p>

                        <p className="mb-0 text-neutral-700 text-justify">
                            La compréhension orale représente <strong>un tiers de la note globale de l'oral</strong>, tandis que l'expression orale compte pour les deux tiers restants.
                        </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-neutral-600">
                            S'entraîner au format exact ?{" "}
                            <LinkArrow url="/fide/mock-exams" target="_self" className="text-sm font-semibold !text-secondary-5 hover:!text-secondary-5 inline-flex">
                                Examens blancs
                            </LinkArrow>
                        </span>
                        <LinkArrow url="/blog/post/3-le-test-fide-la-partie-orale-comprendre" target="_self" className="text-lg font-semibold text-secondary-2 hover:!text-secondary-2">
                            Lire le guide complet
                        </LinkArrow>
                    </div>
                </>
            ),
            media: <FideLiteYoutubeEmbed id="q2ov3ONIszw" title="Le test FIDE : La Partie Orale - Comprendre" />,
        },
        {
            id: "fide-read-write",
            content: (
                <>
                    <h3 className="text-2xl md:text-4xl font-bold leading-tight mb-4">Lire et Écrire</h3>
                    <div className="space-y-4">
                        <p className="mb-0 text-neutral-700 text-justify">
                            La partie <strong>« Lire et Écrire »</strong> est généralement plus accessible que l'oral, car les tâches sont plus structurées et plus prévisibles. Le niveau maximal
                            attendu est souvent <strong>A2</strong>, ce qui la rend plus abordable pour les candidats qui ont déjà une base en français.
                        </p>
                        <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 shadow-sm">
                            <p className="mb-2 font-bold text-neutral-800">Structure de l'épreuve écrite</p>
                            <ul className="mb-0 list-none pl-0 space-y-2">
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>Durée</strong>: environ 60 minutes.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>Modules</strong>: selon le niveau visé, modules 1 à 3 ou modules 4 à 6.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-neutral-700">
                                    <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <span>
                                        <strong>Dans chaque module</strong>: compréhension écrite + production écrite.
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <p className="mb-0 text-neutral-700 text-justify">
                            Les tâches sont variées mais claires:{" "}
                            <i>repérer et recopier des informations, remplir un formulaire, répondre à un email ou rédiger une lettre simple, choisir le bon résumé d'un document</i>.
                        </p>
                        <p>
                            L'objectif est d'évaluer <b>la compréhension d'écrits pratiques</b> et la capacité à <b>produire des messages simples</b> mais adaptés.
                        </p>
                        <p className="mb-0 text-neutral-700 text-justify">
                            Pour progresser, nous vous conseillons de vous entraîner avec des examens blancs et leurs corrigés, puis de répéter les formats clés: formulaires, extraction d'informations
                            précises et rédaction de messages courts en respectant strictement les consignes.
                        </p>
                        <p className="mb-0 text-neutral-700 text-justify">
                            En résumé, cette partie repose surtout sur la <strong>méthode</strong>, la <strong>compréhension des consignes</strong> et l'<strong>entraînement pratique</strong>, ce qui
                            en fait souvent une épreuve plus facile à réussir que l'oral.
                        </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-neutral-600">
                            Réviser à votre rythme ?{" "}
                            <LinkArrow url="/fide/pack-fide" target="_self" className="text-sm font-semibold !text-secondary-6 hover:!text-secondary-6 inline-flex">
                                Pack FIDE
                            </LinkArrow>
                        </span>
                        <LinkArrow url="/blog/post/4-le-test-fide-lire-et-ecrire" target="_self" className="text-lg font-semibold text-secondary-2 hover:!text-secondary-2">
                            Lire le guide complet
                        </LinkArrow>
                    </div>
                </>
            ),
            media: <FideLiteYoutubeEmbed id="aSyBOLTKkcc" title="Le test FIDE : Lire et Écrire" />,
        },
    ];

    return (
        <section id="whatIsFIDE" className="py-16 lg:py-24 bg-neutral-200">
            <FideStickyScrollReveal
                items={stickyItems}
                activationOffset={0.04}
                sectionTitle={
                    <>
                        <span className="heading-span-secondary-2">Les épreuves</span> du test FIDE
                    </>
                }
                sectionSubtitle="Trois épreuves, trois formats : découvrez ce qui vous attend et comment vous préparer efficacement."
            />
        </section>
    );
}
