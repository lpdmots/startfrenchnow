import { Clock3, Target, CheckCircle2 } from "lucide-react";
import { FideLiteYoutubeEmbed } from "./FideLiteYoutubeEmbed";
import LinkArrow from "@/app/components/common/LinkArrow";

export function FidePageOverviewSection() {
    return (
        <section id="fide-overview" className="py-16 lg:py-24 bg-neutral-800">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h2 className="display-2 mb-8 lg:mb-12 text-neutral-100 text-center">
                    Qu'est-ce que le <span className="heading-span-secondary-6">test FIDE</span> ?
                </h2>
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                    <div className="order-1 mb-8 lg:mb-12">
                        <FideLiteYoutubeEmbed id="Cc78NsVrKNY" title="Le test FIDE : Présentation Générale" />
                    </div>

                    <div className="order-2">
                        <p className="mb-4 text-neutral-200">
                            Le test FIDE évalue votre français dans des situations réelles du quotidien en Suisse. Il est demandé notamment pour le
                            <strong> permis B</strong>, le <strong>permis C</strong> ou la <strong>naturalisation</strong>.
                        </p>
                        <p className="mb-5 text-neutral-200">
                            Vous ne choisissez pas un niveau à l'inscription: le résultat vous positionne entre <strong>A1 et B1</strong>. Les résultats sont séparés entre oral et écrit, ce qui
                            permet de repasser uniquement la partie non validée.
                        </p>

                        <div className="mb-5">
                            <ul className="mb-0 list-none pl-0 space-y-3">
                                <li className="flex items-start gap-3 text-neutral-200">
                                    <div className="bullet bg-secondary-6 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <p className="mb-0">
                                        <strong>Épreuve orale (40 minutes)</strong> : parler et comprendre.
                                    </p>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-200">
                                    <div className="bullet bg-secondary-2 mt-[1px] md:mt-1 shrink-0 scale-[0.85]"></div>
                                    <p className="mb-0">
                                        <strong>Épreuve écrite (1 heure)</strong> : lire et écrire.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mb-5 flex flex-wrap gap-2">
                    <p className="text-lg underline decoration-secondary-2 text-neutral-200">Quelques situations courantes :</p>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">logement</span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">travail</span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">transports</span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">santé</span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-200 font-bold px-3 py-1 text-sm text-neutral-700">poste / banque</span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-600 bg-neutral-200 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-6" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-6">
                                <Clock3 className="h-4 w-4 text-secondary-6" />
                            </span>
                            <p className="mb-0 font-semibold text-neutral-800">Niveau A1</p>
                        </div>
                        <p className="mb-0 text-neutral-700">Communication très simple dans des situations immédiates.</p>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-600 bg-neutral-200 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5">
                                <Target className="h-4 w-4 text-secondary-5" />
                            </span>
                            <p className="mb-0 font-semibold text-neutral-800">Niveau A2</p>
                        </div>
                        <p className="mb-0 text-neutral-700">Échanges habituels du quotidien avec plus d'autonomie.</p>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-600 bg-neutral-200 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2">
                                <CheckCircle2 className="h-4 w-4 text-secondary-2" />
                            </span>
                            <p className="mb-0 font-semibold text-neutral-800">Niveau B1</p>
                        </div>
                        <p className="mb-0 text-neutral-700">Réponses plus développées dans des situations variées.</p>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="mb-0 text-neutral-300 text-sm">
                        Besoin d'un accompagnement pour l'oral ?{" "}
                        <LinkArrow url="/fide/private-courses" target="_self" className="!text-neutral-100 hover:!text-secondary-2 text-sm font-semibold inline-flex">
                            Voir les cours privés
                        </LinkArrow>
                    </p>
                    <LinkArrow url="/blog/post/1-votre-guide-pratique-pour-reussir-le-test-fide" target="_self" className="!text-neutral-100 hover:!text-secondary-2 !text-xl font-semibold">
                        Lire le guide complet
                    </LinkArrow>
                </div>
            </div>
        </section>
    );
}
