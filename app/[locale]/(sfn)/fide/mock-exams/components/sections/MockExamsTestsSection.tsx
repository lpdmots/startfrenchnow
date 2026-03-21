import { ChevronRight, CircleCheck, CircleDot, FileText, MessageSquare } from "lucide-react";
import Image from "next/image";

export function MockExamsTestsSection() {
    return (
        <section id="mock-exams-tests" className="bg-neutral-800 py-14 text-neutral-100 lg:py-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] lg:gap-12">
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <p className="mb-2 inline-flex rounded-full bg-secondaryShades-1 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">Épreuves FIDE</p>
                        <h2 className="display-2 mb-4 text-neutral-100">
                            Les mêmes <span className="heading-span-secondary-1">épreuves</span> que dans l&apos;examen FIDE ?
                        </h2>
                        <p className="mb-4 text-base text-neutral-200 md:text-lg">
                            Oui. Vous retrouvez la même logique de passation: nous découpons l&apos;examen en épreuves et vous vous entraînez avec les mêmes types de tâches.
                        </p>
                        <div className="space-y-2">
                            <p className="mb-0 flex items-start gap-2 text-sm text-neutral-200">
                                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary-5" />
                                <span>Même structure globale et progression par épreuve</span>
                            </p>
                            <p className="mb-0 flex items-start gap-2 text-sm text-neutral-200">
                                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary-5" />
                                <span>Interface guidée pour passer chaque partie clairement</span>
                            </p>
                            <p className="mb-0 flex items-start gap-2 text-sm text-neutral-200">
                                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary-5" />
                                <span>Chronologie réaliste pour vous mettre en conditions</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:gap-12">
                        <article className="rounded-2xl  bg-neutral-800">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-secondaryShades-4 px-2 text-lg font-semibold text-neutral-800">01</span>
                                <MessageSquare className="h-8 w-8 text-secondary-4" />
                                <p className="mb-0 text-xl font-bold uppercase">Parler</p>
                            </div>
                            <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3">
                                <div className="min-w-0 rounded-xl border border-solid border-neutral-400 p-3">
                                    <p className="mb-1 inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">Dans l&apos;examen</p>
                                    <p className="mb-0 text-base text-neutral-200">Vous préparez une réponse sur un scénario concret, puis vous prenez la parole de manière structurée.</p>
                                </div>
                                <div className="hidden justify-center lg:flex">
                                    <ChevronRight className="h-6 w-6 text-neutral-400" />
                                </div>
                                <div className="min-w-0 rounded-xl border border-solid border-secondary-4 p-3">
                                    <p className="mb-1 inline-flex rounded-full bg-secondaryShades-4 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">Dans l&apos;app</p>
                                    <p className="mb-0 text-base text-neutral-200">
                                        Vous enregistrez votre audio ou vous conversez en situation réelle avec l&apos;IA selon le type d&apos;exercice.
                                    </p>
                                </div>
                            </div>
                            <Image src="/images/parler-mock-exam.png" alt="Capture de l'épreuve de production orale" width={760} height={680} className="h-auto w-full object-contain rounded-lg" />
                        </article>

                        <article className="rounded-2xl bg-neutral-800">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-secondaryShades-2 px-2 text-lg font-semibold text-neutral-800">02</span>
                                <CircleDot className="h-8 w-8 text-secondary-2" />
                                <p className="mb-0 text-xl font-bold uppercase">Comprendre</p>
                            </div>
                            <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3">
                                <div className="min-w-0 rounded-xl border border-solid border-neutral-400 p-3">
                                    <p className="mb-1 inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">Dans l&apos;examen</p>
                                    <p className="mb-0 text-base text-neutral-200">Vous écoutez une situation et un audio, puis vous répondez en respectant les consignes.</p>
                                </div>
                                <div className="hidden justify-center lg:flex">
                                    <ChevronRight className="h-6 w-6 text-neutral-400" />
                                </div>
                                <div className="min-w-0 rounded-xl border border-solid border-secondary-2 p-3">
                                    <p className="mb-1 inline-flex rounded-full bg-secondaryShades-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">Dans l&apos;app</p>
                                    <p className="mb-0 text-base text-neutral-200">En A1-A2, vous répondez avec des visuels guidés (dessins/images). En B1, vous répondez par audio.</p>
                                </div>
                            </div>
                            <Image
                                src="/images/comprendre-mock-exam.png"
                                alt="Capture de l'épreuve de compréhension orale"
                                width={760}
                                height={680}
                                className="h-auto w-full object-contain rounded-lg"
                            />
                        </article>

                        <article className="rounded-2xl bg-neutral-800">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-secondaryShades-5 px-2 text-lg font-semibold text-neutral-800">03</span>
                                <FileText className="h-8 w-8 text-secondary-5" />
                                <p className="mb-0 text-xl font-bold uppercase">Lire / Écrire</p>
                            </div>
                            <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3">
                                <div className="min-w-0 rounded-xl border border-solid border-neutral-400 p-3">
                                    <p className="mb-1 inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">Dans l&apos;examen</p>
                                    <p className="mb-0 text-base text-neutral-200">Vous lisez des consignes et des documents, puis vous rédigez un écrit adapté à la situation demandée.</p>
                                </div>
                                <div className="hidden justify-center lg:flex">
                                    <ChevronRight className="h-6 w-6 text-neutral-400" />
                                </div>
                                <div className="min-w-0 rounded-xl border border-solid border-secondary-5 p-3">
                                    <p className="mb-1 inline-flex rounded-full bg-secondaryShades-5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800">Dans l&apos;app</p>
                                    <p className="mb-0 text-base text-neutral-200">Lecture, questions et zone de rédaction sont réunies dans un seul parcours clair pour rester concentré.</p>
                                </div>
                            </div>
                            <Image
                                src="/images/lire-ecrire-mock-exam.png"
                                alt="Capture de l'épreuve de lecture / écriture"
                                width={760}
                                height={680}
                                className="h-auto w-full object-contain rounded-lg"
                            />
                        </article>
                    </div>
                </div>
            </div>
        </section>
    );
}
