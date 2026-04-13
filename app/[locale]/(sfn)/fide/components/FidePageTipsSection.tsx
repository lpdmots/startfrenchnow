import { FideLiteYoutubeEmbed } from "./FideLiteYoutubeEmbed";
import LinkArrow from "@/app/components/common/LinkArrow";

export function FidePageTipsSection() {
    return (
        <section id="fide-tips" className="py-16 lg:py-24 bg-neutral-800">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h2 className="display-2 mb-4 text-neutral-100">
                    <span className="heading-span-secondary-5">Conseils</span> et stratégies pour le jour J
                </h2>
                <p className="mb-0 text-neutral-200 text-justify">
                    Préparer le FIDE, c'est surtout répéter les bonnes situations et adopter une méthode stable. <br />
                    <b className="underline decoration-2 decoration-secondary-5">L'objectif :</b> arriver serein, comprendre rapidement les consignes, et répondre avec précision à l'oral comme à
                    l'écrit.
                </p>

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
                    <div>
                        <FideLiteYoutubeEmbed id="wMv-bzxLmnk" title="Le test FIDE : Conseils et stratégies" />
                    </div>

                    <div className="space-y-6">
                        <div className="pl-4 border-l-4 border-secondary-6">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">Préparation ciblée</p>
                            <p className="mb-0 text-neutral-200">
                                Travaillez en priorité les <span className="underline decoration-2 decoration-secondary-5">thèmes du quotidien</span>, avec des supports basés sur des{" "}
                                <span className="underline decoration-2 decoration-secondary-5">scénarios concrets</span>.
                            </p>
                        </div>
                        <div className="pl-4 border-l-4 border-secondary-2">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">Format exact</p>
                            <p className="mb-0 text-neutral-200">
                                Entraînez-vous avec des{" "}
                                <LinkArrow url="/fide/mock-exams" target="_self" className="!text-lg font-semibold !text-secondary-5 hover:!text-secondary-5 inline-flex">
                                    examens blancs FIDE
                                </LinkArrow>
                                , puis complétez avec du <span className="underline decoration-2 decoration-secondary-5">DELF A1/A2/B1</span> pour renforcer compréhension et production.
                            </p>
                        </div>
                        <div className="pl-4 border-l-4 border-secondary-5">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-300">Travail de l'oral</p>
                            <p className="mb-0 text-neutral-200">
                                Pratiquez avec un professeur: <span className="underline decoration-2 decoration-secondary-5">scénarios fréquents</span>, questions possibles, formulations utiles et{" "}
                                <span className="underline decoration-2 decoration-secondary-5">questions d'introduction</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-2">
                    <div>
                        <p className="mb-3 text-xl font-semibold text-neutral-100">Points clés à réviser</p>
                        <ul className="mb-0 list-none pl-0 space-y-3">
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    <span className="underline decoration-2 decoration-secondary-5">Description d'image et jeu de rôle</span>: préparez des structures simples et réutilisables.
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-5 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    <span className="underline decoration-2 decoration-secondary-5">Temps verbaux essentiels</span>: présent, passé composé, imparfait, futur et conditionnel (B1).
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    <span className="underline decoration-2 decoration-secondary-5">Compréhension orale</span>: exploitez la deuxième écoute et ciblez dates, heures, nombres.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-3 text-xl font-semibold text-neutral-100">Le jour de l'examen</p>
                        <ul className="mb-0 list-none pl-0 space-y-3">
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-4 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    <span className="underline decoration-2 decoration-secondary-5">Restez calme</span>, articulez, et demandez de répéter si nécessaire.
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-1 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    À l'écrit, <span className="underline decoration-2 decoration-secondary-5">lisez les consignes jusqu'au bout</span> et répondez exactement à la demande.
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-neutral-200">
                                <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                <span>
                                    Gardez <span className="underline decoration-2 decoration-secondary-5">2 minutes de relecture finale</span> pour corriger les fautes évitables.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <LinkArrow url="/blog/post/7-le-test-fide-conseils-et-strategies" target="_self" className="text-xl font-semibold !text-neutral-100 hover:!text-secondary-5">
                        Lire l'article complet : conseils et stratégies
                    </LinkArrow>
                </div>
            </div>
        </section>
    );
}
