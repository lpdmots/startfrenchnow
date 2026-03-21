"use client";

import ShimmerButton from "@/app/components/ui/shimmer-button";
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";

export function MockExamsOfferSection() {
    const callbackUrl = "/fide/mock-exams";
    const checkoutUrl = `/checkout/mock_exam?${new URLSearchParams({
        quantity: "1",
        callbackUrl,
    }).toString()}`;
    const handleCheckout = () => {
        window.location.assign(checkoutUrl);
    };

    return (
        <section id="mock-exams-offer" className="bg-neutral-200 py-14 lg:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <div className="mx-auto mb-8 max-w-4xl text-center">
                    <p className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-secondary-6 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">
                        <Sparkles className="h-3.5 w-3.5" />
                        Tarifs
                    </p>
                    <h2 className="display-2 mb-3">
                        Offre <span className="heading-span-secondary-6">découverte</span>
                    </h2>
                    <p className="mb-0 text-base text-neutral-700 md:text-lg">Un seul achat disponible pour le moment: votre premier examen blanc complet à prix réduit.</p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:gap-6">
                    <article className="relative overflow-hidden rounded-3xl border-2 border-secondary-6 bg-neutral-100 p-5 shadow-lg md:p-7">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-secondaryShades-4 opacity-40" />
                        <div className="pointer-events-none absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-secondaryShades-4 opacity-30" />

                        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto] md:items-end">
                            <div>
                                <p className="mb-2 inline-flex rounded-full bg-secondaryShades-4 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">Offre active -80%</p>
                                <p className="mb-1 text-lg font-bold text-neutral-800">Premier achat</p>
                                <div className="mb-4 flex items-end gap-3 whitespace-nowrap">
                                    <p className="mb-0 text-5xl font-extrabold leading-none text-secondary-6 md:text-6xl">10 CHF</p>
                                    <p className="mb-0 text-base font-semibold text-neutral-500">
                                        au lieu de <span className="line-through">50 CHF</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <p className="mb-0 flex items-start gap-2 text-sm text-neutral-700">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-6" />
                                        <span>1 examen blanc complet en application web</span>
                                    </p>
                                    <p className="mb-0 flex items-start gap-2 text-sm text-neutral-700">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-6" />
                                        <span>Accès immédiat aux PDF et ressources vidéos liées</span>
                                    </p>
                                    <p className="mb-0 flex items-start gap-2 text-sm text-neutral-700">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-6" />
                                        <span>Feedback automatique sans engagement</span>
                                    </p>
                                </div>
                            </div>

                            <div className="md:pb-0.5">
                                <ShimmerButton type="button" onClick={handleCheckout} className="btn btn-primary small inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                                    Acheter maintenant - 10 CHF
                                    <ArrowRight className="h-4 w-4" />
                                </ShimmerButton>
                            </div>
                        </div>
                    </article>

                    <aside className="flex h-full flex-col justify-between rounded-3xl border-2 border-dashed border-neutral-400 bg-neutral-100 p-5 shadow-sm md:p-6">
                        <div>
                            <p className="mb-2 inline-flex rounded-full bg-neutral-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">Prix normal</p>
                            <p className="mb-1 text-lg font-bold text-neutral-800">Tarif standard</p>
                            <p className="mb-2 text-5xl font-extrabold leading-none text-neutral-800 md:text-6xl">50 CHF</p>
                            <p className="mb-0 text-sm text-neutral-700">Tarif standard d&apos;un examen blanc (hors offre découverte).</p>
                        </div>
                        <p className="mt-4 mb-0 inline-flex items-center gap-2 self-start rounded-full bg-neutral-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
                            <Clock3 className="h-3.5 w-3.5" />
                            Prochainement
                        </p>
                    </aside>
                </div>

                <div className="mt-5 md:mt-12 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-neutral-700 lg:mt-6">
                    <span>
                        Paiement unique et sécurisé via <b>Stripe</b>
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span>
                        <b>Support</b> réactif via la messagerie du dashboard
                    </span>
                </div>
            </div>
        </section>
    );
}
