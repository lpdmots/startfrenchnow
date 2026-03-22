"use client";

import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { m } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { VideoFide } from "../../../components/VideoFide";

const stepsContainer = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.1,
            staggerChildren: 0.1,
        },
    },
};

const stepItem = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: "easeOut",
        },
    },
};

export function MockExamsOnlineSection() {
    const callbackUrl = "/fide/mock-exams";
    const checkoutUrl = `/checkout/mock_exam?${new URLSearchParams({
        quantity: "1",
        callbackUrl,
    }).toString()}`;

    const handleCheckout = () => {
        window.location.assign(checkoutUrl);
    };

    return (
        <section id="mock-exams-video" className="py-14 lg:py-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <SlideFromBottom delay={0.05} duration={0.35}>
                    <div className="mx-auto mb-8 max-w-4xl text-center">
                        <p className="mb-2 inline-flex rounded-full bg-secondary-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">Aperçu en ligne</p>
                        <h2 className="display-2 mb-3">
                            Passation du test FIDE <span className="heading-span-secondary-2">en ligne</span> ?
                        </h2>
                        <p className="mb-0 text-base text-neutral-700 md:text-lg">Oui, tout se fait en ligne pour vous guider clairement du début à la fin de l&apos;examen blanc.</p>
                    </div>
                </SlideFromBottom>

                <Fade delay={0.15} duration={0.35}>
                    <div className="mb-4 flex w-full justify-center md:mb-8">
                        <ShimmerButton type="button" onClick={handleCheckout} className="btn btn-primary small inline-flex w-full items-center justify-center gap-2 sm:w-auto" variant="primary">
                            Acheter l&apos;examen blanc - 10 CHF
                            <ArrowRight className="h-4 w-4" />
                        </ShimmerButton>
                    </div>
                </Fade>

                <SlideFromBottom delay={0.1} duration={0.4}>
                    <div className="mx-auto w-full max-w-[860px]">
                        <VideoFide videoKey="fide/videopresentation-soustitres-encode.mp4" poster="/images/fide-presentation-thumbnail.png" isAnimated={false} />
                    </div>
                </SlideFromBottom>

                <m.div
                    className="mx-auto grid max-w-5xl grid-cols-1 gap-3 pt-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch lg:gap-4 lg:pt-16"
                    variants={stepsContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <m.article variants={stepItem} className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2 text-sm font-semibold text-neutral-800">1</span>
                            <p className="mb-0 text-base font-bold text-neutral-800">Achat & accès immédiat</p>
                        </div>
                        <p className="mb-0 text-sm text-neutral-700">
                            Dès l&apos;achat, vous accédez à <b className="text-secondary-2">l&apos;application web</b>, aux <b className="text-secondary-2">PDF</b> et aux ressources <b className="text-secondary-2">vidéos</b> liées.
                        </p>
                    </m.article>

                    <m.div variants={stepItem} className="flex items-center justify-center text-neutral-500 lg:text-neutral-400">
                        <ChevronDown className="h-5 w-5 lg:hidden" />
                        <ChevronRight className="hidden h-5 w-5 lg:block" />
                    </m.div>

                    <m.article variants={stepItem} className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5 text-sm font-semibold text-neutral-800">2</span>
                            <p className="mb-0 text-base font-bold text-neutral-800">Passation 100% en ligne</p>
                        </div>
                        <p className="mb-0 text-sm text-neutral-700">
                            Vous suivez un <b className="text-secondary-5">parcours guidé</b> étape par étape, avec des consignes <b className="text-secondary-5">claires</b> du début à la fin.
                        </p>
                    </m.article>

                    <m.div variants={stepItem} className="flex items-center justify-center text-neutral-500 lg:text-neutral-400">
                        <ChevronDown className="h-5 w-5 lg:hidden" />
                        <ChevronRight className="hidden h-5 w-5 lg:block" />
                    </m.div>

                    <m.article variants={stepItem} className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-6" />
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-4 text-sm font-semibold text-neutral-800">3</span>
                            <p className="mb-0 text-base font-bold text-neutral-800">Feedback sans engagement</p>
                        </div>
                        <p className="mb-0 text-sm text-neutral-700">
                            Recevez un retour automatique immédiat, puis un <b className="text-secondary-6">retour professeur</b> sur demande.
                        </p>
                    </m.article>
                </m.div>
            </div>
        </section>
    );
}
