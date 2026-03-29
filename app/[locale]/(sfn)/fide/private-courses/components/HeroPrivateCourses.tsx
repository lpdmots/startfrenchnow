import { CheckCircle2, Clock3, MessageCircle, Target } from "lucide-react";
import Image from "next/image";
import Link from "next-intl/link";
import { BookFirstMeeting } from "../../components/BookFirstMeeting";
import { FideCourseRatings } from "@/app/components/sfn/courses/FideCourseRatings";

export function HeroPrivateCourses() {
    return (
        <section id="HeroPrivateCourses" className="section hero v1 wf-section relative isolate overflow-hidden !pt-6 !pb-8 lg:!pb-10">
            <div className="pointer-events-none absolute -z-10 -left-20 top-2 h-64 w-64 rounded-full bg-secondary-2/20 blur-3xl" />
            <div className="pointer-events-none absolute -z-10 right-0 top-1/3 h-72 w-72 rounded-full bg-secondary-5/20 blur-3xl" />

            <div className="relative z-0 w-full px-4 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-12">
                        <div className="flex flex-col gap-5 lg:gap-12">
                            <h1 className="display-1 mb-0 whitespace-nowrap text-center leading-[1.03] lg:text-left" style={{ whiteSpace: "nowrap" }}>
                                Préparez le test
                                <br />
                                FIDE avec <br />
                                des cours
                                <br /> <span className="heading-span-secondary-2">privés</span>
                            </h1>
                            <p className="mb-0 text-center text-base text-neutral-700 sm:text-lg lg:text-left">
                                Un coaching 1:1 centré sur vos blocages réels pour arriver prêt le jour de l&apos;examen.
                            </p>
                            <div className="flex no-wrap items-center justify-center gap-3 lg:justify-start w-full">
                                <Link href="#plans" className="btn btn-secondary small !py-5 shrink-0">
                                    Voir les formules
                                </Link>
                                <BookFirstMeeting label="Entretien gratuit" small={true} />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="mx-auto hidden w-full max-w-[860px] lg:grid lg:grid-cols-[350px_minmax(260px,360px)] lg:items-center lg:justify-center lg:gap-8">
                                <div className="flex justify-center pt-12">
                                    <div className="relative h-[340px] w-[340px] overflow-hidden rounded-full border-2 border-solid border-neutral-800 bg-neutral-100 shadow-1">
                                        <Image src="/images/yoh-coussot.png" alt="Yohann Coussot" fill className="object-cover" />
                                    </div>
                                </div>
                                <div className="grid h-[520px] grid-rows-4 gap-8">
                                    <article
                                        className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md"
                                        style={{ transform: "translate(-90px, 0px)" }}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2">
                                                <Target className="h-4 w-4 text-secondary-2" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">Plan personnalisé</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">Objectifs clairs dès la 1re séance.</p>
                                    </article>

                                    <article
                                        className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md"
                                        style={{ transform: "translate(0px, 0px)" }}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5">
                                                <MessageCircle className="h-4 w-4 text-secondary-5" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">Scénarios actuels</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">Pratique orale ciblée A1-A2 / A2-B1.</p>
                                    </article>

                                    <article
                                        className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md"
                                        style={{ transform: "translate(30px, 0px)" }}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-4" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-4">
                                                <CheckCircle2 className="h-4 w-4 text-secondary-4" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">Feedback direct</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">Corrections concrètes et actionnables.</p>
                                    </article>

                                    <article
                                        className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md"
                                        style={{ transform: "translate(-20px, 0px)" }}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-1" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-1">
                                                <Clock3 className="h-4 w-4 text-secondary-1" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">Flexible</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">Réservation possible rapidement.</p>
                                    </article>
                                </div>
                            </div>

                            <div className="mx-auto flex w-full max-w-[460px] flex-col items-center gap-4 lg:hidden">
                                <div className="relative h-56 w-56 overflow-hidden rounded-full border-2 border-solid border-neutral-800 bg-neutral-100 shadow-1">
                                    <Image src="/images/yoh-coussot.png" alt="Yohann Coussot" fill className="object-cover" />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <article className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2">
                                                <Target className="h-4 w-4 text-secondary-2" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">Plan personnalisé</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">Objectifs clairs dès la 1re séance.</p>
                                    </article>
                                    <article className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5">
                                                <MessageCircle className="h-4 w-4 text-secondary-5" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">Scénarios actuels</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">Pratique orale ciblée A1-A2 / A2-B1.</p>
                                    </article>
                                    <article className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-4" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-4">
                                                <CheckCircle2 className="h-4 w-4 text-secondary-4" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">Feedback direct</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">Corrections concrètes et actionnables.</p>
                                    </article>
                                    <article className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-1" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-1">
                                                <Clock3 className="h-4 w-4 text-secondary-1" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">Flexible</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">Réservation possible rapidement.</p>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center w-full">
                <div className="flex flex-wrap gap-6 justify-around items-center w-full pt-6 max-w-4xl">
                    <div className="flex justify-center items-center">
                        <FideCourseRatings />
                    </div>
                </div>
            </div>
        </section>
    );
}
